"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from "react";

const PLAYERS = [
  { rank: 1,  name: "n3ur0_hack",   xp: 142800, solved: 312, streak: 47, badge: "⬡", tier: "LEGEND",   change: 0,  country: "🇯🇵", easy: 98, med: 142, hard: 72 },
  { rank: 2,  name: "void_matrix",  xp: 138200, solved: 298, streak: 33, badge: "⬡", tier: "LEGEND",   change: 2,  country: "🇺🇸", easy: 95, med: 135, hard: 68 },
  { rank: 3,  name: "c0desl4yer",   xp: 121400, solved: 276, streak: 29, badge: "◈", tier: "PLATINUM", change: -1, country: "🇩🇪", easy: 91, med: 124, hard: 61 },
  { rank: 4,  name: "Krunal_GG",    xp: 98450,  solved: 142, streak: 21, badge: "◈", tier: "GOLD",     change: 1,  country: "🇮🇳", easy: 82, med: 48,  hard: 12, isMe: true },
  { rank: 5,  name: "void_runner",  xp: 87200,  solved: 198, streak: 15, badge: "◆", tier: "GOLD",     change: -2, country: "🇧🇷", easy: 78, med: 89,  hard: 31 },
  { rank: 6,  name: "hex_phantom",  xp: 71000,  solved: 167, streak: 9,  badge: "◆", tier: "GOLD",     change: 3,  country: "🇰🇷", easy: 72, med: 74,  hard: 21 },
  { rank: 7,  name: "dark_syntax",  xp: 64300,  solved: 154, streak: 12, badge: "◇", tier: "SILVER",   change: 0,  country: "🇫🇷", easy: 68, med: 67,  hard: 19 },
  { rank: 8,  name: "null_ptr",     xp: 58900,  solved: 143, streak: 7,  badge: "◇", tier: "SILVER",   change: 1,  country: "🇨🇦", easy: 65, med: 61,  hard: 17 },
  { rank: 9,  name: "bytewiz",      xp: 52100,  solved: 128, streak: 5,  badge: "◇", tier: "SILVER",   change: -1, country: "🇬🇧", easy: 61, med: 54,  hard: 13 },
  { rank: 10, name: "loop_breaker", xp: 47800,  solved: 119, streak: 3,  badge: "○", tier: "BRONZE",   change: 2,  country: "🇦🇺", easy: 58, med: 48,  hard: 13 },
  { rank: 11, name: "stack_smashr", xp: 43200,  solved: 108, streak: 8,  badge: "○", tier: "BRONZE",   change: 0,  country: "🇳🇱", easy: 54, med: 42,  hard: 12 },
  { rank: 12, name: "grep_god",     xp: 38700,  solved: 97,  streak: 4,  badge: "○", tier: "BRONZE",   change: -3, country: "🇸🇪", easy: 49, med: 37,  hard: 11 },
];

const TIERS = ["ALL", "LEGEND", "PLATINUM", "GOLD", "SILVER", "BRONZE"];
const PERIODS = ["ALL TIME", "THIS MONTH", "THIS WEEK", "TODAY"];

const TIER_COLORS = {
  LEGEND:   "#facc15",
  PLATINUM: "#e2e8f0",
  GOLD:     "#f59e0b",
  SILVER:   "#94a3b8",
  BRONZE:   "#b45309",
};

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("ALL TIME");
  const [tier, setTier] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const canvasRef = useRef(null);
  const [players, setPlayers] = useState(PLAYERS);
