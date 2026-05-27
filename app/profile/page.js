"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from "react";

const BADGES = [
  { icon: "⚡", label: "Speed Coder",  earned: true,  desc: "Solved a problem in under 5 min" },
  { icon: "🔥", label: "21 Day Streak", earned: true,  desc: "Maintained a 21 day streak" },
  { icon: "🎯", label: "Array Master", earned: true,  desc: "Solved 50+ array problems" },
  { icon: "🌳", label: "Tree Slayer",  earned: false, desc: "Solve 20 tree problems" },
  { icon: "🧠", label: "DP Wizard",    earned: false, desc: "Solve 15 DP problems" },
  { icon: "👑", label: "Legend",       earned: false, desc: "Reach Legend tier" },
];

const RECENT = [
  { id: 1,  title: "Two Sum",             diff: "EASY",   xp: 120,  time: "2m 14s", status: "ACCEPTED", date: "Today" },
  { id: 2,  title: "Valid Parentheses",   diff: "EASY",   xp: 120,  time: "4m 02s", status: "ACCEPTED", date: "Today" },
  { id: 3,  title: "Best Time to Buy",    diff: "EASY",   xp: 150,  time: "6m 45s", status: "ACCEPTED", date: "Yesterday" },
  { id: 4,  title: "Longest Substring",   diff: "MEDIUM", xp: 0,    time: "18m 30s",status: "FAILED",   date: "Yesterday" },
  { id: 5,  title: "Merge Intervals",     diff: "MEDIUM", xp: 280,  time: "11m 12s",status: "ACCEPTED", date: "2 days ago" },
  { id: 6,  title: "3Sum",                diff: "MEDIUM", xp: 0,    time: "—",       status: "FAILED",   date: "3 days ago" },
];

// 1. Change this to an empty array so the server renders a uniform base structure safely
const INITIAL_HEATMAP = Array.from({ length: 52 * 7 }, () => ({ val: 0 }));

const STATS_BREAKDOWN = [
  { label: "EASY",   solved: 82,  total: 100, color: "#22c55e" },
  { label: "MEDIUM", solved: 48,  total: 100, color: "#f59e0b" },
  { label: "HARD",   solved: 12,  total: 46,  color: "#ef4444" },
];

const LANG_STATS = [
  { lang: "Python",     pct: 62, color: "#3b82f6" },
  { lang: "JavaScript", pct: 24, color: "#f59e0b" },
  { lang: "Java",       pct: 9,  color: "#ef4444" },
  { lang: "C++",        pct: 5,  color: "#8b5cf6" },
];

