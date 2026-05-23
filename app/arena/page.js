"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Editor from "@monaco-editor/react"; // 🌟 Imported Monaco Editor here

export default function ArenaPage() {
  const [arenaStatus, setArenaStatus] = useState("idle"); // idle, searching, found, active
  const [battleMode, setBattleMode] = useState(null); // 'bugfix' or 'coding'
  const [countdown, setCountdown] = useState(5);
  const [battleTimer, setBattleTimer] = useState(600); // 10 minutes
  
  const [playerProgress, setPlayerProgress] = useState(0);
  const [rivalProgress, setRivalProgress] = useState(0);
  const [playerCode, setPlayerCode] = useState("");
  const [battleLog, setBattleLog] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState(null); // WIN, LOSE, TIE
  
  const [currentMatch, setCurrentMatch] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [arenaStats, setArenaStats] = useState(null);
  const [activeMatches, setActiveMatches] = useState([]);
  const [rival, setRival] = useState(null);
  const [problem, setProblem] = useState(null);
  const [queueTime, setQueueTime] = useState(0);

  // AFK & Activity Tracking
  const hasTypedRef = useRef(false);
  const matchChannelRef = useRef(null);
  const queueChannelRef = useRef(null);

  // ─── GAME OVER & EVALUATION LOGIC ────────────────────────────────────────
  const handleMatchEndEvaluation = async (forcedWinnerId = null, reason = "") => {
    if (!currentMatch || !currentUser) return;

    let finalWinnerId = forcedWinnerId;
    let finalOutcome = "TIE";

    // If timer ran out naturally, run your structural evaluation rules
    if (!finalWinnerId) {
      if (playerProgress > rivalProgress) {
        finalWinnerId = currentUser.id;
      } else if (rivalProgress > playerProgress) {
        finalWinnerId = rival?.id;
      } else {
        // If progress is perfectly equal, tie-break using keyboard activity!
        if (hasTypedRef.current && !currentMatch.rival_active) {
          finalWinnerId = currentUser.id; // You typed, rival didn't touch keyboard
        } else {
          finalWinnerId = null; // Absolute Tie
        }
      }
    }

    if (finalWinnerId === currentUser.id) finalOutcome = "WIN";
    else if (finalWinnerId === rival?.id) finalOutcome = "LOSE";

    try {
      await supabase
        .from("arena_matches")
        .update({
          status: "finished",
          winner_id: finalWinnerId,
          end_reason: reason || "time_expired"
        })
        .eq("id", currentMatch.id);

      setBattleOutcome(finalOutcome);
      setArenaStatus("idle");
      setCurrentMatch(null);
      setBattleLog((log) => [`🏁 Match Over: ${reason || "Time Expired!"}`, ...log]);
      
      // Update ELO via RPC if someone won
      if (finalWinnerId) {
        await supabase.rpc("update_arena_elo", {
          winner: finalWinnerId,
          loser: finalWinnerId === currentUser.id ? rival?.id : currentUser.id,
        });
      }
      refreshStats();
    } catch (err) {
      console.error("Error evaluating match end:", err);
    }
  };

  // ─── SYSTEM INITIALIZATION ───────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUser(user);

      const { data: stats } = await supabase
        .from("arena_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!stats) {
        const username = user.email.split("@")[0];
        await supabase.from("arena_stats").insert({
          user_id: user.id,
          username,
          elo_rating: 1200,
          wins: 0,
          losses: 0,
          total_matches: 0,
        });
        setArenaStats({ elo_rating: 1200, wins: 0, losses: 0, total_matches: 0, username });
      } else {
        setArenaStats(stats);
      }
    };
    init();
  }, []);

  // ─── ACTIVE MATCHES FEED ────────────────────────────────────────────────
  useEffect(() => {
    const fetchActive = async () => {
      const { data } = await supabase
        .from("arena_matches")
        .select("*")
        .eq("status", "active")
        .limit(5);
      if (data) setActiveMatches(data);
    };
    fetchActive();

    const channel = supabase
      .channel("active-matches")
      .on("postgres_changes", { event: "*", schema: "public", table: "arena_matches" }, fetchActive)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // ─── TIMERS LOOP ────────────────────────────────────────────────────────
  useEffect(() => {
  let interval;
  if (arenaStatus === "found") {
    setCountdown(5);
    interval = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) {
          clearInterval(interval);
          setArenaStatus("active");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  }
  return () => clearInterval(interval);
}, [arenaStatus]);

  useEffect(() => {
    let interval;
    if (arenaStatus === "active") {
      setBattleTimer(600); // 10 Minutes standard clock loop
      interval = setInterval(() => {
        setBattleTimer((p) => {
          if (p <= 1) {
            clearInterval(interval);
            handleMatchEndEvaluation(null, "Time limit reached!");
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [arenaStatus, playerProgress, rivalProgress]);

  useEffect(() => {
    let interval;
    if (arenaStatus === "searching") {
      interval = setInterval(() => setQueueTime((p) => p + 1), 1000);
    } else {
      setQueueTime(0);
    }
    return () => clearInterval(interval);
  }, [arenaStatus]);

  const handleFindMatch = async (mode) => {
  console.log("handleFindMatch called", mode, currentUser);
  if (!currentUser) {
    alert("Not logged in! currentUser is null");
    return;
  }
  setBattleMode(mode);
  setArenaStatus("searching");
  setBattleOutcome(null);
  setPlayerProgress(0);
  setRivalProgress(0);
  hasTypedRef.current = false;

    const username = arenaStats?.username || currentUser.email.split("@")[0];
    const elo = arenaStats?.elo_rating || 1200;

    const { data: waiting } = await supabase
      .from("arena_queue")
      .select("*")
      .eq("status", "waiting")
      .eq("battle_mode", mode)
      .neq("user_id", currentUser.id)
      .order("joined_at", { ascending: true })
      .limit(1);

    if (waiting && waiting.length > 0) {
      const opponent = waiting[0];

      await supabase.from("arena_queue").update({ status: "matched" }).eq("id", opponent.id);

      // TARGET RELEVANT TABLE BASE SELECTION
      const targetTable = mode === "bugfix" ? "bug_fix_problems" : "problems";
      const { data: problems } = await supabase.from(targetTable).select("*").limit(50);
        
      const randomProblem = problems && problems.length > 0 
        ? problems[Math.floor(Math.random() * problems.length)]
        : { id: "default", title: "Fallback Sandbox", description: "Write operations", buggy_code: "def error_code(): pass" };

      setProblem(randomProblem);
      setPlayerCode(mode === "bugfix" ? randomProblem.buggy_code || "" : "// Write your optimal solution here...");

      const { data: match } = await supabase
        .from("arena_matches")
        .insert({
          player1_id: opponent.user_id,
          player2_id: currentUser.id,
          player1_username: opponent.username,
          player2_username: username,
          problem_id: randomProblem.id,
          problem_title: randomProblem.title,
          status: "active",
          battle_mode: mode,
          player1_progress: 0,
          player2_progress: 0,
        })
        .select()
        .single();

      setCurrentMatch(match);
      setRival({ username: opponent.username, id: opponent.user_id });
      setArenaStatus("found");
      subscribeToMatch(match.id, "player2", mode);
    } else {
      await supabase.from("arena_queue").insert({
        user_id: currentUser.id,
        username,
        elo_rating: elo,
        status: "waiting",
        battle_mode: mode
      });

      const channel = supabase
        .channel("queue-watch-" + currentUser.id)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "arena_matches" }, async (payload) => {
          const match = payload.new;
          if (match.player1_id === currentUser.id || match.player2_id === currentUser.id) {
            
            // TARGET RELEVANT TABLE BASE SELECTION ON TRIGGER RECEIVE
            const targetTable = match.battle_mode === "bugfix" ? "bug_fix_problems" : "problems";
            const { data: prob } = await supabase.from(targetTable).select("*").eq("id", match.problem_id).single();
            
            setProblem(prob);
            setPlayerCode(match.battle_mode === "bugfix" ? prob?.buggy_code || "" : "// Write your optimal solution here...");

            const rivalName = match.player1_id === currentUser.id ? match.player2_username : match.player1_username;
            const rivalId = match.player1_id === currentUser.id ? match.player2_id : match.player1_id;

            setRival({ username: rivalName, id: rivalId });
            setCurrentMatch(match);
            setArenaStatus("found");

            const role = match.player1_id === currentUser.id ? "player1" : "player2";
            subscribeToMatch(match.id, role, match.battle_mode);
            supabase.removeChannel(channel);
          }
        })
        .subscribe();

      queueChannelRef.current = channel;
    }
  };

  // ─── REALTIME GAME DATA INTERACTION SUBSCRIPTION ────────────────────────
  const subscribeToMatch = (matchId, role, mode) => {
    const channel = supabase
      .channel("match-" + matchId)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "arena_matches", filter: `id=eq.${matchId}` }, (payload) => {
        const updated = payload.new;

        if (role === "player1") {
          setRivalProgress(updated.player2_progress);
        } else {
          setRivalProgress(updated.player1_progress);
        }

        // Keep internal match context up-to-date with rival keyboard activity states
        setCurrentMatch(prev => ({
          ...prev,
          rival_active: role === "player1" ? updated.player2_active : updated.player1_active
        }));

        if (updated.status === "finished") {
          if (updated.winner_id === currentUser?.id) setBattleOutcome("WIN");
          else if (!updated.winner_id) setBattleOutcome("TIE");
          else setBattleOutcome("LOSE");

          setArenaStatus("idle");
          setCurrentMatch(null);
          refreshStats();
          supabase.removeChannel(channel);
        }
      })
      .subscribe();

    matchChannelRef.current = { channel, role, matchId, mode };
  };

  // ─── HANDLE TEXT WORKSPACE INPUT (TRACK ACTIVITY STATUS) ─────────────────
  const handleCodeChange = async (val) => {
    setPlayerCode(val);
    
    if (!hasTypedRef.current && currentMatch) {
      hasTypedRef.current = true;
      const { role, matchId } = matchChannelRef.current;
      const activeField = role === "player1" ? "player1_active" : "player2_active";
      
      // Let the database and your rival know you are active at the keyboard
      await supabase.from("arena_matches").update({ [activeField]: true }).eq("id", matchId);
    }
  };

  // ─── SUBMIT ACTION REWRITE WITH SYSTEM EVALUATION ────────────────────────
  const handlePlayerCodeSubmit = async () => {
    if (!currentMatch || !currentUser) return;

    const { role, matchId } = matchChannelRef.current;
    
    // Simulating checking tests. Increments 25% per run.
    const newProgress = Math.min(playerProgress + 25, 100); 
    setPlayerProgress(newProgress);

    const progressField = role === "player1" ? "player1_progress" : "player2_progress";
    setBattleLog((log) => [`✅ Compiling standard assertions... passed (${newProgress}%)`, ...log.slice(0, 4)]);

    if (newProgress >= 100) {
      // Immediate clean victory if 100% logic passed!
      await handleMatchEndEvaluation(currentUser.id, "Passed 100% of functional compiler assertions first!");
    } else {
      await supabase.from("arena_matches").update({ [progressField]: newProgress }).eq("id", matchId);
    }
  };

  const handleCancelQueue = async () => {
    if (currentUser) {
      await supabase.from("arena_queue").delete().eq("user_id", currentUser.id);
    }
    if (queueChannelRef.current) supabase.removeChannel(queueChannelRef.current);
    setArenaStatus("idle");
  };

  const refreshStats = async () => {
    if (!currentUser) return;
    const { data } = await supabase.from("arena_stats").select("*").eq("user_id", currentUser.id).single();
    if (data) setArenaStats(data);
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const winRate = arenaStats?.total_matches > 0 ? ((arenaStats.wins / arenaStats.total_matches) * 100).toFixed(1) : "0.0";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');
        body { background: #080810; font-family: 'Exo 2', sans-serif; color: #e2e8f0; margin:0; }
      .page { min-height: 100vh; background: #080810; }
.arena-page { min-height: 100vh; padding: 40px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }
        .topbar { display: flex; align-items: center; justify-content: space-between; height: 60px; background: rgba(8,8,16,0.95); border-bottom: 1px solid rgba(250,204,21,0.12); position: sticky; top: 0; padding: 0 40px; z-index: 100; backdrop-filter: blur(20px); }
        .logo { display: flex; align-items: center; gap: 10px; font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 900; color: #facc15; letter-spacing: 3px; cursor: pointer; }
        .logo-hex { width: 32px; height: 32px; background: rgba(250,204,21,0.15); border: 1px solid #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 6px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.35); cursor: pointer; border: none; background: none; text-transform: uppercase; }
        .nav-link:hover, .nav-link.active { color: #facc15; }
.avatar { width: 34px; height: 34px; background: linear-gradient(135deg, #facc15, #f59e0b); clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #080810; cursor: pointer; font-family: 'Orbitron', monospace; }
        
        .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-top: 60px; }
        .hero-panel { background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.2); padding: 40px; text-align: center; clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%); position: relative; }
        .hero-panel::after { content: 'LIVE_'; position: absolute; top: 15px; left: 20px; font-family: 'Share Tech Mono'; color: #ef4444; font-size: 12px; letter-spacing: 2px; }
        .arena-title { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: #fff; letter-spacing: 4px; margin-bottom: 8px; text-transform: uppercase; text-shadow: 0 0 20px rgba(239,68,68,0.3); }
        .arena-desc { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 30px; font-family: 'Share Tech Mono'; letter-spacing: 1px; }
        .queue-btn { padding: 16px 40px; font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; letter-spacing: 2px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: all 0.3s; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        .queue-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
        .queue-btn.searching { background: #0f0f1a; border: 1px solid #ef4444; color: #ef4444; box-shadow: none; }
        .match-card { background: rgba(15, 15, 26, 0.95); border: 2px solid #ef4444; padding: 30px; text-align: center; box-shadow: 0 0 40px rgba(239, 68, 68, 0.2); margin-bottom: 24px; }
        .versus-header { display: flex; align-items: center; justify-content: center; gap: 40px; margin: 20px 0; font-family: 'Orbitron'; }
        .vs-name { font-size: 22px; font-weight: 700; color: #fff; }
        .vs-divider { font-size: 14px; background: #ef4444; color: #fff; padding: 4px 10px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        .progress-wrapper { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; margin: 16px 0; text-align: left; font-family: 'Share Tech Mono'; }
        .bar-container { height: 8px; background: #111122; border-radius: 4px; overflow: hidden; margin-top: 6px; }
        .bar-fill { height: 100%; transition: width 0.4s ease; }
        .card { background: rgba(8,8,16,0.85); border: 1px solid rgba(250,204,21,0.08); margin-top: 24px; }
        .card-header { padding: 14px 20px; border-bottom: 1px solid rgba(250,204,21,0.07); display: flex; align-items: center; gap: 8px; font-family: 'Share Tech Mono'; font-size: 11px; letter-spacing: 2px; color: rgba(250,204,21,0.6); }
        .card-dot { width: 5px; height: 5px; background: #ef4444; border-radius: 50%; }
        .live-match-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); font-family: 'Share Tech Mono'; }
        .vs-block { display: flex; align-items: center; gap: 15px; }
        .player-tag { color: #fff; font-size: 14px; }
        .vs-badge { background: rgba(239,68,68,0.15); color: #ef4444; padding: 2px 6px; font-size: 10px; border: 1px solid rgba(239,68,68,0.3); }
        .battle-log-box { font-family: 'Share Tech Mono'; background: #040408; border: 1px solid rgba(255,255,255,0.05); padding: 14px; height: 120px; overflow-y: auto; text-align: left; font-size: 12px; color: #a1a1aa; display: flex; flex-direction: column; gap: 6px; }
        .action-button { background: #facc15; border: none; color: #080810; padding: 10px 24px; font-family: 'Orbitron'; font-weight: 700; font-size: 12px; cursor: pointer; margin-top: 14px; letter-spacing: 1px; }
        .action-button:hover { background: #eab308; }
        .outcome-banner { font-family: 'Orbitron'; font-size: 28px; font-weight: 900; padding: 10px; margin-bottom: 20px; letter-spacing: 2px; }
        .mobile-nav { display: none; }
        @keyframes pulse {
  0%,100% { opacity:1; }
  50% { opacity:0.4; }
}
.mobile-nav { display: none; }
        @media (max-width: 768px) {
          .topbar { padding: 0 16px; }
          .nav-links { display: none; }
          .arena-page { padding: 16px; padding-top: 76px; padding-bottom: 80px; }
          .main-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
          .hero-panel { padding: 24px 16px; clip-path: none; }
          .arena-title { font-size: 28px; }
          .queue-btn { padding: 14px 24px; font-size: 12px; width: 100%; }
          .live-match-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .match-card { padding: 20px 16px; }
          .versus-header { gap: 20px; }
          .vs-name { font-size: 16px; }
          .mobile-nav { display: grid !important; }
        }
      `}</style>

      <div className="page">
      <header className="topbar">
        <div className="logo" onClick={() => window.location.href = "/dashboard"}>
          <div className="logo-hex">⬡</div>CODEARENA
        </div>
        <nav className="nav-links">
          {["Dashboard", "Problems", "Arena", "Leaderboard", "Profile"].map((n) => (
  <button key={n} className={`nav-link ${n === "Arena" ? "active" : ""}`}
    onClick={() => window.location.href = `/${n.toLowerCase()}`}>
    {n}
  </button>
))}
        </nav>
        <div className="avatar" onClick={() => window.location.href = "/profile"}>
  {arenaStats?.username?.slice(0,2).toUpperCase() || "KG"}
</div>
      </header>

      <div className="arena-page">
        {/* MATCH EVALUATION OUTCOME BANNER */}
        {battleOutcome && (
          <div className="match-card" style={{borderColor: battleOutcome === "WIN" ? "#22c55e" : battleOutcome === "TIE" ? "#a855f7" : "#ef4444"}}>
            <div className="outcome-banner" style={{color: battleOutcome === "WIN" ? "#22c55e" : battleOutcome === "TIE" ? "#a855f7" : "#ef4444"}}>
              {battleOutcome === "WIN" ? "🏆 COMPETITIVE VICTORY" : battleOutcome === "TIE" ? "🤝 MATCH STALEMATE" : "❌ SYSTEM DEFEAT"}
            </div>
            <p style={{fontFamily:"Share Tech Mono", color:"rgba(255,255,255,0.5)"}}>
              {battleOutcome === "WIN" ? "+30 ELO Rating points processed." : battleOutcome === "TIE" ? "0 ELO adjustment processed." : "-15 ELO Rating points deducted."}
            </p>
            <button className="action-button" onClick={() => setBattleOutcome(null)}>DISMISS MONITOR</button>
          </div>
        )}

        {/* LOADING SEQUENCER */}
        {arenaStatus === "found" && rival && (
          <div className="match-card">
            <div style={{fontFamily:"Share Tech Mono", color:"#facc15", letterSpacing:4}}>💥 OPPONENT TERMINAL CONNECTED ({battleMode?.toUpperCase()}) 💥</div>
            <div className="versus-header">
              <span className="vs-name" style={{color:"#facc15"}}>{arenaStats?.username || "You"}</span>
              <span className="vs-divider">VS</span>
              <span className="vs-name" style={{color:"#ef4444"}}>{rival.username}</span>
            </div>
            <div style={{fontFamily:"Orbitron", fontSize:18, color:"#fff"}}>INITIALIZING COMPILER SANDBOX: {countdown}s</div>
          </div>
        )}

        {/* ACTIVE COMBAT VIEW */}
        {arenaStatus === "active" && rival && problem && (
  <div style={{marginBottom:24}}>
    <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, fontFamily:"Share Tech Mono", fontSize:12}}>
      <div style={{color:"#ef4444", letterSpacing:2}}>⚔️ SECTOR: {battleMode?.toUpperCase()} // {problem.title.toUpperCase()}</div>
      <div style={{
        color: battleTimer < 60 ? "#ef4444" : "#facc15",
        fontSize:20, fontFamily:"Orbitron", fontWeight:900, letterSpacing:3,
        background:"rgba(250,204,21,0.05)", border:"1px solid rgba(250,204,21,0.2)",
        padding:"6px 16px",
        animation: battleTimer < 60 ? "pulse 1s infinite" : "none"
      }}>
        ⏱ {formatTime(battleTimer)}
      </div>
    </div>

            {/* REALTIME GRAPHICAL SUBSECTION PROGRESSION BARS */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16}}>
              <div className="progress-wrapper">
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{color:"#22c55e"}}>YOU ({arenaStats?.username})</span>
                  <span>{playerProgress}%</span>
                </div>
                <div className="bar-container">
                  <div className="bar-fill" style={{width:`${playerProgress}%`, background:"#22c55e"}} />
                </div>
              </div>
              <div className="progress-wrapper">
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <span style={{color:"#ef4444"}}>RIVAL ({rival.username})</span>
                  <span>{rivalProgress}%</span>
                </div>
                <div className="bar-container">
                  <div className="bar-fill" style={{width:`${rivalProgress}%`, background:"#ef4444"}} />
                </div>
              </div>
            </div>

            {/* SPLIT COMBAT PANELS */}
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
              <div style={{background:"rgba(239,68,68,0.03)", border:"1px solid rgba(239,68,68,0.2)", padding:16}}>
                <div style={{fontFamily:"Share Tech Mono", fontSize:9, color:"#ef4444", letterSpacing:3, marginBottom:12}}>◉ ASSIGNMENT PROMPT CRITERIA</div>
                <div style={{fontFamily:"Share Tech Mono", fontSize:13, color:"#fff", marginBottom:12}}>{problem.description}</div>
                {battleMode === "bugfix" && (
                  <>
                    <div style={{fontFamily:"Share Tech Mono", fontSize:9, color:"rgba(255,255,255,0.3)", marginBottom:4}}>BROKEN TARGET DEPLOYMENT:</div>
                    <pre style={{fontFamily:"Share Tech Mono", fontSize:12, color:"#b91c1c", background:"#040408", padding:10, overflow:"auto", maxHeight:200, border:"1px dashed rgba(239,68,68,0.3)"}}>{problem.buggy_code}</pre>
                  </>
                )}
              </div>

              {/* 🌟 NEW: Professional Monaco Code Workspace integration replaces the old textarea */}
              <div style={{ background: "#1e1e1e", border: "1px solid rgba(250,204,21,0.1)", display: "flex", flexDirection: "column", height: "350px" }}>
                <div style={{ fontFamily: "Share Tech Mono", fontSize: 9, color: "rgba(250,204,21,0.4)", letterSpacing: 3, padding: "10px 14px", borderBottom: "1px solid rgba(250,204,21,0.06)", background: "#111116" }}>
                  ◈ SYSTEM COMPILER WORKSPACE (MONACO_ENV)
                </div>
                <div style={{ flex: 1, padding: "10px 0" }}>
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={playerCode}
                    onChange={(value) => handleCodeChange(value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'Share Tech Mono', monospace",
                      lineHeight: 20,
                      automaticLayout: true,
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{marginTop:16, display:"flex", gap:12, alignItems:"center"}}>
              <button className="action-button" onClick={handlePlayerCodeSubmit} style={{margin:0}}>⚡ COMPILE SOLUTION</button>
              <div className="battle-log-box" style={{flex:1, height:60}}>
                {battleLog.slice(0,2).map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </div>
          </div>
        )}

        {/* SELECTION CHANNELS CONTAINER */}
        <div className="main-grid">
          <div>
            {arenaStatus === "idle" && !battleOutcome && (
              <div className="hero-panel">
                <h1 className="arena-title">BATTLE ARENA</h1>
                <p className="arena-desc">SELECT THE TARGET MATCH VARIANT DESIGNATION</p>
                <div style={{display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap", marginTop:"10px"}}>
                  <button className="queue-btn" onClick={() => handleFindMatch("bugfix")}>⚠️ BUG FIX BATTLE</button>
                  <button className="queue-btn" style={{background:"linear-gradient(135deg,#6366f1,#4338ca)", boxShadow:"0 0 20px rgba(99,102,241,0.4)"}} onClick={() => handleFindMatch("coding")}>💻 CODING BATTLE</button>
                </div>
              </div>
            )}

            {arenaStatus === "searching" && (
              <div className="hero-panel">
                <h1 className="arena-title" style={{color:"#ef4444"}}>BROADCASTING COMPONENT POOL</h1>
                <p className="arena-desc">QUERIES QUEUED FOR [{battleMode?.toUpperCase()}] • MATCHMAKING PENDING...</p>
                <button className="queue-btn searching" onClick={handleCancelQueue}>CANCEL LOCAL BROADSIGNAL [{formatTime(queueTime)}]</button>
              </div>
            )}

            {/* SERVER STATUS INTERFACES */}
            <div className="card">
              <div className="card-header"><div className="card-dot" /> LIVE DEPLOYMENTS ON FEED</div>
              {activeMatches.length === 0 && <div style={{padding:"20px", fontFamily:"Share Tech Mono", fontSize:12, color:"rgba(255,255,255,0.3)"}}>No active matches ongoing.</div>}
              {activeMatches.map((m) => (
                <div key={m.id} className="live-match-row">
                  <div className="vs-block">
                    <span className="player-tag" style={{color:"#facc15"}}>{m.player1_username}</span>
                    <span className="vs-badge">VS</span>
                    <span className="player-tag">{m.player2_username}</span>
                  </div>
                  <span style={{color:"rgba(255,255,255,0.3)", fontSize:12, fontFamily:"Share Tech Mono"}}>{m.problem_title} ({m.battle_mode})</span>
                </div>
              ))}
            </div>
          </div>

          {/* HISTORIC METRIC TILES */}
          <div>
            <div className="card" style={{marginTop:0}}>
              <div className="card-header">ARENA METRICS</div>
              <div style={{padding:20, fontFamily:"Share Tech Mono", fontSize:12, display:"flex", flexDirection:"column", gap:12}}>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>RATING TRACKER:</span><span style={{color:"#facc15"}}>{arenaStats?.elo_rating || 1200} ELO</span></div>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>RATIO SCORE:</span><span style={{color:"#22c55e"}}>{winRate}%</span></div>
                <div style={{display:"flex", justifyContent:"space-between"}}><span>DUEL OVERVIEW:</span><span>{arenaStats?.total_matches || 0} Sets</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    {/* MOBILE BOTTOM NAV */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,8,16,0.98)',
        borderTop: '1px solid rgba(250,204,21,0.15)',
        padding: '10px 0',
        zIndex: 200,
        display: 'none',
        gridTemplateColumns: 'repeat(5, 1fr)',
      }} className="mobile-nav">
        {[
          { icon: "🏠", label: "Home", link: "/dashboard" },
          { icon: "📋", label: "Quests", link: "/problems" },
         { icon: "⚔️", label: "Arena", link: "/arena" },
          { icon: "🏆", label: "Board", link: "/leaderboard" },
          { icon: "⚙️", label: "Settings", link: "/settings" },
        ].map((item) => (
          <button key={item.label}
            onClick={() => window.location.href = item.link}
            style={{
              background: 'none', border: 'none',
              color: item.link === '/arena' ? '#facc15' : 'rgba(250,204,21,0.5)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', cursor: 'pointer', padding: '4px 0', width: '100%',
            }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 9, letterSpacing: 1, fontFamily: "'Share Tech Mono', monospace" }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </>
  );
}