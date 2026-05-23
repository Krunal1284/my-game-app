"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from "react";
import { updateStreak } from '@/lib/streak';

const QUESTS = [
  { id: 1, title: "Two Sum", tag: "ARRAY", xp: 120, diff: "EASY", done: true },
  { id: 2, title: "Longest Substring", tag: "SLIDING WINDOW", xp: 280, diff: "MEDIUM", done: true },
  { id: 3, title: "Merge Intervals", tag: "SORTING", xp: 280, diff: "MEDIUM", done: false },
  { id: 4, title: "Binary Tree Path", tag: "TREE", xp: 500, diff: "HARD", done: false },
  { id: 5, title: "Trapping Rain Water", tag: "DP", xp: 500, diff: "HARD", done: false },
];

const LEADERBOARD = [
  { rank: 1, name: "n3ur0_hack", score: "142,800", badge: "⬡", streak: 47 },
  { rank: 2, name: "Krunal_GG", score: "98,450", badge: "◈", streak: 21, isMe: true },
  { rank: 3, name: "c0desl4yer", score: "87,200", badge: "◆", streak: 15 },
  { rank: 4, name: "void_runner", score: "71,000", badge: "◇", streak: 9 },
];

const BADGES = [
  { icon: "⚡", label: "Speed Coder", earned: true },
  { icon: "🔥", label: "21 Day Streak", earned: true },
  { icon: "◈", label: "Array Master", earned: true },
  { icon: "◉", label: "Tree Slayer", earned: false },
  { icon: "∞", label: "DP Wizard", earned: false },
  { icon: "⬡", label: "Legend", earned: false },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("quests");
  const [time, setTime] = useState("");
  const [xpAnim, setXpAnim] = useState(0);
  const canvasRef = useRef(null);
  const [user, setUser] = useState(null);

    useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    
    // ← ADD THIS LINE to clean the URL
    if (window.location.hash) window.history.replaceState(null, '', '/dashboard');
    
    await updateStreak(user.email);
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();
    setUser(data);
  };
  getUser();
}, []);

  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setXpAnim(68), 300);
    return () => clearTimeout(timer);
  }, []);

  // Canvas background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Hex grid
    const hexSize = 40;
    const hexes = [];
    for (let row = 0; row < height / (hexSize * 1.5) + 2; row++) {
      for (let col = 0; col < width / (hexSize * 1.73) + 2; col++) {
        const x = col * hexSize * 1.73 + (row % 2) * hexSize * 0.865;
        const y = row * hexSize * 1.5;
        hexes.push({ x, y, opacity: Math.random() * 0.04 + 0.01, pulse: Math.random() * Math.PI * 2 });
      }
    }

    let frame = 0;
    let animId;
    const drawHex = (cx, cy, size, opacity) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(250,204,21,${opacity})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;
      hexes.forEach((h) => {
        const pulse = Math.sin(frame * 0.02 + h.pulse) * 0.015 + h.opacity;
        drawHex(h.x, h.y, hexSize - 2, Math.max(0, pulse));
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const diffColor = (d) => d === "EASY" ? "#22c55e" : d === "MEDIUM" ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.3); }

        body {
          background: #080810;
          font-family: 'Exo 2', sans-serif;
          color: #e2e8f0;
          overflow-x: hidden;
        }

        canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Gradient overlay */
        .bg-overlay {
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse at 0% 0%, rgba(250,204,21,0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.05) 0%, transparent 50%);
          z-index: 0;
          pointer-events: none;
        }

        .layout {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto 1fr;
}

.mobile-nav {
  display: none;
}

