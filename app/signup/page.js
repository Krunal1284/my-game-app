"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "", username: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Save to users table
      const { error: insertError } = await supabase.from("users").insert({
        email: form.email,
        username: form.username,
        xp: 0,
        level: 1,
        streak: 0,
        solved: 0,
        rank: "BRONZE"
      });
      if (insertError) console.error("Insert error:", insertError);
      window.location.href = "/dashboard";
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080810; font-family: 'Share Tech Mono', monospace; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: radial-gradient(ellipse at 20% 50%, rgba(250,204,21,0.05), transparent 60%), #080810; }
        .card { width: 420px; background: rgba(10,10,20,0.95); border: 1px solid rgba(250,204,21,0.2);
          padding: 48px 40px;
          clip-path: polygon(0 0,calc(100% - 20px) 0,100% 20px,100% 100%,20px 100%,0 calc(100% - 20px)); }
        .logo { font-family: 'Orbitron', monospace; font-size: 20px; font-weight: 900;
          color: #facc15; letter-spacing: 3px; text-align: center; margin-bottom: 6px; }
        .tagline { font-size: 10px; color: rgba(250,204,21,0.4); letter-spacing: 4px;
          text-align: center; margin-bottom: 36px; }
        .field { margin-bottom: 20px; }
        .field-label { display: block; font-size: 10px; letter-spacing: 3px;
          color: rgba(250,204,21,0.5); margin-bottom: 8px; text-transform: uppercase; }
        input { width: 100%; background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.15);
          color: #f5f5f5; font-family: 'Share Tech Mono', monospace; font-size: 13px;
          padding: 13px 14px; outline: none;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
          transition: border-color 0.2s; }
        input:focus { border-color: rgba(250,204,21,0.5); background: rgba(250,204,21,0.06); }
        input::placeholder { color: rgba(255,255,255,0.15); }
        .btn { width: 100%; margin-top: 8px; padding: 15px; background: transparent;
          border: 1px solid #facc15; color: #facc15; font-family: 'Orbitron', monospace;
          font-size: 12px; font-weight: 700; letter-spacing: 3px; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));
          transition: all 0.25s; position: relative; overflow: hidden; }
        .btn::before { content: ''; position: absolute; inset: 0; background: #facc15;
          transform: translateX(-101%); transition: transform 0.3s; z-index: 0; }
        .btn:hover::before { transform: translateX(0); }
        .btn:hover { color: #080810; }
        .btn span { position: relative; z-index: 1; }
        .error { color: #ef4444; font-size: 11px; letter-spacing: 1px; margin-top: 12px; text-align: center; }
        .login-link { text-align: center; margin-top: 24px; font-size: 11px;
          color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .login-link a { color: #facc15; cursor: pointer; text-decoration: none; }
      `}</style>

      <div className="page">
        <div className="card">
          <div className="logo">⬡ CODEARENA</div>
          <div className="tagline">// CREATE YOUR PLAYER ACCOUNT</div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label">Username</label>
              <input placeholder="player_name" value={form.username}
                onChange={e => setForm({...form, username: e.target.value})} required />
            </div>
            <div className="field">
              <label className="field-label">Email</label>
              <input type="email" placeholder="player@arena.gg" value={form.email}
                onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="field">
              <label className="field-label">Password</label>
              <input type="password" placeholder="••••••••••" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} required />
            </div>

            {error && <div className="error">⚠ {error}</div>}

            <button type="submit" className="btn">
              <span>{loading ? "Creating Account..." : "⚡ Join Arena"}</span>
            </button>
          </form>

          <div className="login-link">
            Already have an account? <a href="/login">Login here</a>
          </div>
        </div>
      </div>
    </>
  );
}