const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);
useEffect(() => {
  const fetchData = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('xp', { ascending: false });

    if (data && data.length > 0) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
const ranked = data.map((user, index) => ({
  rank: index + 1,
  name: user.username || 'Player',
  xp: user.xp || 0,
  solved: user.solved || 0,
  streak: user.streak || 0,
  tier: user.rank || 'BRONZE',
  badge: '◈',
  country: '🌍',
  change: 0,
  isMe: user.email === authUser?.email,
}));
setPlayers(ranked); 
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single();
      setCurrentUser(userData);
    }
  };
  fetchData();
}, []);
  // Hex canvas bg
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const hexSize = 38;
    const hexes = [];
    for (let row = 0; row < h / (hexSize * 1.5) + 2; row++) {
      for (let col = 0; col < w / (hexSize * 1.73) + 2; col++) {
        hexes.push({ x: col * hexSize * 1.73 + (row % 2) * hexSize * 0.865, y: row * hexSize * 1.5, op: Math.random() * 0.04 + 0.008, pulse: Math.random() * Math.PI * 2 });
      }
    }
    let frame = 0, animId;
    const drawHex = (cx, cy, size, op) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + size * Math.cos(a), cy + size * Math.sin(a)) : ctx.lineTo(cx + size * Math.cos(a), cy + size * Math.sin(a));
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(250,204,21,${op})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;
      hexes.forEach((h) => drawHex(h.x, h.y, hexSize - 2, Math.max(0, Math.sin(frame * 0.018 + h.pulse) * 0.015 + h.op)));
      animId = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

