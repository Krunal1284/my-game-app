"use client";

import { useState } from "react";

const NAV = [
  { id: "profile",       icon: "◉", label: "Player Profile"    },
  { id: "account",       icon: "■", label: "Account & Security" },
  { id: "appearance",    icon: "◈", label: "Appearance"         },
  { id: "editor",        icon: "▸", label: "Code Editor"        },
  { id: "notifications", icon: "⚡", label: "Notifications"     },
  { id: "privacy",       icon: "◆", label: "Privacy"            },
  { id: "danger",        icon: "△", label: "Danger Zone"        },
];

export default function SettingsPage() {
  const [active, setActive]   = useState("profile");
  const [saved, setSaved]     = useState(false);
  const [username, setUsername] = useState("Krunal_GG");
  const [email, setEmail]     = useState("krunal@arena.gg");
  const [bio, setBio]         = useState("Full-stack dev. Grinding DSA daily. Gold II and climbing.");
  const [theme, setTheme]     = useState("DARK");
  const [accent, setAccent]   = useState("#facc15");
  const [fontSize, setFontSize] = useState("14");
  const [tabSize, setTabSize] = useState("2");
  const [editorFont, setEditorFont] = useState("Share Tech Mono");
  const [autoSave, setAutoSave]     = useState(true);
  const [minimap, setMinimap]       = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [emailNotif, setEmailNotif]   = useState(true);
  const [arenaNotif, setArenaNotif]   = useState(true);
  const [rankNotif, setRankNotif]     = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [showStreak, setShowStreak]   = useState(true);
  const [showSolutions, setShowSolutions] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [twoFA, setTwoFA]     = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const ACCENTS = ["#facc15","#22c55e","#ef4444","#3b82f6","#c084fc","#f97316","#06b6d4"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.25); }
        body { background: #080810; font-family: 'Exo 2', sans-serif; color: #e2e8f0; }

        /* TOPBAR */
        .topbar {
          height: 56px; display: flex; align-items: center;
          justify-content: space-between; padding: 0 32px;
          background: rgba(8,8,16,0.98); border-bottom: 1px solid rgba(250,204,21,0.12);
          position: sticky; top: 0; z-index: 100; backdrop-filter: blur(20px);
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', monospace; font-size: 17px;
          font-weight: 900; color: #facc15; letter-spacing: 3px; cursor: pointer;
        }
        .logo-hex {
          width: 30px; height: 30px; background: rgba(250,204,21,0.15);
          border: 1px solid #facc15;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center; font-size: 11px;
        }
        .nav-links { display: flex; gap: 4px; }
        .nav-link {
          padding: 6px 14px; font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          cursor: pointer; border: none; background: none; text-transform: uppercase;
          transition: color 0.2s;
        }
        .nav-link:hover { color: rgba(250,204,21,0.7); }
        .nav-link.active { color: #facc15; }
        .avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg,#facc15,#f59e0b);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #080810; cursor: pointer;
          font-family: 'Orbitron', monospace;
        }

        /* LAYOUT */
        .layout { display: grid; grid-template-columns: 240px 1fr; min-height: calc(100vh - 56px); }

        /* SIDEBAR */
        .sidebar {
          background: rgba(8,8,16,0.8); border-right: 1px solid rgba(250,204,21,0.08);
          padding: 28px 0;
        }
        .sidebar-title {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 4px; color: rgba(250,204,21,0.25);
          padding: 0 20px; margin-bottom: 12px; text-transform: uppercase;
        }
        .sidebar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 20px; cursor: pointer; transition: all 0.15s;
          border: none; background: none; width: 100%; text-align: left;
          color: rgba(255,255,255,0.35); font-size: 13px; font-weight: 500;
          position: relative; letter-spacing: 0.3px;
        }
        .sidebar-item:hover { color: rgba(250,204,21,0.7); background: rgba(250,204,21,0.02); }
        .sidebar-item.active { color: #facc15; background: rgba(250,204,21,0.06); }
        .sidebar-item.active::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 2px; background: #facc15;
        }
        .sidebar-item.danger { color: rgba(239,68,68,0.5); }
        .sidebar-item.danger:hover { color: #ef4444; background: rgba(239,68,68,0.04); }
        .sidebar-item.danger.active { color: #ef4444; background: rgba(239,68,68,0.06); }
        .sidebar-item.danger.active::before { background: #ef4444; }
        .item-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
        .sidebar-divider { height: 1px; background: rgba(250,204,21,0.07); margin: 12px 20px; }

        /* MAIN */
        .main { padding: 36px 48px; overflow-y: auto; max-height: calc(100vh - 56px); }

        /* Section header */
        .section-head {
          margin-bottom: 28px;
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .section-tag {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 4px; color: rgba(250,204,21,0.35); margin-bottom: 6px;
        }
        .section-title {
          font-family: 'Orbitron', monospace; font-size: 22px;
          font-weight: 700; color: #fff;
        }

        /* Cards */
        .card {
          background: rgba(8,8,16,0.85); border: 1px solid rgba(250,204,21,0.1);
          margin-bottom: 16px; animation: fadeUp 0.4s ease both;
        }
        .card-head {
          padding: 14px 20px; border-bottom: 1px solid rgba(250,204,21,0.07);
          display: flex; align-items: center; gap: 8px;
        }
        .card-head-dot { width: 5px; height: 5px; background: #facc15; clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
        .card-head-title {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 3px; color: rgba(250,204,21,0.55); text-transform: uppercase;
        }
        .card-body { padding: 20px; }

        /* Form rows */
        .form-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;
        }
        .form-row.full { grid-template-columns: 1fr; }
        .field { display: flex; flex-direction: column; gap: 7px; }
        .field-label {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: rgba(250,204,21,0.45); text-transform: uppercase;
        }
        .field-input {
          background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.15);
          color: #f5f5f5; font-family: 'Share Tech Mono', monospace;
          font-size: 13px; padding: 11px 14px; outline: none;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
          transition: border-color 0.2s, background 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.15); }
        .field-input:focus { border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.05); }
        textarea.field-input { resize: vertical; min-height: 80px; line-height: 1.6; }
        select.field-input { cursor: pointer; }
        select.field-input option { background: #0d0d1a; }

        /* Toggle */
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
        .toggle-info { flex: 1; }
        .toggle-label { font-size: 13px; font-weight: 500; color: #e2e8f0; margin-bottom: 2px; }
        .toggle-desc { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 0.3px; }
        .toggle {
          width: 44px; height: 24px; background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
          cursor: pointer; position: relative; transition: all 0.25s; flex-shrink: 0;
        }
        .toggle.on { background: rgba(250,204,21,0.2); border-color: rgba(250,204,21,0.5); }
        .toggle::after {
          content: ''; position: absolute; top: 3px; left: 3px;
          width: 16px; height: 16px; background: rgba(255,255,255,0.3);
          border-radius: 50%; transition: all 0.25s;
        }
        .toggle.on::after { left: calc(100% - 19px); background: #facc15; }

        /* Accent picker */
        .accent-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
        .accent-dot {
          width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
          border: 2px solid transparent; transition: transform 0.2s, border-color 0.2s;
          position: relative;
        }
        .accent-dot:hover { transform: scale(1.15); }
        .accent-dot.selected { border-color: rgba(255,255,255,0.6); transform: scale(1.15); }
        .accent-dot.selected::after {
          content: '✓'; position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #080810; font-weight: 700;
        }

        /* Theme cards */
        .theme-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .theme-card {
          padding: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.08);
          transition: all 0.2s; text-align: center;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
        }
        .theme-card:hover { border-color: rgba(250,204,21,0.3); }
        .theme-card.selected { border-color: #facc15; background: rgba(250,204,21,0.06); }
        .theme-preview {
          height: 48px; margin-bottom: 10px; border: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .theme-name {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; color: rgba(255,255,255,0.5);
        }
        .theme-card.selected .theme-name { color: #facc15; }

        /* Save button */
        .save-btn {
          padding: 13px 32px; background: transparent;
          border: 1px solid #facc15; color: #facc15;
          font-family: 'Orbitron', monospace; font-size: 11px;
          font-weight: 700; letter-spacing: 3px; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
          position: relative; overflow: hidden; transition: color 0.25s;
        }
        .save-btn::before {
          content: ''; position: absolute; inset: 0; background: #facc15;
          transform: scaleX(0); transform-origin: left; transition: transform 0.25s; z-index: 0;
        }
        .save-btn:hover::before, .save-btn.saved::before { transform: scaleX(1); }
        .save-btn:hover, .save-btn.saved { color: #080810; }
        .save-btn span { position: relative; z-index: 1; }

        /* Toast */
        .toast {
          position: fixed; bottom: 32px; right: 32px; z-index: 999;
          background: rgba(8,8,16,0.97); border: 1px solid rgba(34,197,94,0.5);
          padding: 14px 24px;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));
          animation: toastIn 0.4s cubic-bezier(0.16,1,0.3,1) both;
          box-shadow: 0 0 24px rgba(34,197,94,0.15);
          display: flex; align-items: center; gap: 10px;
        }
        @keyframes toastIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .toast-icon { color: #22c55e; font-size: 16px; }
        .toast-text { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: #22c55e; letter-spacing: 2px; }

        /* Danger */
        .danger-card {
          background: rgba(239,68,68,0.03); border: 1px solid rgba(239,68,68,0.2);
          margin-bottom: 16px;
        }
        .danger-head { border-bottom: 1px solid rgba(239,68,68,0.12); }
        .danger-head .card-head-dot { background: #ef4444; }
        .danger-head .card-head-title { color: rgba(239,68,68,0.6); }
        .danger-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 0; border-bottom: 1px solid rgba(239,68,68,0.08);
        }
        .danger-row:last-child { border-bottom: none; }
        .danger-info .danger-title { font-size: 13px; font-weight: 500; color: #e2e8f0; margin-bottom: 3px; }
        .danger-info .danger-desc { font-size: 11px; color: rgba(255,255,255,0.3); }
        .danger-btn {
          padding: 8px 18px; background: transparent; border: 1px solid rgba(239,68,68,0.4);
          color: #ef4444; font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
          white-space: nowrap;
        }
        .danger-btn:hover { background: rgba(239,68,68,0.1); border-color: #ef4444; }

        /* Profile avatar section */
        .avatar-section { display: flex; align-items: center; gap: 24px; margin-bottom: 20px; }
        .big-avatar {
          width: 72px; height: 72px;
          background: linear-gradient(135deg,#facc15,#f59e0b);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Orbitron', monospace; font-size: 24px;
          font-weight: 900; color: #080810; flex-shrink: 0;
        }
        .avatar-info .avatar-name {
          font-family: 'Orbitron', monospace; font-size: 16px;
          font-weight: 700; color: #facc15; margin-bottom: 4px;
        }
        .avatar-info .avatar-tier {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: rgba(255,255,255,0.3); letter-spacing: 3px;
        }
        .change-avatar-btn {
          padding: 7px 16px; background: rgba(250,204,21,0.05);
          border: 1px solid rgba(250,204,21,0.2); color: rgba(250,204,21,0.6);
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 2px; cursor: pointer; transition: all 0.2s; margin-top: 8px;
        }
        .change-avatar-btn:hover { background: rgba(250,204,21,0.1); color: #facc15; }

        /* Stat pills */
        .stat-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .stat-pill {
          display: flex; align-items: center; gap: 8px;
          background: rgba(250,204,21,0.05); border: 1px solid rgba(250,204,21,0.12);
          padding: 8px 14px;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .pill-val { font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 700; color: #facc15; }
        .pill-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.3); letter-spacing: 2px; }

        .actions-row { display: flex; align-items: center; gap: 14px; margin-top: 24px; }
        .cancel-btn {
          padding: 13px 24px; background: transparent;
          border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.3);
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
        }
        .cancel-btn:hover { border-color: rgba(255,255,255,0.25); color: rgba(255,255,255,0.6); }
      `}</style>

      {saved && (
        <div className="toast">
          <span className="toast-icon">✓</span>
          <span className="toast-text">SETTINGS SAVED</span>
        </div>
      )}

      {/* TOPBAR */}
      <header className="topbar">
        <div className="logo" onClick={() => window.location.href = "/dashboard"}>
          <div className="logo-hex">⬡</div>
          CODEARENA
        </div>
        <nav className="nav-links">
          {["Dashboard","Problems","Arena","Leaderboard","Profile","Settings"].map((n) => (
            <button key={n}
              className={`nav-link ${n === "Settings" ? "active" : ""}`}
              onClick={() => window.location.href = `/${n.toLowerCase()}`}>
              {n}
            </button>
          ))}
        </nav>
        <div className="avatar">KG</div>
      </header>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-title">// Settings</div>
         {NAV.map((item, i) => (
  <div key={item.id}>
    {i === NAV.length - 1 && <div className="sidebar-divider" />}
    <button
                className={`sidebar-item ${active === item.id ? "active" : ""} ${item.id === "danger" ? "danger" : ""}`}
                onClick={() => setActive(item.id)}>
                <span className="item-icon">{item.icon}</span>
                {item.label}
              </button>
            </div>
          ))}
        </aside>

        {/* MAIN */}
        <main className="main">

          {/* ── PROFILE ── */}
          {active === "profile" && (
            <>
              <div className="section-head">
                <div className="section-tag">// PLAYER PROFILE</div>
                <div className="section-title">Edit Profile</div>
              </div>

              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Player Identity</span></div>
                <div className="card-body">
                  <div className="avatar-section">
                    <div className="big-avatar">KG</div>
                    <div className="avatar-info">
                      <div className="avatar-name">{username}</div>
                      <div className="avatar-tier">// GOLD II · LEVEL 21</div>
                      <button className="change-avatar-btn">CHANGE AVATAR</button>
                    </div>
                  </div>
                  <div className="stat-pills">
                    {[["142","SOLVED"],["21","DAY STREAK"],["#247","GLOBAL RANK"],["98K","TOTAL XP"]].map(([v,l]) => (
                      <div key={l} className="stat-pill">
                        <span className="pill-val">{v}</span>
                        <span className="pill-lbl">{l}</span>
                      </div>
                    ))}
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Username</label>
                      <input className="field-input" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>
                    <div className="field">
                      <label className="field-label">Display Name</label>
                      <input className="field-input" defaultValue="Krunal" />
                    </div>
                  </div>
                  <div className="form-row full">
                    <div className="field">
                      <label className="field-label">Bio</label>
                      <textarea className="field-input" value={bio} onChange={e => setBio(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Country</label>
                      <select className="field-input">
                        <option>🇮🇳 India</option>
                        <option>🇺🇸 United States</option>
                        <option>🇬🇧 United Kingdom</option>
                        <option>🇩🇪 Germany</option>
                        <option>🇯🇵 Japan</option>
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Website</label>
                      <input className="field-input" placeholder="https://yoursite.com" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
                <button className="cancel-btn">CANCEL</button>
              </div>
            </>
          )}

          {/* ── ACCOUNT ── */}
          {active === "account" && (
            <>
              <div className="section-head">
                <div className="section-tag">// ACCOUNT</div>
                <div className="section-title">Account & Security</div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Login Credentials</span></div>
                <div className="card-body">
                  <div className="form-row full">
                    <div className="field">
                      <label className="field-label">Email Address</label>
                      <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Current Password</label>
                      <input className="field-input" type="password" placeholder="••••••••" />
                    </div>
                    <div className="field">
                      <label className="field-label">New Password</label>
                      <input className="field-input" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="form-row full">
                    <div className="field">
                      <label className="field-label">Confirm New Password</label>
                      <input className="field-input" type="password" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Two-Factor Auth</span></div>
                <div className="card-body">
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <div className="toggle-label">Enable 2FA</div>
                      <div className="toggle-desc">Secure your account with an authenticator app</div>
                    </div>
                    <div className={`toggle ${twoFA?"on":""}`} onClick={() => setTwoFA(!twoFA)} />
                  </div>
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
              </div>
            </>
          )}

          {/* ── APPEARANCE ── */}
          {active === "appearance" && (
            <>
              <div className="section-head">
                <div className="section-tag">// APPEARANCE</div>
                <div className="section-title">Customize UI</div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Theme</span></div>
                <div className="card-body">
                  <div className="theme-grid">
                    {[
                      { id:"DARK",   icon:"◉", bg:"#080810", label:"DARK"   },
                      { id:"DARKER", icon:"■", bg:"#04040a", label:"DARKER" },
                      { id:"LIGHT",  icon:"◈", bg:"#f0f0f8", label:"LIGHT"  },
                    ].map(t => (
                      <div key={t.id} className={`theme-card ${theme===t.id?"selected":""}`} onClick={() => setTheme(t.id)}>
                        <div className="theme-preview" style={{background:t.bg}}>{t.icon}</div>
                        <div className="theme-name">{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Accent Color</span></div>
                <div className="card-body">
                  <div className="field-label" style={{marginBottom:12}}>Choose your accent color</div>
                  <div className="accent-row">
                    {ACCENTS.map(c => (
                      <div key={c} className={`accent-dot ${accent===c?"selected":""}`}
                        style={{background:c}} onClick={() => setAccent(c)} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
              </div>
            </>
          )}

          {/* ── EDITOR ── */}
          {active === "editor" && (
            <>
              <div className="section-head">
                <div className="section-tag">// CODE EDITOR</div>
                <div className="section-title">Editor Preferences</div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Editor Config</span></div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Font Size</label>
                      <select className="field-input" value={fontSize} onChange={e => setFontSize(e.target.value)}>
                        {["12","13","14","15","16","18","20"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Tab Size</label>
                      <select className="field-input" value={tabSize} onChange={e => setTabSize(e.target.value)}>
                        {["2","4","8"].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="field">
                      <label className="field-label">Editor Font</label>
                      <select className="field-input" value={editorFont} onChange={e => setEditorFont(e.target.value)}>
                        {["Share Tech Mono","Fira Code","JetBrains Mono","Source Code Pro"].map(f => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label className="field-label">Default Language</label>
                      <select className="field-input">
                        {["JavaScript","Python","Java","C++"].map(l => <option key={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Editor Features</span></div>
                <div className="card-body">
                  {[
                    { label:"Auto Save", desc:"Automatically save code every 30 seconds", val:autoSave, set:setAutoSave },
                    { label:"Minimap",   desc:"Show code minimap on the right side",       val:minimap,  set:setMinimap  },
                    { label:"Line Numbers", desc:"Show line numbers in the editor",         val:lineNumbers, set:setLineNumbers },
                  ].map(t => (
                    <div key={t.label} className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">{t.label}</div>
                        <div className="toggle-desc">{t.desc}</div>
                      </div>
                      <div className={`toggle ${t.val?"on":""}`} onClick={() => t.set(!t.val)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
              </div>
            </>
          )}

          {/* ── NOTIFICATIONS ── */}
          {active === "notifications" && (
            <>
              <div className="section-head">
                <div className="section-tag">// NOTIFICATIONS</div>
                <div className="section-title">Alert Settings</div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Notification Preferences</span></div>
                <div className="card-body">
                  {[
                    { label:"Email Notifications",  desc:"Receive weekly progress reports via email",        val:emailNotif, set:setEmailNotif },
                    { label:"Arena Challenges",      desc:"Alert when someone challenges you to a duel",      val:arenaNotif, set:setArenaNotif },
                    { label:"Rank Changes",          desc:"Notify when your global rank changes",             val:rankNotif,  set:setRankNotif  },
                  ].map(t => (
                    <div key={t.label} className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">{t.label}</div>
                        <div className="toggle-desc">{t.desc}</div>
                      </div>
                      <div className={`toggle ${t.val?"on":""}`} onClick={() => t.set(!t.val)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
              </div>
            </>
          )}

          {/* ── PRIVACY ── */}
          {active === "privacy" && (
            <>
              <div className="section-head">
                <div className="section-tag">// PRIVACY</div>
                <div className="section-title">Privacy Controls</div>
              </div>
              <div className="card">
                <div className="card-head"><div className="card-head-dot"/><span className="card-head-title">Profile Visibility</span></div>
                <div className="card-body">
                  {[
                    { label:"Public Profile",      desc:"Allow others to view your profile and stats",  val:publicProfile,   set:setPublicProfile   },
                    { label:"Show Streak",          desc:"Display your daily streak on leaderboard",    val:showStreak,      set:setShowStreak      },
                    { label:"Show Solutions",       desc:"Let others view your submitted solutions",    val:showSolutions,   set:setShowSolutions   },
                  ].map(t => (
                    <div key={t.label} className="toggle-row">
                      <div className="toggle-info">
                        <div className="toggle-label">{t.label}</div>
                        <div className="toggle-desc">{t.desc}</div>
                      </div>
                      <div className={`toggle ${t.val?"on":""}`} onClick={() => t.set(!t.val)} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="actions-row">
                <button className={`save-btn ${saved?"saved":""}`} onClick={handleSave}><span>{saved ? "✓ SAVED!" : "SAVE CHANGES"}</span></button>
              </div>
            </>
          )}

          {/* ── DANGER ZONE ── */}
          {active === "danger" && (
            <>
              <div className="section-head">
                <div className="section-tag">// DANGER ZONE</div>
                <div className="section-title" style={{color:"#ef4444"}}>Danger Zone</div>
              </div>
              <div className="danger-card card">
                <div className="card-head danger-head"><div className="card-head-dot" style={{background:"#ef4444"}}/><span className="card-head-title" style={{color:"rgba(239,68,68,0.6)"}}>Irreversible Actions</span></div>
                <div className="card-body">
                  {[
                    { title:"Reset Progress",     desc:"Clear all solved problems, XP and streak. Cannot be undone.",  btn:"RESET PROGRESS"  },
                    { title:"Reset Arena Stats",  desc:"Wipe your ELO rating and arena win/loss record.",              btn:"RESET ARENA"     },
                    { title:"Delete Account",     desc:"Permanently delete your account and all associated data.",     btn:"DELETE ACCOUNT"  },
                  ].map(item => (
                    <div key={item.title} className="danger-row">
                      <div className="danger-info">
                        <div className="danger-title">{item.title}</div>
                        <div className="danger-desc">{item.desc}</div>
                      </div>
                      <button className="danger-btn">{item.btn}</button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </main>
      
      </div>
    </>
  );
}