export default function Dashboard() {
    const [user, setUser] = useState(null);
  const [recent, setRecent] = useState([]);

useEffect(() => {
  const getUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      window.location.href = '/login';
      return;
    }
    const { data: submissions } = await supabase
  .from('submissions')
  .select('*')
  .eq('user_id', authUser.id)
  .order('created_at', { ascending: false })
  .limit(6);
if (submissions) setRecent(submissions.map(s => ({
  ...s,
  title: s.problem_title,
  time: s.time_taken ? `${Math.floor(s.time_taken/60)}m ${s.time_taken%60}s` : '—',
  date: new Date(s.created_at).toLocaleDateString(),
  diff: s.difficulty || 'EASY',
  xp: s.xp_earned || 0,
})));
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();
    setUser(data);
  };
  getUser();
}, []);
  const [activeTab, setActiveTab] = useState("overview");
  const [loaded, setLoaded] = useState(false);
  // 2. Control heatmap values inside a state hook
  const [heatmapData, setHeatmapData] = useState(INITIAL_HEATMAP);
  const canvasRef = useRef(null);

  useEffect(() => { 
    setTimeout(() => setLoaded(true), 100); 
    
    // 3. Generate random values ONLY on the client after the component mounts
    const clientHeatmap = Array.from({ length: 52 * 7 }, () => ({
      val: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0,
    }));
    setHeatmapData(clientHeatmap);
  }, []);

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

  const diffColor = (d) => d === "EASY" ? "#22c55e" : d === "MEDIUM" ? "#f59e0b" : "#ef4444";

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
          background: radial-gradient(ellipse at 30% 0%, rgba(250,204,21,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 100%, rgba(234,88,12,0.04) 0%, transparent 50%);
        }
        .page { position: relative; z-index: 1; min-height: 100vh; overflow-x: hidden; }

        /* TOPBAR */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          background: rgba(8,8,16,0.95); border-bottom: 1px solid rgba(250,204,21,0.12);
          backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 100;
        }
        .logo { display: flex; align-items: center; gap: 10px; font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 900; color: #facc15; letter-spacing: 3px; cursor: pointer; }
        .logo-hex { width: 32px; height: 32px; background: rgba(250,204,21,0.15); border: 1px solid #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 6px 16px; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.35); cursor: pointer; border: none; background: none; transition: color 0.2s; text-transform: uppercase; }
        .nav-link:hover { color: rgba(250,204,21,0.7); }
        .nav-link.active { color: #facc15; }
        .avatar { width: 34px; height: 34px; background: linear-gradient(135deg, #facc15, #f59e0b); clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #080810; cursor: pointer; font-family: 'Orbitron', monospace; }

        /* MAIN */
        .main { max-width: 1100px; margin: 0 auto; padding: 36px 40px; overflow-x: hidden; }

        /* PROFILE HERO */
        .profile-hero {
          display: grid; grid-template-columns: auto 1fr auto;
          gap: 28px; align-items: center;
          padding: 28px 32px; margin-bottom: 24px;
          background: rgba(8,8,16,0.8); border: 1px solid rgba(250,204,21,0.12);
          clip-path: polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,0 100%);
          position: relative; overflow: hidden;
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 20}px);
          transition: all 0.6s ease;
        }
        .profile-hero::before {
          content: ''; position: absolute; right: -80px; top: -80px;
          width: 240px; height: 240px;
          background: radial-gradient(circle, rgba(250,204,21,0.07), transparent 70%);
        }

        .profile-avatar-wrap { position: relative; }
        .profile-avatar {
          width: 90px; height: 90px;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          background: linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.1));
          border: 2px solid #facc15;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: #facc15;
          position: relative; z-index: 1;
        }
        .avatar-glow {
          position: absolute; inset: -6px;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          background: rgba(250,204,21,0.1);
          animation: avatarPulse 3s infinite;
        }
        @keyframes avatarPulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .online-dot { position: absolute; bottom: 4px; right: 4px; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid #080810; z-index: 2; animation: livePulse 1.4s infinite; }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 5px rgba(34,197,94,0)} }

        .profile-info { }
        .profile-tag { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 4px; color: rgba(250,204,21,0.4); margin-bottom: 6px; }
        .profile-name { font-family: 'Orbitron', monospace; font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 4px; letter-spacing: 2px; }
        .profile-title { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(250,204,21,0.5); letter-spacing: 3px; margin-bottom: 14px; }
        .profile-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .profile-chip {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px;
          padding: 4px 10px; border: 1px solid rgba(250,204,21,0.2);
          color: rgba(255,255,255,0.4);
        }
        .profile-chip.gold { color: #facc15; border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.06); }

        .profile-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
        .edit-btn {
          padding: 8px 20px; background: none; border: 1px solid rgba(250,204,21,0.3);
          color: rgba(250,204,21,0.6); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .edit-btn:hover { color: #facc15; border-color: #facc15; background: rgba(250,204,21,0.05); }
        .share-btn {
          padding: 8px 20px; background: none; border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.25); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .share-btn:hover { color: rgba(255,255,255,0.5); border-color: rgba(255,255,255,0.2); }

        /* QUICK STATS ROW */
        .quick-stats {
          display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 24px;
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 12}px);
          transition: all 0.6s 0.1s ease;
        }
        .qs-card {
          padding: 16px 18px; background: rgba(8,8,16,0.8);
          border: 1px solid rgba(250,204,21,0.08);
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);
          transition: border-color 0.2s, transform 0.2s; position: relative; overflow: hidden;
        }
        .qs-card:hover { border-color: rgba(250,204,21,0.2); transform: translateY(-2px); }
        .qs-card::after { content: ''; position: absolute; top: 0; right: 0; width: 10px; height: 10px; border-top: 1px solid rgba(250,204,21,0.2); border-right: 1px solid rgba(250,204,21,0.2); }
        .qs-val { font-family: 'Orbitron', monospace; font-size: 22px; font-weight: 700; color: #facc15; line-height: 1; margin-bottom: 4px; }
        .qs-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 2px; }

        /* TABS */
        .tabs-row {
          display: flex; border-bottom: 1px solid rgba(250,204,21,0.08); margin-bottom: 24px;
          opacity: ${loaded ? 1 : 0}; transition: all 0.6s 0.15s ease;
        }
        .tab {
          padding: 12px 22px; font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: rgba(255,255,255,0.3); cursor: pointer;
          border: none; background: none; transition: color 0.2s; position: relative;
        }
        .tab.active { color: #facc15; }
        .tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: #facc15; }
        .tab:hover { color: rgba(250,204,21,0.6); }

        /* CONTENT GRID */
        .content-grid {
          display: grid; grid-template-columns: 1fr 300px; gap: 20px;
          opacity: ${loaded ? 1 : 0}; transform: translateY(${loaded ? 0 : 10}px);
          transition: all 0.6s 0.2s ease;
        }
        .content-left { display: flex; flex-direction: column; gap: 20px; }
        .content-right { display: flex; flex-direction: column; gap: 20px; }

        /* CARD */
        .card { background: rgba(8,8,16,0.85); border: 1px solid rgba(250,204,21,0.1); backdrop-filter: blur(10px); }
        .card-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid rgba(250,204,21,0.07); }
        .card-title { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: rgba(250,204,21,0.5); display: flex; align-items: center; gap: 8px; }
        .card-dot { width: 5px; height: 5px; background: #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .card-action { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(250,204,21,0.3); cursor: pointer; background: none; border: none; letter-spacing: 2px; transition: color 0.2s; }
        .card-action:hover { color: #facc15; }

        /* HEATMAP */
        .heatmap-wrap { padding: 16px 20px 20px; overflow-x: auto; }
        .heatmap-grid { display: grid; grid-template-columns: repeat(52, 10px); grid-template-rows: repeat(7, 10px); gap: 2px; width: fit-content; }
        .heatmap-cell { width: 10px; height: 10px; border-radius: 1px; transition: transform 0.1s; cursor: pointer; }
        .heatmap-cell:hover { transform: scale(1.4); }
        .heatmap-legend { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 1px; }
        .legend-cell { width: 10px; height: 10px; border-radius: 1px; }

        /* PROBLEM BREAKDOWN */
        .breakdown-wrap { padding: 16px 20px 20px; }
        .breakdown-row { margin-bottom: 14px; }
        .breakdown-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .breakdown-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 2px; }
        .breakdown-count { font-family: 'Orbitron', monospace; font-size: 11px; font-weight: 700; }
        .breakdown-bar { height: 6px; background: rgba(255,255,255,0.05); overflow: hidden; }
        .breakdown-fill { height: 100%; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); position: relative; }
        .breakdown-fill::after { content: ''; position: absolute; right: -10px; top: 0; width: 20px; height: 100%; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent); animation: shimmer 2s infinite; }
        @keyframes shimmer { 0%{transform:translateX(-20px)} 100%{transform:translateX(20px)} }

        /* RECENT SUBMISSIONS */
        .submission-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 20px; border-bottom: 1px solid rgba(250,204,21,0.05);
          cursor: pointer; transition: background 0.15s;
        }
        .submission-item:last-child { border-bottom: none; }
        .submission-item:hover { background: rgba(250,204,21,0.03); }
        .sub-status { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .sub-status.accepted { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.4); }
        .sub-status.failed { background: #ef4444; }
        .sub-info { flex: 1; }
        .sub-title { font-size: 13px; font-weight: 500; color: #e2e8f0; margin-bottom: 2px; }
        .sub-meta { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
        .sub-diff { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px; padding: 2px 7px; border: 1px solid; }
        .sub-xp { font-family: 'Orbitron', monospace; font-size: 11px; color: #facc15; font-weight: 600; min-width: 40px; text-align: right; }
        .sub-xp.zero { color: rgba(255,255,255,0.2); }

        /* BADGES */
        .badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 16px 20px 20px; }
        .badge-item { display: flex; flex-direction: column; align-items: center; gap: 6px; cursor: pointer; position: relative; }
        .badge-hex { width: 52px; height: 52px; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); display: flex; align-items: center; justify-content: center; font-size: 20px; transition: transform 0.2s; }
        .badge-item:hover .badge-hex { transform: scale(1.1); }
        .badge-hex.earned { background: rgba(250,204,21,0.12); border: 1px solid rgba(250,204,21,0.3); filter: drop-shadow(0 0 8px rgba(250,204,21,0.3)); }
        .badge-hex.locked { background: rgba(255,255,255,0.03); filter: grayscale(1) brightness(0.25); }
        .badge-lbl { font-size: 9px; text-align: center; letter-spacing: 0.5px; font-family: 'Share Tech Mono', monospace; }
        .badge-lbl.earned { color: rgba(250,204,21,0.6); }
        .badge-lbl.locked { color: rgba(255,255,255,0.2); }

        /* LANG STATS */
        .lang-wrap { padding: 16px 20px 20px; }
        .lang-row { margin-bottom: 12px; }
        .lang-header { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .lang-name { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 1px; }
        .lang-pct { font-family: 'Orbitron', monospace; font-size: 10px; color: rgba(255,255,255,0.4); }
        .lang-bar { height: 4px; background: rgba(255,255,255,0.04); overflow: hidden; }
        .lang-fill { height: 100%; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        /* RANK PROGRESS */
        .rank-progress-wrap { padding: 16px 20px 20px; }
        .rank-current { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .rank-hex { width: 48px; height: 48px; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); background: rgba(250,204,21,0.12); border: 1px solid rgba(250,204,21,0.3); display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .rank-info { }
        .rank-name-text { font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700; color: #facc15; }
        .rank-sub { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 2px; margin-top: 2px; }
        .rank-progress-label { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .rank-progress-text { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .rank-bar { height: 5px; background: rgba(255,255,255,0.05); overflow: hidden; margin-bottom: 10px; }
        .rank-fill { height: 100%; background: linear-gradient(90deg,#facc15,#f59e0b); transition: width 1.5s cubic-bezier(0.4,0,0.2,1); }
        .rank-next { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 2px; text-align: right; }

        @media (max-width: 768px) {
  .topbar { padding: 0 16px; }
  .nav-links { display: none; }
  .main { padding: 16px; overflow-x: hidden; }
  .profile-hero { display: flex; flex-direction: column; gap: 12px; padding: 20px 16px; clip-path: none; }
  .profile-right { display: none; }
  .profile-avatar { width: 64px; height: 64px; font-size: 20px; }
  .profile-name { font-size: 18px; }
  .profile-chips { gap: 6px; }
  .profile-chip { font-size: 8px; padding: 3px 8px; }
  .quick-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .quick-stats > :last-child { grid-column: span 2; }
  .qs-val { font-size: 18px; }
  .tabs-row { overflow-x: auto; }
  .tab { padding: 10px 14px; font-size: 9px; white-space: nowrap; }
  .content-grid { grid-template-columns: 1fr; }
  .content-right { order: -1; width: 100%; overflow: hidden; }
  .content-left { width: 100%; overflow: hidden; }
  .card { width: 100%; overflow: hidden; }
  .breakdown-bar { max-width: 100%; overflow: hidden; }
  .breakdown-fill { max-width: 100%; }
  .rank-bar { max-width: 100%; overflow: hidden; }
  .rank-fill { max-width: 100%; }
  .heatmap-wrap { overflow-x: auto; }
  .badges-grid { grid-template-columns: repeat(3, 1fr); }
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
            {["Dashboard", "Problems", "Arena", "Leaderboard", "Profile"].map((n) => (
  <button key={n} className={`nav-link ${n === "Profile" ? "active" : ""}`}
    onClick={() => {
      window.location.href = `/${n.toLowerCase()}`;
    }}>
    {n}
  </button>
))}
          </nav>
          <div className="avatar" onClick={() => window.location.href = "/settings"}>{user?.username?.slice(0,2).toUpperCase() || 'KG'}</div> 
        </header>

        <main className="main">

          {/* PROFILE HERO */}
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <div className="avatar-glow" />
              <div className="profile-avatar">{user?.username?.slice(0,2).toUpperCase() || 'KG'}</div>
              <div className="online-dot" />
            </div>

            <div className="profile-info">
              <div className="profile-tag">PLAYER PROFILE</div>
             <div className="profile-name">{user?.username || 'Player'}</div>
              <div className="profile-title">{user?.rank || 'BRONZE'} TIER CODER · SEASON 4</div>
              <div className="profile-chips">
                <div className="profile-chip gold">🥇 GOLD II</div>
                <div className="profile-chip">🔥 21 DAY STREAK</div>
                <div className="profile-chip">🌍 INDIA</div>
                <div className="profile-chip"># 247 GLOBAL</div>
                <div className="profile-chip">⚡ JOINED JAN 2024</div>
              </div>
            </div>

            <div className="profile-right">
              <button className="edit-btn" onClick={() => window.location.href = "/settings"}>✎ EDIT PROFILE</button>
              <button className="share-btn">⬡ SHARE</button>
            </div>
          </div>

        {/* QUICK STATS */}
          <div className="quick-stats">
            {[
              { val: user?.solved || 0, lbl: "PROBLEMS SOLVED" },
              { val: user?.xp || 0,     lbl: "TOTAL XP" },
              { val: "#?",              lbl: "GLOBAL RANK" },
              { val: user?.streak || 0, lbl: "DAY STREAK" },
              { val: "3/6",             lbl: "BADGES EARNED" },
            ].map((s) => (
              <div key={s.lbl} className="qs-card">
                <div className="qs-val">{s.val}</div>
                <div className="qs-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          <div className="tabs-row">
            {["overview", "submissions", "badges"].map((t) => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div className="content-grid">
            <div className="content-left">

              {/* HEATMAP */}
              {(activeTab === "overview" || activeTab === "submissions") && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title"><div className="card-dot" />Activity Heatmap</div>
                    <button className="card-action">142 SUBMISSIONS THIS YEAR</button>
                  </div>
                  <div className="heatmap-wrap">
                    <div className="heatmap-grid">
                      {/* 4. Use your client-side map array here */}
                      {heatmapData.map((cell, i) => (
                        <div key={i} className="heatmap-cell" style={{
                          background: cell.val === 0 ? "rgba(255,255,255,0.04)"
                            : cell.val === 1 ? "rgba(250,204,21,0.2)"
                            : cell.val === 2 ? "rgba(250,204,21,0.4)"
                            : cell.val === 3 ? "rgba(250,204,21,0.65)"
                            : "rgba(250,204,21,0.9)"
                        }} />
                      ))}
                    </div>
                    <div className="heatmap-legend">
                      <span>LESS</span>
                      {[0,1,2,3,4].map((v) => (
                        <div key={v} className="legend-cell" style={{
                          background: v === 0 ? "rgba(255,255,255,0.04)"
                            : v === 1 ? "rgba(250,204,21,0.2)"
                            : v === 2 ? "rgba(250,204,21,0.4)"
                            : v === 3 ? "rgba(250,204,21,0.65)"
                            : "rgba(250,204,21,0.9)"
                        }} />
                      ))}
                      <span>MORE</span>
                    </div>
                  </div>
                </div>
              )}

              {/* RECENT SUBMISSIONS */}
              {(activeTab === "overview" || activeTab === "submissions") && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title"><div className="card-dot" />Recent Submissions</div>
                    <button className="card-action">VIEW ALL →</button>
                  </div>
                  {recent.map((r) => (
                    <div key={r.id} className="submission-item" onClick={() => window.location.href = `/solve/${r.id}`}>
                      <div className={`sub-status ${r.status === "ACCEPTED" ? "accepted" : "failed"}`} />
                      <div className="sub-info">
                        <div className="sub-title">{r.title}</div>
                        <div className="sub-meta">{r.status} · {r.time} · {r.date}</div>
                      </div>
                      <div className="sub-diff" style={{ color: diffColor(r.diff), borderColor: diffColor(r.diff) + "40" }}>{r.diff}</div>
                      <div className={`sub-xp ${r.xp === 0 ? "zero" : ""}`}>{r.xp > 0 ? `+${r.xp}` : "—"}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* BADGES TAB */}
              {activeTab === "badges" && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title"><div className="card-dot" />All Badges</div>
                    <button className="card-action">3 / 6 EARNED</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "16px 20px 20px" }}>
                    {BADGES.map((b) => (
                      <div key={b.label} className="badge-item">
                        <div className={`badge-hex ${b.earned ? "earned" : "locked"}`}>{b.icon}</div>
                        <div className={`badge-lbl ${b.earned ? "earned" : "locked"}`}>{b.label}</div>
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center", lineHeight: 1.4 }}>{b.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN */}
            <div className="content-right">

              {/* PROBLEM BREAKDOWN */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-dot" />Problem Breakdown</div>
                </div>
                <div className="breakdown-wrap">
                  {STATS_BREAKDOWN.map((s) => (
                    <div key={s.label} className="breakdown-row">
                      <div className="breakdown-header">
                        <span className="breakdown-label" style={{ color: s.color }}>{s.label}</span>
                        <span className="breakdown-count" style={{ color: s.color }}>{s.solved}<span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>/{s.total}</span></span>
                      </div>
                      <div className="breakdown-bar">
                        <div className="breakdown-fill" style={{ width: `${(s.solved / s.total) * 100}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RANK PROGRESS */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-dot" />Rank Progress</div>
                </div>
                <div className="rank-progress-wrap">
                  <div className="rank-current">
                    <div className="rank-hex">◈</div>
                    <div className="rank-info">
                      <div className="rank-name-text">GOLD II</div>
                      <div className="rank-sub">TOP 15% GLOBALLY</div>
                    </div>
                  </div>
                  <div className="rank-progress-label">
                    <span className="rank-progress-text">GOLD II</span>
                    <span className="rank-progress-text">PLATINUM</span>
                  </div>
                  <div className="rank-bar">
                    <div className="rank-fill" style={{ width: "82%" }} />
                  </div>
                  <div className="rank-next">21,550 XP TO PLATINUM</div>
                </div>
              </div>

              {/* LANGUAGE STATS */}
              <div className="card">
                <div className="card-header">
                  <div className="card-title"><div className="card-dot" />Languages Used</div>
                </div>
                <div className="lang-wrap">
                  {LANG_STATS.map((l) => (
                    <div key={l.lang} className="lang-row">
                      <div className="lang-header">
                        <span className="lang-name">{l.lang}</span>
                        <span className="lang-pct">{l.pct}%</span>
                      </div>
                      <div className="lang-bar">
                        <div className="lang-fill" style={{ width: `${l.pct}%`, background: l.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BADGES MINI */}
              {activeTab === "overview" && (
                <div className="card">
                  <div className="card-header">
                    <div className="card-title"><div className="card-dot" />Badges</div>
                    <button className="card-action" onClick={() => setActiveTab("badges")}>VIEW ALL →</button>
                  </div>
                  <div className="badges-grid">
                    {BADGES.map((b) => (
                      <div key={b.label} className="badge-item">
                        <div className={`badge-hex ${b.earned ? "earned" : "locked"}`}>{b.icon}</div>
                        <div className={`badge-lbl ${b.earned ? "earned" : "locked"}`}>{b.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  );
}