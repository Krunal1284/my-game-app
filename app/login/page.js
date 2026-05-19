"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const canvasRef = useRef(null);

  // Animated particle grid background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(250, 204, 21, ${p.opacity})`;
        ctx.fill();

        particles.forEach((q) => {
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(250, 204, 21, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://my-game-app-beta.vercel.app/dashboard'
      }
    });
    if (error) alert(error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlitch(true);
    setLoading(true);
    setTimeout(() => setGlitch(false), 600);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          font-family: 'Rajdhani', sans-serif;
          overflow: hidden;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: radial-gradient(ellipse at 20% 50%, rgba(250,204,21,0.04) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(234,179,8,0.03) 0%, transparent 50%),
                      #0a0a0f;
        }

        canvas {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        /* Scan line overlay */
        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0,0,0,0.03) 2px,
            rgba(0,0,0,0.03) 4px
          );
          pointer-events: none;
          z-index: 1;
        }

        .card {
          position: relative;
          z-index: 10;
          width: 420px;
          background: rgba(10, 10, 20, 0.92);
          border: 1px solid rgba(250, 204, 21, 0.2);
          padding: 48px 40px;
          clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px));
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 40px rgba(250,204,21,0.06),
            inset 0 0 40px rgba(0,0,0,0.4),
            0 0 1px rgba(250,204,21,0.3);
          animation: cardIn 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }

        /* Corner decorations */
        .card::before, .card::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          background: #facc15;
        }
        .card::before { bottom: 0; left: 0; clip-path: polygon(0 100%, 100% 100%, 0 0); }
        .card::after  { top: 0; right: 0; clip-path: polygon(100% 0, 100% 100%, 0 0); }

        /* Glitch effect */
        @keyframes glitch {
          0%   { transform: translate(0); }
          20%  { transform: translate(-3px, 1px); clip-path: inset(10% 0 60% 0); }
          40%  { transform: translate(3px, -1px); clip-path: inset(50% 0 10% 0); }
          60%  { transform: translate(-2px, 2px); clip-path: inset(30% 0 40% 0); }
          80%  { transform: translate(2px, -2px); clip-path: inset(0% 0 80% 0); }
          100% { transform: translate(0); clip-path: none; }
        }
        .glitch { animation: glitch 0.5s steps(2) forwards; }

        /* Header */
        .logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .logo-icon {
          width: 36px;
          height: 36px;
          border: 2px solid #facc15;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          background: rgba(250,204,21,0.1);
          flex-shrink: 0;
        }
        .logo-text {
          font-size: 22px;
          font-weight: 700;
          color: #facc15;
          letter-spacing: 3px;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
        }
        .tagline {
          font-size: 12px;
          color: rgba(250,204,21,0.4);
          letter-spacing: 4px;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
          margin-bottom: 36px;
          margin-left: 46px;
        }

        /* Stats bar */
        .stats-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(250,204,21,0.1);
        }
        .stat {
          flex: 1;
          text-align: center;
        }
        .stat-value {
          font-family: 'Share Tech Mono', monospace;
          font-size: 18px;
          color: #facc15;
          display: block;
        }
        .stat-label {
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .stat-divider {
          width: 1px;
          background: rgba(250,204,21,0.15);
          align-self: stretch;
        }

        /* Form elements */
        .field {
          margin-bottom: 20px;
          position: relative;
        }
        .field-label {
          display: block;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(250,204,21,0.5);
          margin-bottom: 8px;
          font-family: 'Share Tech Mono', monospace;
          transition: color 0.2s;
        }
        .field:focus-within .field-label { color: #facc15; }

        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: rgba(250,204,21,0.3);
          font-size: 14px;
          transition: color 0.2s;
          pointer-events: none;
          font-family: 'Share Tech Mono', monospace;
        }
        .field:focus-within .input-icon { color: #facc15; }

        input {
          width: 100%;
          background: rgba(250,204,21,0.03);
          border: 1px solid rgba(250,204,21,0.15);
          color: #f5f5f5;
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          padding: 13px 14px 13px 40px;
          outline: none;
          clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          letter-spacing: 1px;
        }
        input::placeholder { color: rgba(255,255,255,0.15); }
        input:focus {
          border-color: rgba(250,204,21,0.5);
          background: rgba(250,204,21,0.06);
          box-shadow: 0 0 20px rgba(250,204,21,0.06), inset 0 0 10px rgba(250,204,21,0.02);
        }

        /* Active line under focused input */
        .input-line {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          width: 0;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .field:focus-within .input-line { width: 100%; }

        /* Submit button */
        .btn {
          width: 100%;
          margin-top: 8px;
          padding: 15px;
          background: transparent;
          border: 1px solid #facc15;
          color: #facc15;
          font-family: 'Rajdhani', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 4px;
          text-transform: uppercase;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
          transition: color 0.25s;
        }
        .btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #facc15;
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          z-index: 0;
        }
        .btn:hover::before, .btn.loading::before { transform: translateX(0); }
        .btn:hover { color: #0a0a0f; }
        .btn.loading { color: #0a0a0f; pointer-events: none; }

        .btn-text {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(10,10,15,0.3);
          border-top-color: #0a0a0f;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* Bottom row */
        .bottom-row {
          margin-top: 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .link {
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(250,204,21,0.35);
          cursor: pointer;
          font-family: 'Share Tech Mono', monospace;
          transition: color 0.2s;
          text-decoration: none;
          background: none;
          border: none;
        }
        .link:hover { color: #facc15; }

        /* XP bar */
        .xp-section {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid rgba(250,204,21,0.1);
        }
        .xp-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .xp-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(250,204,21,0.4);
          font-family: 'Share Tech Mono', monospace;
        }
        .xp-bar-bg {
          height: 4px;
          background: rgba(250,204,21,0.1);
          clip-path: polygon(0 0, 100% 0, 100% 100%, 4px 100%, 0 calc(100% - 0px));
          overflow: hidden;
        }
        .xp-bar-fill {
          height: 100%;
          width: 68%;
          background: linear-gradient(90deg, #facc15, #f59e0b);
          animation: xpPulse 2s ease-in-out infinite;
          position: relative;
        }
        .xp-bar-fill::after {
          content: '';
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 20px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4));
          animation: xpShine 2s ease-in-out infinite;
        }
        @keyframes xpPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.8; }
        }
        @keyframes xpShine {
          0%   { transform: translateX(-20px); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateX(20px); opacity: 0; }
        }

        /* Rank badge */
        .rank-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.2);
          padding: 4px 10px;
          clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
        }
        .rank-dot {
          width: 6px;
          height: 6px;
          background: #facc15;
          border-radius: 50%;
          animation: rankPulse 1.5s ease-in-out infinite;
        }
        @keyframes rankPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(250,204,21,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(250,204,21,0); }
        }
        .rank-text {
          font-size: 10px;
          letter-spacing: 2px;
          color: #facc15;
          font-family: 'Share Tech Mono', monospace;
        }
      `}</style>

      <canvas ref={canvasRef} />

      <div className="page">
        <div className={`card ${glitch ? "glitch" : ""}`}>

          <div className="logo-row">
            <div className="logo-icon">⬡</div>
            <span className="logo-text">CodeArena</span>
          </div>
          <div className="tagline">Competitive Programming Platform</div>

          {/* Stats bar */}
          <div className="stats-bar">
            <div className="stat">
              <span className="stat-value">3.2M</span>
              <span className="stat-label">Players</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">48K</span>
              <span className="stat-label">Online</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">#247</span>
              <span className="stat-label">Your Rank</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Player ID</label>
              <div className="input-wrap">
                <span className="input-icon">@</span>
                <input
                  type="email"
                  placeholder="player@arena.gg"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <div className="input-line" />
              </div>
            </div>

            <div className="field">
              <label className="field-label">Auth Token</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <div className="input-line" />
              </div>
            </div>

            <button type="submit" className={`btn ${loading ? "loading" : ""}`}>
              <div className="btn-text">
                {loading ? (
                  <>
                    <div className="spinner" />
                    Authenticating...
                  </>
                ) : (
                  "Enter Arena"
                )}
              </div>
            </button>
          </form>

          <button onClick={handleGoogleLogin} style={{
            width:'100%', padding:'13px', background:'transparent',
            border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)',
            fontFamily:"'Share Tech Mono', monospace", fontSize:'12px',
            letterSpacing:'2px', cursor:'pointer', marginTop:'16px',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
          }}>
            <span>G</span> CONTINUE WITH GOOGLE
          </button>

          <div className="bottom-row">
            <button className="link">Forgot Token?</button>
            <div className="rank-badge">
              <div className="rank-dot" />
              <span className="rank-text">GOLD II</span>
            </div>
            <button className="link" onClick={() => window.location.href = "/signup"}>Create Account</button>
          </div>

          {/* XP bar */}
          <div className="xp-section">
            <div className="xp-header">
              <span className="xp-label">Season XP</span>
              <span className="xp-label">6,800 / 10,000</span>
            </div>
            <div className="xp-bar-bg">
              <div className="xp-bar-fill" />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}