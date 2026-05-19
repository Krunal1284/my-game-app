"use client";

import { useState, useEffect } from "react";

export default function ArenaPage() {
  // Arena State Machine: "idle" | "searching" | "found" | "active"
  const [arenaStatus, setArenaStatus] = useState("idle"); 
  const [queueTime, setQueueTime] = useState(0);
  const [countdown, setCountdown] = useState(5);
  
  // Battle Metrics
  const [playerProgress, setPlayerProgress] = useState(0);
  const [rivalProgress, setRivalProgress] = useState(0);
  const [battleLog, setBattleLog] = useState([]);
  const [battleOutcome, setBattleOutcome] = useState(null);

  // Matchmaking Timer Loop
  useEffect(() => {
    let timer;
    if (arenaStatus === "searching") {
      timer = setInterval(() => {
        setQueueTime((prev) => {
          // Trigger opponent found match after 4 seconds automatically
          if (prev >= 3) {
            setArenaStatus("found");
            clearInterval(timer);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setQueueTime(0);
    }
    return () => clearInterval(timer);
  }, [arenaStatus]);

  // Match Found Countdown Loop
  useEffect(() => {
    let timer;
    if (arenaStatus === "found") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setArenaStatus("active");
            clearInterval(timer);
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [arenaStatus]);

  // Live Battle Progress Simulator Engine
  useEffect(() => {
    let battleEngine;
    if (arenaStatus === "active") {
      // Reset metrics
      setPlayerProgress(0);
      setRivalProgress(0);
      setBattleOutcome(null);
      setBattleLog(["⚔️ Match Started: Solve 'Invert a Binary Tree'", "🤖 Rival player is analyzing constraints..."]);

      battleEngine = setInterval(() => {
        // Randomly bump up rival progress to simulate network coding activity
        setRivalProgress((prevRival) => {
          const increment = Math.random() > 0.4 ? Math.floor(Math.random() * 12) + 5 : 0;
          const nextRival = Math.min(prevRival + increment, 100);
          
          if (increment > 0 && nextRival < 100 && nextRival % 3 === 0) {
            setBattleLog((log) => [`⚡ Rival compiled passing tests (${nextRival}%)`, ...log.slice(0, 4)]);
          }
          
          if (nextRival >= 100) {
            clearInterval(battleEngine);
            setBattleOutcome("LOSE");
            setArenaStatus("idle");
          }
          return nextRival;
        });
      }, 1200);
    }
    return () => clearInterval(battleEngine);
  }, [arenaStatus]);

  // Simulate Player Submitting Code passing a test case
  const handlePlayerCodeSubmit = () => {
    setPlayerProgress((prev) => {
      const nextPlayer = Math.min(prev + 20, 100);
      if (nextPlayer >= 100) {
        setBattleOutcome("WIN");
        setArenaStatus("idle");
      } else {
        setBattleLog((log) => [`✅ You passed test suite configuration bundle! (${nextPlayer}%)`, ...log.slice(0, 4)]);
      }
      return nextPlayer;
    });
  };

  const formatTime = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');
        body { background: #080810; font-family: 'Exo 2', sans-serif; color: #e2e8f0; margin:0; }
        .arena-page { min-height: 100vh; padding: 40px; max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }
        .topbar { display: flex; align-items: center; justify-content: space-between; height: 60px; background: rgba(8,8,16,0.95); border-bottom: 1px solid rgba(250,204,21,0.12); position: fixed; top: 0; left: 0; right: 0; padding: 0 40px; z-index: 100; backdrop-filter: blur(20px); }
        .logo { display: flex; align-items: center; gap: 10px; font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 900; color: #facc15; letter-spacing: 3px; cursor: pointer; }
        .logo-hex { width: 32px; height: 32px; background: rgba(250,204,21,0.15); border: 1px solid #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 6px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.35); cursor: pointer; border: none; background: none; text-transform: uppercase; }
        .nav-link:hover, .nav-link.active { color: #facc15; }
        
        .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-top: 60px; }
        .hero-panel { background: rgba(239, 68, 68, 0.03); border: 1px solid rgba(239, 68, 68, 0.2); padding: 40px; text-align: center; clip-path: polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%); position: relative; }
        .hero-panel::after { content: 'LIVE_'; position: absolute; top: 15px; left: 20px; font-family: 'Share Tech Mono'; color: #ef4444; font-size: 12px; letter-spacing: 2px; }
        .arena-title { font-family: 'Orbitron', sans-serif; font-size: 32px; font-weight: 900; color: #fff; letter-spacing: 4px; margin-bottom: 8px; text-transform: uppercase; text-shadow: 0 0 20px rgba(239,68,68,0.3); }
        .arena-desc { font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 30px; font-family: 'Share Tech Mono'; letter-spacing: 1px; }
        
        .queue-btn { padding: 16px 40px; font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; letter-spacing: 2px; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #fff; border: none; cursor: pointer; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px)); transition: all 0.3s; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
        .queue-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(239, 68, 68, 0.6); }
        .queue-btn.searching { background: #0f0f1a; border: 1px solid #ef4444; color: #ef4444; box-shadow: none; animation: pulseBorder 1.5s infinite alternate; }
        
        /* MATCH DISPLAY INTERFACES */
        .match-card { background: rgba(15, 15, 26, 0.95); border: 2px solid #ef4444; padding: 30px; text-align: center; box-shadow: 0 0 40px rgba(239, 68, 68, 0.2); margin-bottom: 24px; }
        .versus-header { display: flex; align-items: center; justify-content: center; gap: 40px; margin: 20px 0; font-family: 'Orbitron'; }
        .vs-name { font-size: 22px; font-weight: 700; color: #fff; }
        .vs-divider { font-size: 14px; background: #ef4444; color: #fff; padding: 4px 10px; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        
        /* LIVE PROGRESS METERS */
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

        @media (max-width: 768px) {
          .topbar { padding: 0 16px; }
          .nav-links { display: none; }
          .arena-page { padding: 16px; padding-top: 76px; padding-bottom: 80px; }
          .main-grid { grid-template-columns: 1fr; gap: 16px; margin-top: 16px; }
          .hero-panel { padding: 24px 16px; clip-path: none; }
          .arena-title { font-size: 28px; }
          .queue-btn { padding: 14px 24px; font-size: 12px; width: 100%; }
          .live-match-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .vs-block { flex-wrap: wrap; }
          .match-card { padding: 20px 16px; }
          .versus-header { gap: 20px; }
          .vs-name { font-size: 16px; }
          .mobile-nav { display: grid !important; }
        }
      `}</style>

      {/* TOPBAR NAVBAR */}
      <header className="topbar">
        <div className="logo" onClick={() => window.location.href = "/dashboard"}>
          <div className="logo-hex">⬡</div>CODEARENA
        </div>
        <nav className="nav-links">
          {["Dashboard", "Problems", "Arena", "Leaderboard", "Profile", "Settings"].map((n) => (
            <button key={n} className={`nav-link ${n === "Arena" ? "active" : ""}`} onClick={() => window.location.href = `/${n.toLowerCase()}`}>
              {n === "Arena" ? "Arena ⚔️" : n === "Settings" ? "Settings ⚙️" : n}
            </button>
          ))}
        </nav>
        <div className="avatar" onClick={() => window.location.href = "/profile"}>KG</div>
      </header>

      <div className="arena-page">
        {/* MATCH RUNTIME STATUS SHIFTERS */}
        {battleOutcome && (
          <div className="match-card" style={{borderColor: battleOutcome === "WIN" ? "#22c55e" : "#ef4444"}}>
            <div className="outcome-banner" style={{color: battleOutcome === "WIN" ? "#22c55e" : "#ef4444"}}>
              {battleOutcome === "WIN" ? "🏆 VICTORY ACHIEVED" : "❌ DEFEATED IN COMBAT"}
            </div>
            <p style={{fontFamily:'Share Tech Mono', color:'rgba(255,255,255,0.5)'}}>
              {battleOutcome === "WIN" ? "+250 Arena Rating Points Granted" : "-120 Arena Rating Points Deducted"}
            </p>
          </div>
        )}

        {arenaStatus === "found" && (
          <div className="match-card">
            <div style={{fontFamily:'Share Tech Mono', color:'#facc15', letterSpacing:4}}>💥 OPPONENT DETECTED 💥</div>
            <div className="versus-header">
              <span className="vs-name" style={{color:'#facc15'}}>Krunal_GG</span>
              <span className="vs-divider">VS</span>
              <span className="vs-name" style={{color:'#ef4444'}}>X_Slayer_99</span>
            </div>
            <div style={{fontFamily:'Orbitron', fontSize:18, color:'#fff'}}>ENGAGING STREAM IN: {countdown}s</div>
          </div>
        )}

        {arenaStatus === "active" && (
          <div className="match-card" style={{textAlign:'center'}}>
            <div style={{fontFamily:'Share Tech Mono', color:'#ef4444', fontSize:13, letterSpacing:2}}>⚔️ LIVE DUEL ACTIVE: INVERT BINARY TREE ⚔️</div>
            
            <div className="progress-wrapper">
              <div style={{display:'flex', justifyContent:'space-between'}}><span>YOU (Krunal_GG)</span><span>{playerProgress}% Passed</span></div>
              <div className="bar-container"><div className="bar-fill" style={{width: `${playerProgress}%`, background:'#22c55e'}} /></div>
            </div>

            <div className="progress-wrapper">
              <div style={{display:'flex', justifyContent:'space-between'}}><span>RIVAL (X_Slayer_99)</span><span>{rivalProgress}% Passed</span></div>
              <div className="bar-container"><div className="bar-fill" style={{width: `${rivalProgress}%`, background:'#ef4444'}} /></div>
            </div>

            <div className="battle-log-box">
              {battleLog.map((log, i) => <div key={i}>{log}</div>)}
            </div>

            <button className="action-button" onClick={handlePlayerCodeSubmit}>COMPILE COMPONENT STEP ⚡</button>
          </div>
        )}

        <div className="main-grid">
          <div>
            {arenaStatus === "idle" && (
              <div className="hero-panel">
                <h1 className="arena-title">BATTLE ARENA</h1>
                <p className="arena-desc">COMPETE HEAD-TO-HEAD IN REAL-TIME CODING DUELS. WIN TO CLIMB THE RANKS.</p>
                <button className="queue-btn" onClick={() => setArenaStatus("searching")}>FIND MATCH ⚔️</button>
              </div>
            )}

            {arenaStatus === "searching" && (
              <div className="hero-panel">
                <h1 className="arena-title" style={{color:'#ef4444'}}>MATCHMAKING ACTIVE</h1>
                <p className="arena-desc">ALLOCATING AN OPTIMAL OPPONENT WITHIN YOUR ELO WINDOW...</p>
                <button className="queue-btn searching" onClick={() => setArenaStatus("idle")}>
                  SEARCHING FOR OPPONENT... [ {formatTime(queueTime)} ] • CANCEL
                </button>
              </div>
            )}

            <div className="card">
              <div className="card-header"><div className="card-dot" /> ACTIVE DUELS CONTENDING NOW</div>
              <div className="live-match-row">
                <div className="vs-block">
                  <span className="player-tag" style={{color:'#facc15'}}>AlphaCode_99</span>
                  <span className="vs-badge">VS</span>
                  <span className="player-tag">ByteSlayer</span>
                </div>
                <div><span style={{color:'rgba(255,255,255,0.3)', marginRight: 20}}>Problem: Two Sum II</span></div>
              </div>
              <div className="live-match-row">
                <div className="vs-block">
                  <span className="player-tag">NullPointer</span>
                  <span className="vs-badge">VS</span>
                  <span className="player-tag" style={{color:'#facc15'}}>Matrix_God</span>
                </div>
                <div><span style={{color:'rgba(255,255,255,0.3)', marginRight: 20}}>Problem: LRU Cache</span></div>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{marginTop:0}}>
              <div className="card-header">ARENA STATISTICS</div>
              <div style={{padding:20, fontFamily:'Share Tech Mono', fontSize:12, display:'flex', flexDirection:'column', gap:12}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>ARENA RATING:</span><span style={{color:'#facc15'}}>1,640 ELO</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>WIN RATE:</span><span style={{color:'#22c55e'}}>64.2%</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>TOTAL DUELS:</span><span>84 Matches</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>WIN/LOSS STREAK:</span><span style={{color:'#ef4444'}}>2 L</span></div>
              </div>
            </div>
          </div>
        </div>
      </div> {/* closes arena-page */}

      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,8,16,0.98)',
        borderTop: '1px solid rgba(250,204,21,0.15)',
        padding: '10px 0',
        zIndex: 200,
        gridTemplateColumns: 'repeat(5, 1fr)',
      }} className="mobile-nav">
        {[
          { icon: "⬡", label: "Home", link: "/dashboard" },
          { icon: "◈", label: "Quests", link: "/problems" },
          { icon: "⚔", label: "Arena", link: "/arena" },
          { icon: "◆", label: "Board", link: "/leaderboard" },
         { icon: "⚙️", label: "Settings", link: "/settings" },
        ].map((item) => (
          <button key={item.label}
            onClick={() => window.location.href = item.link}
            style={{
              background: 'none', border: 'none',
              color: item.link === '/arena' ? '#ef4444' : 'rgba(250,204,21,0.5)',
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
    