@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
  }
    .mobile-nav {
    display: grid !important;
  }
  .main {
    padding-bottom: 80px !important;
  }
  .sidebar {
    display: none !important;
  }
  .topbar {
    padding: 0 12px;
    overflow: hidden;
  }
  .topbar-center { /* desktop only */
     display: none !important;
  }
  .topbar-right .notif-btn {
    display: none !important;
  }
  .main {
    padding: 12px;
    overflow-x: hidden;
  }
  .grid2 {
    grid-template-columns: 1fr !important;
  }
  .grid3 {
    grid-template-columns: 1fr !important;
  }
  .hero {
    padding: 16px;
    clip-path: none !important;
  }
  .hero-title {
    font-size: 16px !important;
  }
  .hero-stats {
    gap: 8px;
    flex-wrap: wrap;
  }
  .daily-btn {
    display: none !important;
  }
  .hero-stat-val {
    font-size: 16px !important;
  }
  body {
    overflow-x: hidden;
  }
}

        /* ── TOPBAR ── */
        .topbar {
          grid-column: 1 / -1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          height: 60px;
          background: rgba(8,8,16,0.9);
          border-bottom: 1px solid rgba(250,204,21,0.12);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Orbitron', monospace;
          font-size: 18px;
          font-weight: 900;
          color: #facc15;
          letter-spacing: 3px;
        }
        .logo-hex {
          width: 32px;
          height: 32px;
          background: rgba(250,204,21,0.15);
          border: 1px solid #facc15;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .topbar-center { /* desktop only */
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .season-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(250,204,21,0.06);
          border: 1px solid rgba(250,204,21,0.2);
          padding: 5px 14px;
          clip-path: polygon(8px 0,100% 0,100% calc(100% - 8px),calc(100% - 8px) 100%,0 100%,0 8px);
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(250,204,21,0.7);
          letter-spacing: 2px;
        }
        .live-dot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: livePulse 1.4s infinite;
        }
        @keyframes livePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
        }

        .clock {
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          color: rgba(250,204,21,0.5);
          letter-spacing: 2px;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .notif-btn {
          width: 34px; height: 34px;
          background: rgba(250,204,21,0.05);
          border: 1px solid rgba(250,204,21,0.15);
          color: rgba(250,204,21,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
          clip-path: polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
        }
        .notif-btn:hover { background: rgba(250,204,21,0.1); color: #facc15; border-color: rgba(250,204,21,0.4); }

        .avatar {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #facc15, #f59e0b);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          color: #080810;
          cursor: pointer;
          font-family: 'Orbitron', monospace;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          background: rgba(8,8,16,0.7);
          border-right: 1px solid rgba(250,204,21,0.08);
          padding: 24px 0;
          backdrop-filter: blur(10px);
        }

        .nav-section {
          margin-bottom: 32px;
        }
        .nav-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(250,204,21,0.25);
          padding: 0 20px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          letter-spacing: 0.5px;
          border: none;
          background: none;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover { color: rgba(250,204,21,0.8); background: rgba(250,204,21,0.03); }
        .nav-item.active {
          color: #facc15;
          background: rgba(250,204,21,0.06);
        }
        .nav-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 2px;
          background: #facc15;
        }
        .nav-icon { font-size: 15px; width: 18px; text-align: center; }
        .nav-count {
          margin-left: auto;
          background: rgba(250,204,21,0.12);
          border: 1px solid rgba(250,204,21,0.2);
          color: #facc15;
          font-size: 9px;
          padding: 2px 6px;
          font-family: 'Share Tech Mono', monospace;
        }

        /* Player card in sidebar */
        .player-card {
          margin: 0 12px 24px;
          padding: 16px;
          background: rgba(250,204,21,0.04);
          border: 1px solid rgba(250,204,21,0.12);
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
        }
        .player-name {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 700;
          color: #facc15;
          margin-bottom: 2px;
        }
        .player-title {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          font-family: 'Share Tech Mono', monospace;
          margin-bottom: 12px;
        }
        .xp-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .xp-text {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(250,204,21,0.5);
        }
        .xp-bar {
          height: 5px;
          background: rgba(250,204,21,0.08);
          clip-path: polygon(0 0,100% 0,100% 100%,3px 100%,0 calc(100% - 0px));
          margin-bottom: 10px;
          overflow: hidden;
        }
        .xp-fill {
          height: 100%;
          background: linear-gradient(90deg,#facc15,#f59e0b);
          transition: width 1.2s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        .xp-fill::after {
          content: '';
          position: absolute;
          right: -10px; top: 0;
          width: 20px; height: 100%;
          background: linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer { 0%{transform:translateX(-20px)} 100%{transform:translateX(20px)} }

        .rank-chip {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .rank-color { width: 8px; height: 8px; background: #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .rank-name { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #facc15; letter-spacing: 2px; }

        /* ── MAIN CONTENT ── */
        .main {
          padding: 28px 32px;
          overflow-y: auto;
          max-height: calc(100vh - 60px);
        }

        /* Welcome hero */
        .hero {
          margin-bottom: 28px;
          padding: 28px 32px;
          background: rgba(250,204,21,0.03);
          border: 1px solid rgba(250,204,21,0.1);
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);
          animation: fadeUp 0.5s ease both;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .hero::before {
          content: '';
          position: absolute;
          right: -60px; top: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(250,204,21,0.08), transparent 70%);
        }
        .hero-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 4px;
          color: rgba(250,204,21,0.5);
          margin-bottom: 8px;
        }
        .hero-title {
          font-family: 'Orbitron', monospace;
          font-size: 26px;
          font-weight: 900;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 6px;
        }
        .hero-title span { color: #facc15; }
        .hero-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
        }
        .hero-stats {
          display: flex;
          gap: 24px;
          margin-top: 20px;
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
        }
        .hero-stat-val {
          font-family: 'Orbitron', monospace;
          font-size: 22px;
          font-weight: 700;
          color: #facc15;
          line-height: 1;
        }
        .hero-stat-lbl {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 4px;
          font-family: 'Share Tech Mono', monospace;
        }
        .hero-divider { width: 1px; background: rgba(250,204,21,0.1); }

        .daily-btn {
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          padding: 12px 24px;
          background: transparent;
          border: 1px solid #facc15;
          color: #facc15;
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
          transition: all 0.25s;
          position: relative;
          overflow: hidden;
        }
        .daily-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #facc15;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s;
          z-index: 0;
        }
        .daily-btn:hover::before { transform: scaleX(1); }
        .daily-btn:hover { color: #080810; }
        .daily-btn span { position: relative; z-index: 1; }

        /* Grid layout */
        .grid2 {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 20px;
          margin-bottom: 20px;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .grid3 {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 16px;
          margin-bottom: 20px;
          animation: fadeUp 0.5s 0.05s ease both;
        }

        /* Cards */
        .card {
          background: rgba(8,8,16,0.8);
          border: 1px solid rgba(250,204,21,0.1);
          backdrop-filter: blur(10px);
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(250,204,21,0.07);
        }
        .card-title {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(250,204,21,0.6);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-title-dot { width: 5px; height: 5px; background: #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .card-action {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(250,204,21,0.3);
          cursor: pointer;
          transition: color 0.2s;
          background: none; border: none;
          letter-spacing: 2px;
        }
        .card-action:hover { color: #facc15; }

        /* Stat cards */
        .stat-card {
          padding: 20px;
          background: rgba(8,8,16,0.8);
          border: 1px solid rgba(250,204,21,0.1);
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%);
          transition: border-color 0.2s, transform 0.2s;
        }
        .stat-card:hover { border-color: rgba(250,204,21,0.25); transform: translateY(-2px); }
        .stat-card::after {
          content: '';
          position: absolute;
          top: 0; right: 0;
          width: 12px; height: 12px;
          border-top: 2px solid rgba(250,204,21,0.3);
          border-right: 2px solid rgba(250,204,21,0.3);
        }
        .stat-card-icon { font-size: 22px; margin-bottom: 12px; }
        .stat-card-val {
          font-family: 'Orbitron', monospace;
          font-size: 28px;
          font-weight: 700;
          color: #facc15;
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-card-lbl { font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 1px; }
        .stat-card-change {
          margin-top: 8px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: #22c55e;
          letter-spacing: 1px;
        }
        .stat-card-bg {
          position: absolute;
          right: -10px; bottom: -10px;
          font-size: 60px;
          opacity: 0.04;
          line-height: 1;
        }

        /* Quest list */
        .quest-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 20px;
          border-bottom: 1px solid rgba(250,204,21,0.05);
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }
        .quest-item:last-child { border-bottom: none; }
        .quest-item:hover { background: rgba(250,204,21,0.03); }
        .quest-item.done { opacity: 0.45; }

        .quest-check {
          width: 20px; height: 20px;
          border: 1px solid rgba(250,204,21,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
          clip-path: polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
        }
        .quest-item.done .quest-check {
          background: rgba(250,204,21,0.15);
          border-color: #facc15;
          color: #facc15;
        }

        .quest-info { flex: 1; min-width: 0; }
        .quest-name {
          font-size: 13px;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .quest-tag {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
        }

        .quest-diff {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 1px;
          padding: 3px 8px;
          border: 1px solid;
        }
        .quest-xp {
          font-family: 'Orbitron', monospace;
          font-size: 11px;
          color: #facc15;
          font-weight: 600;
          min-width: 48px;
          text-align: right;
        }

        /* Leaderboard */
        .lb-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 20px;
          border-bottom: 1px solid rgba(250,204,21,0.05);
          transition: background 0.2s;
          cursor: pointer;
        }
        .lb-item:last-child { border-bottom: none; }
        .lb-item:hover { background: rgba(250,204,21,0.03); }
        .lb-item.me { background: rgba(250,204,21,0.05); border-left: 2px solid #facc15; }

        .lb-rank {
          font-family: 'Orbitron', monospace;
          font-size: 13px;
          font-weight: 700;
          width: 24px;
          color: rgba(255,255,255,0.3);
          text-align: center;
        }
        .lb-rank.top { color: #facc15; }
        .lb-avatar {
          width: 30px; height: 30px;
          background: rgba(250,204,21,0.1);
          border: 1px solid rgba(250,204,21,0.2);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px;
        }
        .lb-info { flex: 1; }
        .lb-name { font-size: 13px; font-weight: 500; color: #e2e8f0; }
        .lb-streak {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
        }
        .lb-score {
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          color: #facc15;
          font-weight: 600;
        }

        /* Badges */
        .badges-grid {
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 10px;
          padding: 16px 20px 20px;
        }
        .badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }
        .badge-hex {
          width: 44px; height: 44px;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          transition: transform 0.2s;
        }
        .badge-item:hover .badge-hex { transform: scale(1.1); }
        .badge-hex.earned { background: rgba(250,204,21,0.15); border: 1px solid rgba(250,204,21,0.3); filter: drop-shadow(0 0 6px rgba(250,204,21,0.3)); }
        .badge-hex.locked { background: rgba(255,255,255,0.04); filter: grayscale(1) brightness(0.3); }
        .badge-lbl { font-size: 9px; color: rgba(255,255,255,0.3); text-align: center; letter-spacing: 0.5px; font-family: 'Share Tech Mono', monospace; }
        .badge-lbl.earned { color: rgba(250,204,21,0.6); }

        /* Tabs */
        .tabs {
          display: flex;
          border-bottom: 1px solid rgba(250,204,21,0.08);
        }
        .tab {
          padding: 12px 20px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          cursor: pointer;
          border: none;
          background: none;
          transition: color 0.2s;
          position: relative;
        }
        .tab.active { color: #facc15; }
        .tab.active::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0; right: 0;
          height: 2px;
          background: #facc15;
        }
        .tab:hover { color: rgba(250,204,21,0.6); }

        /* Progress ring */
        .progress-ring { display: flex; align-items: center; gap: 20px; padding: 20px; }
        .ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
        .ring-wrap svg { transform: rotate(-90deg); }
        .ring-label {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .ring-val { font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 700; color: #facc15; line-height: 1; }
        .ring-sub { font-size: 8px; color: rgba(255,255,255,0.3); letter-spacing: 1px; font-family: 'Share Tech Mono', monospace; }
        .ring-stats { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .ring-stat-row { display: flex; align-items: center; gap: 10px; }
        .ring-stat-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.05); }
        .ring-stat-fill { height: 100%; transition: width 1s ease; }
        .ring-stat-lbl { font-size: 10px; color: rgba(255,255,255,0.4); width: 48px; font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; }
        .ring-stat-num { font-family: 'Orbitron', monospace; font-size: 11px; color: rgba(255,255,255,0.6); width: 28px; text-align: right; }

        .animate-in { animation: fadeUp 0.5s ease both; }
      `}</style>

      <canvas ref={canvasRef} />
      <div className="bg-overlay" />

      <div className="layout" style={{maxWidth:'100vw', overflowX:'hidden'}}>
        {/* ── TOPBAR ── */}
        <header className="topbar" style={{overflow:'hidden'}}>
          <div className="logo">
            <div className="logo-hex">⬡</div>
            CODEARENA
          </div>

          <div className="topbar-center">
            <div className="season-badge">
              <div className="live-dot" />
              SEASON 4 · ACTIVE
            </div>
            <div className="clock">{time}</div>
          </div>

          <div className="topbar-right">
            <button className="notif-btn">⚡</button>
            <button className="notif-btn">◈</button>
            <div className="avatar" onClick={() => supabase.auth.signOut().then(() => window.location.href = '/login')} style={{cursor:'pointer'}}>{user?.username?.slice(0,2).toUpperCase() || 'KG'}</div>          </div>
        </header>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          <div className="player-card">
            <div className="player-name">{user?.username || 'Player'}</div>
            <div className="player-title">{user?.rank || 'BRONZE'} TIER CODER</div>
            <div className="xp-row">
            <span className="xp-text">LVL {user?.level || 1}</span>
             <span className="xp-text">{user?.xp || 0} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-fill" style={{ width: `${xpAnim}%` }} />
            </div>
            <div className="rank-chip">
              <div className="rank-color" />
              <span className="rank-name">GOLD II · #247 GLOBAL</span>
            </div>
          </div>

          <div className="nav-section">
            <div className="nav-label">NAVIGATE</div>
            {[
             { icon: "🏠", label: "Home", link: "/dashboard" },
            { icon: "📋", label: "Quests", link: "/problems" },
            { icon: "⚔️", label: "Arena (Live)", link: "/arena" },
            { icon: "🏆", label: "Board", link: "/leaderboard" },
            { icon: "⚙️", label: "Settings", link: "/settings" },
            ].map((item) => (
             <button key={item.label}
                 className={`nav-item ${item.active ? "active" : ""}`}
                 onClick={() => item.link && (window.location.href = item.link)}>
                  <span className="nav-icon">{item.icon}</span>
                 {item.label}
                 {item.count && <span className="nav-count">{item.count}</span>}
            </button>
            ))}
          </div>

          <div className="nav-section">
            <div className="nav-label">PLAYER</div>
            {[
             { icon: "👤", label: "My Profile", link: "/profile" },
            { icon: "📋", label: "Submissions", link: "/problems" },
            { icon: "⚙️", label: "Settings", link: "/settings" },
            ].map((item) => (
             <button key={item.label} className="nav-item"
             onClick={() => item.link && (window.location.href = item.link)}>
            <span className="nav-icon">{item.icon}</span>
             {item.label}
            </button>
            ))}
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main className="main">

          {/* Hero */}
          <div className="hero" style={{ marginBottom: 24 }}>
            <div className="hero-tag">WELCOME BACK, PLAYER</div>
            <div className="hero-title">
              Ready to <span>Level Up,</span> {user?.username || 'Player'}?
            </div>
            <div className="hero-sub">You're 3 problems away from reaching Platinum tier</div>
            <div className="hero-stats">
              <div className="hero-stat">
               <span className="hero-stat-val">{user?.streak || 0}</span>
                <span className="hero-stat-lbl">Day Streak</span>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat">
                <span className="hero-stat-val">{user?.solved || 0}</span>
                <span className="hero-stat-lbl">Solved</span>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat">
                <span className="hero-stat-val">#247</span>
                <span className="hero-stat-lbl">Global Rank</span>
              </div>
              <div className="hero-divider" />
              <div className="hero-stat">
                <span className="hero-stat-val">{user?.xp || 0}</span>
                <span className="hero-stat-lbl">Total XP</span>
              </div>
            </div>
            <button className="daily-btn" style={{ position: "absolute", right: 32, top: "50%", transform: "translateY(-50%)" }}>
              <span>⚡ DAILY QUEST</span>
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid3">
            {[
             { icon: "🗡️", val: user?.solved || 0, lbl: "Quests Solved", change: "+3 this week", bg: "🗡️" },
            { icon: "🔥", val: user?.streak || 0, lbl: "Day Streak", change: "Personal best!", bg: "🔥" },
            { icon: "⚡", val: user?.xp || 0, lbl: "Total XP", change: "+1,200 today", bg: "⚡" },
            ].map((s) => (
              <div key={s.lbl} className="stat-card">
                <div className="stat-card-icon">{s.icon}</div>
                <div className="stat-card-val">{s.val}</div>
                <div className="stat-card-lbl">{s.lbl}</div>
                <div className="stat-card-change">▲ {s.change}</div>
                <div className="stat-card-bg">{s.bg}</div>
              </div>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid2">
            {/* Left: Quests */}
            <div className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-dot" />
                  Active Quests
                </div>
                <div style={{ display: "flex", gap: 0 }}>
                  {["quests", "submissions"].map((t) => (
                    <button key={t} className={`tab ${activeTab === t ? "active" : ""}`}
                      onClick={() => setActiveTab(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {QUESTS.map((q) => (
                <div key={q.id} className={`quest-item ${q.done ? "done" : ""}`}>
                  <div className="quest-check">{q.done ? "✓" : ""}</div>
                  <div className="quest-info">
                    <div className="quest-name">{q.title}</div>
                    <div className="quest-tag">{q.tag}</div>
                  </div>
                  <div className="quest-diff" style={{ color: diffColor(q.diff), borderColor: diffColor(q.diff) + "40" }}>
                    {q.diff}
                  </div>
                  <div className="quest-xp">+{q.xp}</div>
                </div>
              ))}
            </div>

            {/* Right col */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Progress */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-title-dot" />Progress</div>
                  <button className="card-action">VIEW ALL →</button>
                </div>
                <div className="progress-ring">
                  <div className="ring-wrap">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(250,204,21,0.08)" strokeWidth="6" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#facc15" strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 34 * 0.578} ${2 * Math.PI * 34}`}
                        strokeLinecap="round" />
                    </svg>
                    <div className="ring-label">
                      <div className="ring-val">142</div>
                      <div className="ring-sub">/ 246</div>
                    </div>
                  </div>
                  <div className="ring-stats">
                    {[
                      { label: "EASY", count: 82, total: 100, color: "#22c55e" },
                      { label: "MEDIUM", count: 48, total: 100, color: "#f59e0b" },
                      { label: "HARD", count: 12, total: 46, color: "#ef4444" },
                    ].map((r) => (
                      <div key={r.label} className="ring-stat-row">
                        <span className="ring-stat-lbl">{r.label}</span>
                        <div className="ring-stat-bar">
                          <div className="ring-stat-fill" style={{ width: `${(r.count / r.total) * 100}%`, background: r.color }} />
                        </div>
                        <span className="ring-stat-num">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboard */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-title-dot" />Top Players</div>
                  <button className="card-action">FULL LIST →</button>
                </div>
                {LEADERBOARD.map((p) => (
                  <div key={p.rank} className={`lb-item ${p.isMe ? "me" : ""}`}>
                    <div className={`lb-rank ${p.rank === 1 ? "top" : ""}`}>#{p.rank}</div>
                    <div className="lb-avatar">{p.badge}</div>
                    <div className="lb-info">
                      <div className="lb-name">{p.name}{p.isMe ? " (You)" : ""}</div>
                      <div className="lb-streak">🔥 {p.streak} day streak</div>
                    </div>
                    <div className="lb-score">{p.score}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="card animate-in">
            <div className="card-header">
              <div className="card-title"><div className="card-title-dot" />Achievement Badges</div>
              <button className="card-action">3 / 6 EARNED</button>
            </div>
            <div className="badges-grid">
              {BADGES.map((b) => (
                <div key={b.label} className="badge-item">
                  <div className={`badge-hex ${b.earned ? "earned" : "locked"}`}>{b.icon}</div>
                  <div className={`badge-lbl ${b.earned ? "earned" : ""}`}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(8,8,16,0.98)',
        borderTop: '1px solid rgba(250,204,21,0.15)',
        padding: '10px 0',
        zIndex: 200,
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 0,
      }} className="mobile-nav">
        {[
        { icon: "🏠", label: "Dashboard", active: true, link: "/dashboard" },
        { icon: "📋", label: "Quests", count: "247", link: "/problems" },
       { icon: "⚔️", label: "Arena", link: "/arena" },
        { icon: "🏆", label: "Board", link: "/leaderboard" },
        { icon: "⚙️", label: "Settings", link: "/settings" },
        ].map((item) => (
          <button key={item.label}
            onClick={() => window.location.href = item.link}
            style={{
              background: 'none', border: 'none', color: 'rgba(250,204,21,0.5)',
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