const filtered = players.filter((p) => {
    const matchTier = tier === "ALL" || p.tier === tier;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchTier && matchSearch;
  });

  const top3 = PLAYERS.slice(0, 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.3); border-radius: 2px; }
        body { background: #080810; font-family: 'Exo 2', sans-serif; color: #e2e8f0; }

        canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse at 20% 10%, rgba(250,204,21,0.06) 0%, transparent 45%),
            radial-gradient(ellipse at 80% 90%, rgba(234,88,12,0.04) 0%, transparent 45%);
        }

        .page { position: relative; z-index: 1; min-height: 100vh; }

        /* TOPBAR */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          background: rgba(8,8,16,0.95); border-bottom: 1px solid rgba(250,204,21,0.12);
          backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 900;
          color: #facc15; letter-spacing: 3px; cursor: pointer;
        }
        .logo-hex {
          width: 32px; height: 32px; background: rgba(250,204,21,0.15); border: 1px solid #facc15;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 6px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px;
          letter-spacing: 2px; color: rgba(255,255,255,0.35); cursor: pointer;
          border: none; background: none; transition: color 0.2s; text-transform: uppercase;
        }
        .nav-link:hover { color: rgba(250,204,21,0.7); }
        .nav-link.active { color: #facc15; }
        .avatar {
          width: 34px; height: 34px; background: linear-gradient(135deg, #facc15, #f59e0b);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #080810; cursor: pointer; font-family: 'Orbitron', monospace;
        }

        /* MAIN */
        .main { max-width: 1100px; margin: 0 auto; padding: 36px 40px; }

        /* PAGE HEADER */
        .page-header {
          margin-bottom: 36px; text-align: center;
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 20}px);
          transition: all 0.6s ease;
        }
        .page-tag { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 4px; color: rgba(250,204,21,0.4); margin-bottom: 10px; }
        .page-title { font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 8px; letter-spacing: 2px; }
        .page-title span { color: #facc15; text-shadow: 0 0 30px rgba(250,204,21,0.4); }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

        /* PERIOD TABS */
        .period-tabs {
          display: flex; justify-content: center; gap: 6px; margin-bottom: 36px;
          opacity: ${loaded ? 1 : 0}; transition: all 0.6s 0.1s ease;
        }
        .period-tab {
          padding: 8px 20px; font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: rgba(255,255,255,0.3); cursor: pointer;
          border: 1px solid rgba(250,204,21,0.1); background: none; transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .period-tab:hover { color: rgba(250,204,21,0.7); border-color: rgba(250,204,21,0.3); }
        .period-tab.active { color: #facc15; border-color: rgba(250,204,21,0.5); background: rgba(250,204,21,0.08); }

        /* TOP 3 PODIUM */
        .podium {
          display: flex; align-items: flex-end; justify-content: center;
          gap: 16px; margin-bottom: 40px;
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 24}px);
          transition: all 0.7s 0.15s ease;
        }

        .podium-card {
          display: flex; flex-direction: column; align-items: center;
          position: relative; cursor: pointer; transition: transform 0.2s;
        }
        .podium-card:hover { transform: translateY(-4px); }

        .podium-card.rank1 { order: 2; }
        .podium-card.rank2 { order: 1; }
        .podium-card.rank3 { order: 3; }

        .podium-avatar-wrap { position: relative; margin-bottom: 12px; }
        .podium-glow {
          position: absolute; inset: -8px; border-radius: 50%;
          animation: glowPulse 2s infinite;
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.05); }
        }
        .podium-avatar {
          width: 72px; height: 72px; position: relative; z-index: 1;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; font-family: 'Orbitron', monospace; font-weight: 900;
          border: 2px solid;
        }
        .podium-card.rank2 .podium-avatar,
        .podium-card.rank3 .podium-avatar { width: 58px; height: 58px; font-size: 18px; }

        .podium-crown { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); font-size: 20px; z-index: 2; }
        .podium-rank-badge {
          position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
          width: 22px; height: 22px; border-radius: 50%; z-index: 2;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 900;
          border: 2px solid #080810;
        }

        .podium-name { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; color: #fff; margin-bottom: 4px; letter-spacing: 1px; }
        .podium-xp { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.4); margin-bottom: 10px; letter-spacing: 1px; }
        .podium-tier-badge {
          font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px;
          padding: 3px 10px; border: 1px solid; margin-bottom: 12px;
        }

        .podium-block {
          width: 160px; display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900;
          border: 1px solid; border-bottom: none; position: relative; overflow: hidden;
        }
        .podium-card.rank1 .podium-block { height: 80px; }
        .podium-card.rank2 .podium-block { height: 56px; width: 140px; }
        .podium-card.rank3 .podium-block { height: 40px; width: 140px; }
        .podium-block::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(250,204,21,0.08) 0%, transparent 100%);
        }

        /* FILTERS ROW */
        .filters-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 16px;
          opacity: ${loaded ? 1 : 0}; transition: all 0.6s 0.2s ease;
          flex-wrap: wrap;
        }
        .search-wrap { position: relative; flex: 1; min-width: 180px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(250,204,21,0.3); font-size: 12px; pointer-events: none; }
        .search-input {
          width: 100%; background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.15);
          color: #f5f5f5; font-family: 'Share Tech Mono', monospace; font-size: 12px;
          padding: 10px 12px 10px 36px; outline: none; letter-spacing: 1px;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
          transition: border-color 0.2s, background 0.2s;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.15); }
        .search-input:focus { border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.05); }
        .tier-filters { display: flex; gap: 6px; flex-wrap: wrap; }
        .tier-btn {
          padding: 8px 14px; font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 2px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
          background: none; color: rgba(255,255,255,0.3); transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));
        }
        .tier-btn:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.2); }
        .tier-btn.active { color: #facc15; border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.08); }

        /* MY RANK BANNER */
        .my-rank-banner {
          display: flex; align-items: center; gap: 16px;
          padding: 14px 20px; margin-bottom: 16px;
          background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.2);
          clip-path: polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
          opacity: ${loaded ? 1 : 0}; transition: all 0.6s 0.25s ease;
        }
        .my-rank-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: rgba(250,204,21,0.5); }
        .my-rank-num { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 900; color: #facc15; line-height: 1; }
        .my-rank-divider { width: 1px; height: 32px; background: rgba(250,204,21,0.15); }
        .my-rank-stat { display: flex; flex-direction: column; }
        .my-rank-stat-val { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #fff; }
        .my-rank-stat-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .my-rank-progress { flex: 1; }
        .my-rank-progress-label { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .my-rank-progress-text { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .progress-bar { height: 4px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg,#facc15,#f59e0b); transition: width 1.5s cubic-bezier(0.4,0,0.2,1); position: relative; }
        .progress-fill::after { content: ''; position: absolute; right: -10px; top: 0; width: 20px; height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent); animation: shimmer 2s infinite; }
        @keyframes shimmer { 0%{transform:translateX(-20px)} 100%{transform:translateX(20px)} }

        /* TABLE */
        .table-wrap {
          background: rgba(8,8,16,0.85); border: 1px solid rgba(250,204,21,0.1);
          backdrop-filter: blur(10px);
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 10}px);
          transition: all 0.6s 0.3s ease;
        }
        .table-header {
          display: grid; grid-template-columns: 60px 48px 1fr 100px 100px 100px 90px;
          padding: 12px 20px; border-bottom: 1px solid rgba(250,204,21,0.1);
        }
        .th { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px; color: rgba(250,204,21,0.35); display: flex; align-items: center; }

        .player-row {
          display: grid; grid-template-columns: 60px 48px 1fr 100px 100px 100px 90px;
          padding: 14px 20px; border-bottom: 1px solid rgba(250,204,21,0.05);
          cursor: pointer; transition: background 0.15s; position: relative;
          animation: rowIn 0.4s ease both;
        }
        .player-row:last-child { border-bottom: none; }
        .player-row:hover { background: rgba(250,204,21,0.03); }
        .player-row.me { background: rgba(250,204,21,0.05); }
        .player-row.me::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #facc15; }
        @keyframes rowIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }

        .col-rank { display: flex; align-items: center; gap: 6px; }
        .rank-num { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.25); }
        .rank-num.top1 { color: #facc15; }
        .rank-num.top2 { color: #e2e8f0; }
        .rank-num.top3 { color: #f59e0b; }
        .rank-change { font-family: 'Share Tech Mono', monospace; font-size: 8px; }
        .rank-change.up { color: #22c55e; }
        .rank-change.down { color: #ef4444; }
        .rank-change.same { color: rgba(255,255,255,0.2); }

        .col-country { display: flex; align-items: center; font-size: 18px; }

        .col-player { display: flex; align-items: center; gap: 12px; }
        .player-hex {
          width: 34px; height: 34px;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center; font-size: 13px;
          flex-shrink: 0;
        }
        .player-info { }
        .player-name { font-size: 13px; font-weight: 600; color: #e2e8f0; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
        .me-tag { font-family: 'Share Tech Mono', monospace; font-size: 8px; color: #facc15; background: rgba(250,204,21,0.1); border: 1px solid rgba(250,204,21,0.2); padding: 1px 5px; letter-spacing: 1px; }
        .player-streak { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }

        .col-tier { display: flex; align-items: center; }
        .tier-chip { font-family: 'Share Tech Mono', monospace; font-size: 8px; letter-spacing: 2px; padding: 3px 8px; border: 1px solid; }

        .col-solved { display: flex; align-items: center; }
        .solved-val { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.7); }

        .col-xp { display: flex; align-items: center; }
        .xp-val { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; color: #facc15; }

        .col-streak { display: flex; align-items: center; gap: 5px; }
        .streak-val { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.5); }
        .streak-fire { font-size: 13px; }

        /* RESULT COUNT */
        .result-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .result-text { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 2px; }
        .result-text span { color: #facc15; }
        .live-indicator { display: flex; align-items: center; gap: 6px; font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 2px; }
        .live-dot { width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: livePulse 1.4s infinite; }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }

        @media (max-width: 768px) {
          .main { padding: 16px; }
          .topbar { padding: 0 16px; }
          .nav-links { display: none; }
          .page-title { font-size: 24px !important; }
          .podium { gap: 8px; }
          .podium-block { width: 100px !important; }
          .podium-avatar { width: 50px !important; height: 50px !important; font-size: 16px !important; }
          .podium-name { font-size: 10px; }
          .podium-xp { font-size: 9px; }
          .my-rank-banner { flex-wrap: wrap; gap: 10px; }
          .my-rank-progress { width: 100%; }
          .filters-row { flex-direction: column; }
          .tier-filters { flex-wrap: wrap; }
          .table-header { display: none; }
          .player-row { grid-template-columns: 48px 1fr 80px 70px !important; }
          .col-country { display: none; }
          .col-tier { display: none; }
          .col-streak { display: none; }
          .period-tabs { flex-wrap: wrap; gap: 6px; }
          .period-tab { padding: 6px 12px; font-size: 9px; }
        }
      `}</style>

      <canvas ref={canvasRef} />
      <div className="bg-overlay" />

      <div className="page">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="logo" onClick={() => window.location.href = "/dashboard"}>
            <div className="logo-hex">⬡</div>
            CODEARENA
          </div>
          <nav className="nav-links">
            {["Dashboard","Problems","Arena","Leaderboard","Profile"].map((n) => (
              <button key={n} className={`nav-link ${n === "Leaderboard" ? "active" : ""}`}
                onClick={() => {
  if (n === "Dashboard") window.location.href = "/dashboard";
  if (n === "Problems") window.location.href = "/problems";
  if (n === "Arena") window.location.href = "/arena";
  if (n === "Leaderboard") window.location.href = "/leaderboard";
  if (n === "Profile") window.location.href = "/profile";
}}>
                {n}
              </button>
            ))}
          </nav>
          <div className="avatar">KG</div>
        </header>

        <main className="main">
          {/* Header */}
          <div className="page-header">
            <div className="page-tag">// GLOBAL RANKINGS</div>
            <div className="page-title">The <span>Arena</span> Board</div>
            <div className="page-sub">Season 4 · Updated live every 60 seconds</div>
          </div>

          {/* Period tabs */}
          <div className="period-tabs">
            {PERIODS.map((p) => (
              <button key={p} className={`period-tab ${period === p ? "active" : ""}`} onClick={() => setPeriod(p)}>{p}</button>
            ))}
          </div>

          {/* TOP 3 PODIUM */}
          <div className="podium">
            {[players[1] || PLAYERS[1], players[0] || PLAYERS[0], players[2] || PLAYERS[2]].map((p, i) => {
              const actualRank = p.rank;
              const colors = { 1: "#facc15", 2: "#e2e8f0", 3: "#f59e0b" };
              const color = colors[actualRank];
              const crowns = { 1: "👑", 2: "🥈", 3: "🥉" };
              return (
                <div key={p.rank} className={`podium-card rank${actualRank}`}>
                  <div className="podium-avatar-wrap">
                    {actualRank === 1 && <div className="podium-crown">{crowns[1]}</div>}
                    <div
                      className="podium-avatar"
                      style={{ background: `rgba(${actualRank===1?"250,204,21":actualRank===2?"226,232,240":"245,158,11"},0.12)`, borderColor: color, color }}
                    >
                      {p.name.slice(0,2).toUpperCase()}
                    </div>
                    <div className="podium-rank-badge" style={{ background: color, color: "#080810" }}>{actualRank}</div>
                  </div>
                  <div className="podium-name">{p.name}</div>
                  <div className="podium-xp">{p.xp.toLocaleString()} XP</div>
                  <div className="podium-tier-badge" style={{ color, borderColor: color + "50" }}>{p.tier}</div>
                  <div className="podium-block" style={{ borderColor: color + "30", color: color + "20", background: `rgba(${actualRank===1?"250,204,21":actualRank===2?"226,232,240":"245,158,11"},0.04)` }}>
                    #{actualRank}
                  </div>
                </div>
              );
            })}
          </div>

          {/* My rank banner */}
          <div className="my-rank-banner">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="my-rank-label">YOUR RANK</div>
              <div className="my-rank-num">
  #{players.findIndex(p => p.name === currentUser?.username) + 1 || '?'}
</div>
            </div>
            <div className="my-rank-divider" />
            <div className="my-rank-stat">
              <div className="my-rank-stat-val">{currentUser?.xp || 0}</div>
              <div className="my-rank-stat-lbl">TOTAL XP</div>
            </div>
            <div className="my-rank-divider" />
            <div className="my-rank-stat">
              <div className="my-rank-stat-val">{currentUser?.solved || 0}</div>
              <div className="my-rank-stat-lbl">SOLVED</div>
            </div>
            <div className="my-rank-divider" />
            <div className="my-rank-stat">
              <div className="my-rank-stat-val">🔥 21</div>
              <div className="my-rank-stat-lbl">DAY STREAK</div>
            </div>
            <div className="my-rank-divider" />
            <div className="my-rank-progress">
              <div className="my-rank-progress-label">
                <span className="my-rank-progress-text">GOLD II → PLATINUM</span>
                <span className="my-rank-progress-text">98,450 / 120,000 XP</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "82%" }} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <div className="search-wrap">
              <span className="search-icon">▸</span>
              <input className="search-input" placeholder="Search players..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="tier-filters">
              {TIERS.map((t) => (
                <button key={t} className={`tier-btn ${tier === t ? "active" : ""}`} onClick={() => setTier(t)}>{t}</button>
              ))}
            </div>
          </div>

          {/* Result count */}
          <div className="result-row">
            <div className="result-text">Showing <span>{filtered.length}</span> of <span>{players.length}</span> players</div>
            <div className="live-indicator"><div className="live-dot" />LIVE RANKINGS</div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-header">
              <div className="th">RANK</div>
              <div className="th">FLAG</div>
              <div className="th">PLAYER</div>
              <div className="th">TIER</div>
              <div className="th">SOLVED</div>
              <div className="th">TOTAL XP</div>
              <div className="th">STREAK</div>
            </div>

            {filtered.map((p, i) => {
              const tierColor = TIER_COLORS[p.tier];
              const changeEl = p.change > 0
                ? <span className="rank-change up">▲{p.change}</span>
                : p.change < 0
                ? <span className="rank-change down">▼{Math.abs(p.change)}</span>
                : <span className="rank-change same">—</span>;

              return (
                <div
                  key={p.rank}
                  className={`player-row ${p.isMe ? "me" : ""}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onMouseEnter={() => setHoveredRow(p.rank)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="col-rank">
                    <div className={`rank-num ${p.rank === 1 ? "top1" : p.rank === 2 ? "top2" : p.rank === 3 ? "top3" : ""}`}>#{p.rank}</div>
                    {changeEl}
                  </div>

                  <div className="col-country">{p.country}</div>

                  <div className="col-player">
                    <div className="player-hex" style={{ background: `rgba(${p.tier==="LEGEND"?"250,204,21":p.tier==="PLATINUM"?"226,232,240":p.tier==="GOLD"?"245,158,11":p.tier==="SILVER"?"148,163,184":"180,83,9"},0.1)`, border: `1px solid ${tierColor}30`, color: tierColor }}>
                      {p.badge}
                    </div>
                    <div className="player-info">
                      <div className="player-name">
                        {p.name}
                        {p.isMe && <span className="me-tag">YOU</span>}
                      </div>
                      <div className="player-streak">🔥 {p.streak} day streak</div>
                    </div>
                  </div>

                  <div className="col-tier">
                    <div className="tier-chip" style={{ color: tierColor, borderColor: tierColor + "40" }}>{p.tier}</div>
                  </div>

                  <div className="col-solved">
                    <div className="solved-val">{p.solved}</div>
                  </div>

                  <div className="col-xp">
                    <div className="xp-val">{p.xp.toLocaleString()}</div>
                  </div>

                  <div className="col-streak">
                    <span className="streak-fire">🔥</span>
                    <span className="streak-val">{p.streak}d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </>
  );
}