"use client";

import { supabase } from '@/lib/supabase';
import { useState, useEffect, useRef } from "react";

const PROBLEM = {
  id: 3,
  title: "Merge Intervals",
  tag: "SORTING",
  diff: "MEDIUM",
  xp: 280,
  acceptance: "46.2%",
  submissions: "2.1M",
  description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
  examples: [
    {
      input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
      output: "[[1,6],[8,10],[15,18]]",
      explanation: "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
    },
    {
      input: "intervals = [[1,4],[4,5]]",
      output: "[[1,5]]",
      explanation: "Intervals [1,4] and [4,5] are considered overlapping.",
    },
  ],
  constraints: [
    "1 <= intervals.length <= 10⁴",
    "intervals[i].length == 2",
    "0 <= starti <= endi <= 10⁴",
  ],
  hints: [
    "Sort the intervals by their start point.",
    "After sorting, can you figure out which intervals overlap?",
    "Check if the current interval's start is ≤ previous interval's end.",
  ],
  starterCode: {
    python: `class Solution:
    def merge(self, intervals: List[List[int]]) -> List[List[int]]:
        # Your solution here
        pass`,
    javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
var merge = function(intervals) {
    // Your solution here
};`,
    java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Your solution here
        return new int[][]{};
    }
}`,
    cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Your solution here
        return {};
    }
};`,
  },
};

const SIMILAR = [
  { id: 56, title: "Insert Interval", diff: "MEDIUM", xp: 280 },
  { id: 57, title: "Meeting Rooms", diff: "EASY", xp: 120 },
  { id: 58, title: "Non-overlapping Intervals", diff: "MEDIUM", xp: 280 },
];

const TEST_CASES = [
  { id: 1, input: "[[1,3],[2,6],[8,10],[15,18]]", expected: "[[1,6],[8,10],[15,18]]", status: null },
  { id: 2, input: "[[1,4],[4,5]]", expected: "[[1,5]]", status: null },
  { id: 3, input: "[[1,4],[0,4]]", expected: "[[0,4]]", status: null },
];

export default function SolvePage() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(PROBLEM.starterCode.python);
  const [activeLeft, setActiveLeft] = useState("description");
  const [activeBottom, setActiveBottom] = useState("testcases");
  const [testCases, setTestCases] = useState(TEST_CASES);
  const [runStatus, setRunStatus] = useState(null); // null | 'passed' | 'failed'
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'accepted' | 'failed'
  const [isJudging, setIsJudging] = useState(false);
  const [judgeMode, setJudgeMode] = useState(null); // 'run' | 'submit'
  const [judgeError, setJudgeError] = useState(null);
  const [bottomOpen, setBottomOpen] = useState(true);
  const [hintsShown, setHintsShown] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(true);
  const [showXPBurst, setShowXPBurst] = useState(false);
  const [animatedXp, setAnimatedXp] = useState(0);
  const [splitPos, setSplitPos] = useState(42); // percent for left panel
  const canvasRef = useRef(null);
  const textareaRef = useRef(null);
  const dragRef = useRef(false);

  // Timer
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const passedCount = testCases.filter((tc) => tc.status === "pass").length;
  const failedCount = testCases.filter((tc) => tc.status === "fail").length;

  useEffect(() => {
    if (!showXPBurst) {
      setAnimatedXp(0);
      return;
    }

    const start = performance.now();
    const duration = 1400;
    const target = PROBLEM.xp;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedXp(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [showXPBurst]);

  // Sync starter code when lang changes
  useEffect(() => {
    setCode(PROBLEM.starterCode[lang]);
  }, [lang]);

  // Canvas hex bg
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const hexSize = 36;
    const hexes = [];
    for (let row = 0; row < h / (hexSize * 1.5) + 2; row++) {
      for (let col = 0; col < w / (hexSize * 1.73) + 2; col++) {
        hexes.push({
          x: col * hexSize * 1.73 + (row % 2) * hexSize * 0.865,
          y: row * hexSize * 1.5,
          op: Math.random() * 0.04 + 0.008,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }
    let frame = 0, animId;
    const drawHex = (cx, cy, size, op) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        i === 0 ? ctx.moveTo(cx + size * Math.cos(a), cy + size * Math.sin(a))
                : ctx.lineTo(cx + size * Math.cos(a), cy + size * Math.sin(a));
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

  // Tab handling in textarea
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 4; }, 0);
    }
  };

  const runJudge = async () => {
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language: lang,
          testCases: testCases.map(({ id, input, expected }) => ({
            id,
            input,
            expected,
          })),
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        return {
          ok: false,
          passed: false,
          output: "Invalid response from judge API",
          results: [],
        };
      }

      return {
        ok: response.ok,
        passed: Boolean(data.passed),
        output: data.output ?? "Judging failed",
        results: Array.isArray(data.results) ? data.results : [],
      };
    } catch (error) {
      return {
        ok: false,
        passed: false,
        output: error?.message || "Could not reach judge API",
        results: [],
      };
    }
  };

  const applyJudgeResults = (results, fallbackOutput = "") => {
    if (results.length > 0) {
      setTestCases((prev) =>
        prev.map((tc) => {
          const match = results.find((r) => r.id === tc.id);
          return match
            ? { ...tc, output: match.output, status: match.status }
            : tc;
        })
      );
      return;
    }

    setTestCases((prev) =>
      prev.map((tc, index) =>
        index === 0
          ? { ...tc, output: fallbackOutput, status: "fail" }
          : { ...tc, status: "fail" }
      )
    );
  };

  const executeJudge = async (mode) => {
    setIsJudging(true);
    setJudgeMode(mode);
    setJudgeError(null);
    setActiveBottom("testcases");
    setBottomOpen(true);

    if (mode === "submit") {
      setSubmitStatus(null);
    }

    try {
      const verdict = await runJudge();
      applyJudgeResults(verdict.results, verdict.output);

      if (!verdict.ok) {
        setJudgeError(verdict.output);
        setRunStatus("failed");
        if (mode === "submit") {
          setSubmitStatus("failed");
          setActiveBottom("result");
        }
        return;
      }

      if (mode === "run") {
        setRunStatus(verdict.passed ? "passed" : "failed");
        if (!verdict.passed && verdict.output) {
          setJudgeError(verdict.output);
        }
        return;
      }

      if (!verdict.passed) {
        setRunStatus("failed");
        setSubmitStatus("failed");
        setActiveBottom("result");
        if (verdict.output) setJudgeError(verdict.output);
        return;
      }

      setTimerActive(false);
      setRunStatus("passed");
      setSubmitStatus("accepted");
      setShowXPBurst(true);
      setActiveBottom("result");
      setTimeout(() => setShowXPBurst(false), 3200);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (userData) {
          await supabase
            .from("users")
            .update({
              xp: (userData.xp || 0) + PROBLEM.xp,
              solved: (userData.solved || 0) + 1,
              level:
                Math.floor(((userData.xp || 0) + PROBLEM.xp) / 1000) + 1,
            })
            .eq("email", user.email);

          await supabase.from("submissions").insert({
            user_id: user.id,
            problem_id: PROBLEM.id,
            problem_title: PROBLEM.title,
            language: lang,
            code,
            status: "ACCEPTED",
            xp_earned: PROBLEM.xp,
            time_taken: time,
          });
        }
      }
    } catch (error) {
      const message = error?.message || "Judge request failed";
      setJudgeError(message);
      setRunStatus("failed");
      if (mode === "submit") {
        setSubmitStatus("failed");
        setActiveBottom("result");
      }
    } finally {
      setIsJudging(false);
      setJudgeMode(null);
    }
  };

  const handleRun = () => executeJudge("run");
  const handleSubmit = () => executeJudge("submit");

  const diffColor = (d) => d === "EASY" ? "#22c55e" : d === "MEDIUM" ? "#f59e0b" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Exo+2:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: #080810; }
        ::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.3); border-radius: 2px; }
        body { background: #080810; font-family: 'Exo 2', sans-serif; color: #e2e8f0; overflow: hidden; }
        canvas { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
        .bg-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at 0% 0%, rgba(250,204,21,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 100% 100%, rgba(234,88,12,0.04) 0%, transparent 50%);
        }

        /* ── LAYOUT ── */
        .app { position: relative; z-index: 1; height: 100vh; display: flex; flex-direction: column; }

        /* TOPBAR */
        .topbar {
          height: 52px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 16px;
          background: rgba(8,8,16,0.95);
          border-bottom: 1px solid rgba(250,204,21,0.1);
          backdrop-filter: blur(20px);
          z-index: 50;
        }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: 1px solid rgba(250,204,21,0.15);
          color: rgba(250,204,21,0.5); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; padding: 5px 12px; cursor: pointer;
          clip-path: polygon(4px 0,100% 0,100% calc(100% - 4px),calc(100% - 4px) 100%,0 100%,0 4px);
          transition: all 0.2s;
        }
        .back-btn:hover { color: #facc15; border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.05); }
        .problem-title-bar { display: flex; align-items: center; gap: 10px; }
        .problem-id { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: rgba(250,204,21,0.3); }
        .problem-name { font-family: 'Orbitron', monospace; font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 1px; }
        .diff-badge {
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px;
          padding: 3px 8px; border: 1px solid;
        }

        .topbar-center { display: flex; align-items: center; gap: 8px; }
        .lang-btn {
          padding: 5px 12px; background: none; border: 1px solid rgba(250,204,21,0.1);
          color: rgba(255,255,255,0.35); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
        }
        .lang-btn.active { color: #facc15; border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.06); }
        .lang-btn:hover:not(.active) { color: rgba(255,255,255,0.6); border-color: rgba(250,204,21,0.2); }

        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .timer {
          font-family: 'Share Tech Mono', monospace; font-size: 13px;
          color: rgba(250,204,21,0.6); letter-spacing: 3px;
          background: rgba(250,204,21,0.04); border: 1px solid rgba(250,204,21,0.1);
          padding: 4px 12px;
        }
        .timer.stopped { color: rgba(34,197,94,0.7); }
        .xp-pill {
          display: flex; align-items: center; gap: 6px;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: rgba(250,204,21,0.5); letter-spacing: 1px;
        }
        .xp-hex { font-size: 14px; }

        .run-btn {
          padding: 7px 18px; background: transparent;
          border: 1px solid rgba(250,204,21,0.3); color: rgba(250,204,21,0.8);
          font-family: 'Orbitron', monospace; font-size: 10px; font-weight: 700;
          letter-spacing: 2px; cursor: pointer; transition: all 0.2s;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
        }
        .run-btn:hover { background: rgba(250,204,21,0.1); border-color: #facc15; color: #facc15; }
        .run-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        .submit-btn {
          padding: 7px 20px;
          background: linear-gradient(135deg,#facc15,#f59e0b);
          border: none; color: #080810; font-family: 'Orbitron', monospace;
          font-size: 10px; font-weight: 900; letter-spacing: 2px; cursor: pointer;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
          transition: all 0.2s; position: relative; overflow: hidden;
        }
        .submit-btn::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg,#fff8,transparent);
          transform: translateX(-100%); transition: transform 0.3s;
        }
        .submit-btn:hover::before { transform: translateX(100%); }
        .submit-btn:hover { filter: brightness(1.1); }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* MAIN BODY */
        .body { flex: 1; display: flex; overflow: hidden; }

        /* LEFT PANEL */
        .left-panel {
          width: ${splitPos}%;
          flex-shrink: 0;
          display: flex; flex-direction: column;
          border-right: 1px solid rgba(250,204,21,0.08);
          background: rgba(8,8,16,0.7);
          overflow: hidden;
        }

        /* RESIZER */
        .resizer {
          width: 4px; flex-shrink: 0; cursor: col-resize;
          background: rgba(250,204,21,0.06);
          transition: background 0.2s; position: relative; z-index: 10;
        }
        .resizer:hover { background: rgba(250,204,21,0.25); }

        /* RIGHT PANEL */
        .right-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        /* TABS */
        .panel-tabs { display: flex; border-bottom: 1px solid rgba(250,204,21,0.08); flex-shrink: 0; }
        .ptab {
          padding: 10px 18px; font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.3);
          cursor: pointer; border: none; background: none; transition: color 0.2s; position: relative;
        }
        .ptab.active { color: #facc15; }
        .ptab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: #facc15; }
        .ptab:hover { color: rgba(250,204,21,0.6); }

        /* DESCRIPTION PANEL */
        .desc-scroll { flex: 1; overflow-y: auto; padding: 24px 20px; }

        .problem-header { margin-bottom: 20px; }
        .problem-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
        .meta-chip {
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px;
          padding: 3px 8px; border: 1px solid rgba(250,204,21,0.15);
          color: rgba(255,255,255,0.3);
        }
        .problem-desc-title {
          font-family: 'Orbitron', monospace; font-size: 18px; font-weight: 800;
          color: #fff; line-height: 1.3; margin-bottom: 6px;
        }
        .xp-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: #facc15; background: rgba(250,204,21,0.08);
          border: 1px solid rgba(250,204,21,0.2); padding: 3px 10px;
        }

        .section-label {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 3px; color: rgba(250,204,21,0.4);
          text-transform: uppercase; margin-bottom: 10px; margin-top: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::after { content: ''; flex: 1; height: 1px; background: rgba(250,204,21,0.08); }

        .desc-text { font-size: 13px; line-height: 1.8; color: rgba(255,255,255,0.65); }

        .example-box {
          background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.1);
          padding: 14px 16px; margin-bottom: 10px;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
        }
        .example-num {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          color: rgba(250,204,21,0.4); letter-spacing: 2px; margin-bottom: 8px;
        }
        .io-row { display: flex; gap: 8px; margin-bottom: 4px; align-items: flex-start; }
        .io-label { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3); width: 72px; flex-shrink: 0; letter-spacing: 1px; }
        .io-val { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #e2e8f0; }
        .io-note { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 6px; font-style: italic; }

        .constraint-list { list-style: none; }
        .constraint-list li {
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: rgba(255,255,255,0.45); padding: 4px 0;
          border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; gap: 8px;
        }
        .constraint-list li::before { content: '◦'; color: rgba(250,204,21,0.3); font-size: 14px; }

        /* HINTS */
        .hint-item {
          background: rgba(250,204,21,0.03); border: 1px solid rgba(250,204,21,0.08);
          padding: 12px 14px; margin-bottom: 8px; font-size: 12px;
          color: rgba(255,255,255,0.55); line-height: 1.6;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .hint-num { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(250,204,21,0.4); letter-spacing: 2px; margin-bottom: 4px; }
        .hint-reveal-btn {
          display: flex; align-items: center; gap: 8px;
          background: none; border: 1px dashed rgba(250,204,21,0.15);
          color: rgba(250,204,21,0.4); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; padding: 10px 14px; cursor: pointer;
          width: 100%; margin-bottom: 8px; transition: all 0.2s;
        }
        .hint-reveal-btn:hover { border-color: rgba(250,204,21,0.4); color: #facc15; background: rgba(250,204,21,0.04); }

        /* SIMILAR */
        .similar-item {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 0; border-bottom: 1px solid rgba(250,204,21,0.06);
          cursor: pointer; transition: opacity 0.2s;
        }
        .similar-item:hover { opacity: 0.75; }
        .similar-item:last-child { border-bottom: none; }
        .similar-num { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.2); width: 32px; }
        .similar-name { flex: 1; font-size: 12px; color: #e2e8f0; }
        .similar-xp { font-family: 'Orbitron', monospace; font-size: 10px; color: #facc15; }

        /* CODE EDITOR AREA */
        .editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .editor-toolbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 14px; border-bottom: 1px solid rgba(250,204,21,0.06);
          flex-shrink: 0;
        }
        .editor-toolbar-left { display: flex; align-items: center; gap: 12px; }
        .editor-label { font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 3px; color: rgba(250,204,21,0.3); }
        .toolbar-action {
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px;
          color: rgba(255,255,255,0.2); background: none; border: none; cursor: pointer; transition: color 0.2s; padding: 2px 6px;
        }
        .toolbar-action:hover { color: rgba(250,204,21,0.6); }

        .code-wrap { flex: 1; overflow: hidden; position: relative; display: flex; }
        .line-numbers {
          width: 44px; padding: 16px 8px; background: rgba(0,0,0,0.2);
          border-right: 1px solid rgba(250,204,21,0.05); flex-shrink: 0;
          overflow: hidden; text-align: right;
        }
        .line-num {
          font-family: 'Share Tech Mono', monospace; font-size: 12px; line-height: 1.65;
          color: rgba(255,255,255,0.12); height: 19.8px;
        }
        .code-textarea {
          flex: 1; padding: 16px 16px; background: transparent;
          border: none; outline: none; resize: none;
          font-family: 'Share Tech Mono', monospace; font-size: 12px; line-height: 1.65;
          color: #e2e8f0; caret-color: #facc15; tab-size: 4; overflow-y: auto;
        }
        /* Syntax color hints via text shadow - basic effect */
        .code-textarea { color: #a8b4c8; }

        /* BOTTOM PANEL */
        .bottom-panel {
          flex-shrink: 0; border-top: 1px solid rgba(250,204,21,0.08);
          background: rgba(8,8,16,0.9); display: flex; flex-direction: column;
          transition: height 0.3s ease;
          height: ${bottomOpen ? "200px" : "36px"};
        }
        .bottom-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 14px; height: 36px; flex-shrink: 0;
          border-bottom: ${bottomOpen ? "1px solid rgba(250,204,21,0.06)" : "none"};
          cursor: pointer;
        }
        .bottom-tabs { display: flex; }
        .btab {
          padding: 0 14px; height: 36px; display: flex; align-items: center;
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 2px;
          color: rgba(255,255,255,0.25); cursor: pointer; border: none; background: none;
          transition: color 0.2s; position: relative;
        }
        .btab.active { color: #facc15; }
        .btab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px; background: #facc15; }
        .toggle-btn { background: none; border: none; color: rgba(255,255,255,0.2); cursor: pointer; font-size: 10px; padding: 4px; transition: color 0.2s; }
        .toggle-btn:hover { color: rgba(250,204,21,0.5); }
        .bottom-body { flex: 1; overflow-y: auto; padding: 12px 14px; }

        /* TEST CASES */
        .tc-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 10px; }
        .tc-item {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
          padding: 10px 12px;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,0 100%);
          transition: border-color 0.3s;
        }
        .tc-item.pass { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.03); }
        .tc-item.fail { border-color: rgba(239,68,68,0.3); background: rgba(239,68,68,0.03); }
        .tc-item.pending { border-color: rgba(255,255,255,0.06); }
        .tc-num { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.2); letter-spacing: 2px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .tc-num-left { display: flex; align-items: center; gap: 8px; }
        .tc-status-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .tc-status-dot.pass { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.6); }
        .tc-status-dot.fail { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,0.6); }
        .tc-status-label {
          font-family: 'Orbitron', monospace; font-size: 8px; font-weight: 700; letter-spacing: 1px;
          padding: 2px 6px; border: 1px solid transparent;
        }
        .tc-status-label.pass { color: #22c55e; border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); }
        .tc-status-label.fail { color: #ef4444; border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }
        .tc-status-label.pending { color: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.08); }
        .tc-io { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.4); line-height: 1.7; }
        .tc-io span { color: rgba(250,204,21,0.6); }
        .tc-row { margin-bottom: 4px; word-break: break-all; }
        .tc-row.mismatch { color: #fca5a5; }
        .tc-row.mismatch span { color: #f87171; }

        /* RUNNING STATE */
        .running-bar {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; min-height: 120px; width: 100%;
          font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(250,204,21,0.5); letter-spacing: 2px;
        }
        .running-bar-title { font-family: 'Orbitron', monospace; font-size: 12px; color: #facc15; letter-spacing: 3px; }
        .running-bar-sub { font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
        .judge-error-banner {
          margin-bottom: 12px; padding: 10px 12px;
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #fca5a5;
          line-height: 1.5; letter-spacing: 0.5px;
          clip-path: polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,0 100%);
        }
        .judge-error-banner strong { color: #ef4444; letter-spacing: 1px; }
        .run-status-chip {
          font-family: 'Share Tech Mono', monospace; font-size: 9px; letter-spacing: 1px;
          padding: 4px 8px; border: 1px solid rgba(255,255,255,0.1);
        }
        .run-status-chip.passed { color: #22c55e; border-color: rgba(34,197,94,0.3); }
        .run-status-chip.failed { color: #ef4444; border-color: rgba(239,68,68,0.3); }
        .running-dots span {
          display: inline-block; width: 4px; height: 4px; background: #facc15; border-radius: 50%;
          animation: dotBounce 1s infinite; margin-right: 3px;
        }
        .running-dots span:nth-child(2) { animation-delay: 0.15s; }
        .running-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-4px);opacity:1} }

        /* RESULT */
        .result-panel { display: flex; flex-direction: column; gap: 10px; }
        .result-accepted, .result-failed {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 16px;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);
          animation: resultBannerIn 0.35s ease;
        }
        .result-accepted {
          background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.2);
        }
        .result-failed {
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.25);
        }
        @keyframes resultBannerIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .result-icon { font-size: 22px; }
        .result-text { flex: 1; }
        .result-heading {
          font-family: 'Orbitron', monospace; font-size: 14px; font-weight: 700;
          margin-bottom: 2px; letter-spacing: 1px;
        }
        .result-heading.accepted { color: #22c55e; }
        .result-heading.failed { color: #ef4444; }
        .result-sub { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3); letter-spacing: 1px; }
        .result-error-detail {
          margin-top: 8px; font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: #fca5a5; line-height: 1.5; word-break: break-word;
        }
        .result-stats { display: flex; gap: 16px; flex-wrap: wrap; }
        .result-stat { text-align: center; }
        .result-stat-val {
          font-family: 'Orbitron', monospace; font-size: 16px; font-weight: 700; color: #facc15;
          transition: transform 0.2s ease, text-shadow 0.2s ease;
        }
        .result-stat-val.xp-pop {
          animation: xpStatPop 0.6s ease;
          text-shadow: 0 0 12px rgba(250,204,21,0.5);
        }
        @keyframes xpStatPop {
          0% { transform: scale(0.85); }
          50% { transform: scale(1.12); }
          100% { transform: scale(1); }
        }
        .result-stat-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: rgba(255,255,255,0.25); letter-spacing: 1px; }
        .xp-pill.earned { animation: xpPillPulse 1.4s ease; border-color: rgba(250,204,21,0.5); }
        @keyframes xpPillPulse {
          0%, 100% { box-shadow: none; }
          40% { box-shadow: 0 0 16px rgba(250,204,21,0.35); }
        }

        /* XP BURST */
        .xp-burst {
          position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
          z-index: 200; pointer-events: none;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          animation: burstAnim 3s ease forwards;
        }
        @keyframes burstAnim {
          0%   { opacity:0; transform:translate(-50%,-50%) scale(0.5); }
          15%  { opacity:1; transform:translate(-50%,-60%) scale(1.1); }
          70%  { opacity:1; transform:translate(-50%,-70%) scale(1); }
          100% { opacity:0; transform:translate(-50%,-90%) scale(0.9); }
        }
        .xp-burst-num {
          font-family: 'Orbitron', monospace; font-size: 52px; font-weight: 900;
          color: #facc15; text-shadow: 0 0 40px rgba(250,204,21,0.6), 0 0 80px rgba(250,204,21,0.3);
          line-height: 1;
        }
        .xp-burst-lbl {
          font-family: 'Share Tech Mono', monospace; font-size: 14px;
          color: rgba(250,204,21,0.7); letter-spacing: 4px;
        }
      `}</style>

      <canvas ref={canvasRef} />
      <div className="bg-overlay" />

      {showXPBurst && (
        <div className="xp-burst">
          <div className="xp-burst-num">+{animatedXp || PROBLEM.xp}</div>
          <div className="xp-burst-lbl">XP EARNED</div>
        </div>
      )}

      <div className="app">
        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="back-btn">◂ ARENA</button>
            <div className="problem-title-bar">
              <span className="problem-id">#{PROBLEM.id}</span>
              <span className="problem-name">{PROBLEM.title}</span>
              <span className="diff-badge" style={{ color: diffColor(PROBLEM.diff), borderColor: diffColor(PROBLEM.diff) + "40" }}>
                {PROBLEM.diff}
              </span>
            </div>
          </div>

          <div className="topbar-center">
            {["python", "javascript", "java", "cpp"].map((l) => (
              <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
                {l === "cpp" ? "C++" : l.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="topbar-right">
            <div className={`xp-pill ${showXPBurst ? "earned" : ""}`}>
              <span className="xp-hex">⚡</span>
              {showXPBurst ? `+${animatedXp} XP` : `+${PROBLEM.xp} XP`}
            </div>
            <div className={`timer ${!timerActive ? "stopped" : ""}`}>{formatTime(time)}</div>
            <button className="run-btn" onClick={handleRun} disabled={isJudging}>▶ RUN</button>
            <button className="submit-btn" onClick={handleSubmit} disabled={isJudging}>⬡ SUBMIT</button>
          </div>
        </header>

        {/* ── BODY ── */}
        <div className="body">

          {/* LEFT PANEL */}
          <div className="left-panel" style={{ width: `${splitPos}%` }}>
            <div className="panel-tabs">
              {["description", "hints", "similar"].map((t) => (
                <button key={t} className={`ptab ${activeLeft === t ? "active" : ""}`} onClick={() => setActiveLeft(t)}>
                  {t.toUpperCase()}
                  {t === "hints" && ` (${hintsShown}/${PROBLEM.hints.length})`}
                </button>
              ))}
            </div>

            <div className="desc-scroll">
              {/* DESCRIPTION */}
              {activeLeft === "description" && (
                <>
                  <div className="problem-header">
                    <div className="problem-meta">
                      <span className="diff-badge" style={{ color: diffColor(PROBLEM.diff), borderColor: diffColor(PROBLEM.diff) + "40" }}>
                        {PROBLEM.diff}
                      </span>
                      <span className="meta-chip">{PROBLEM.tag}</span>
                      <span className="meta-chip">ACCEPT {PROBLEM.acceptance}</span>
                      <span className="meta-chip">{PROBLEM.submissions} SUBMISSIONS</span>
                    </div>
                    <div className="problem-desc-title">{PROBLEM.title}</div>
                    <div className="xp-tag">⚡ +{PROBLEM.xp} XP ON SOLVE</div>
                  </div>

                  <div className="desc-text">{PROBLEM.description}</div>

                  <div className="section-label">EXAMPLES</div>
                  {PROBLEM.examples.map((ex, i) => (
                    <div key={i} className="example-box">
                      <div className="example-num">EXAMPLE {i + 1}</div>
                      <div className="io-row">
                        <span className="io-label">Input:</span>
                        <span className="io-val">{ex.input}</span>
                      </div>
                      <div className="io-row">
                        <span className="io-label">Output:</span>
                        <span className="io-val">{ex.output}</span>
                      </div>
                      {ex.explanation && <div className="io-note">↳ {ex.explanation}</div>}
                    </div>
                  ))}

                  <div className="section-label">CONSTRAINTS</div>
                  <ul className="constraint-list">
                    {PROBLEM.constraints.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </>
              )}

              {/* HINTS */}
              {activeLeft === "hints" && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    {PROBLEM.hints.slice(0, hintsShown).map((h, i) => (
                      <div key={i} className="hint-item">
                        <div className="hint-num">HINT {i + 1}</div>
                        {h}
                      </div>
                    ))}
                    {hintsShown < PROBLEM.hints.length && (
                      <button className="hint-reveal-btn" onClick={() => setHintsShown((p) => p + 1)}>
                        ◦ REVEAL HINT {hintsShown + 1} <span style={{ marginLeft: "auto", opacity: 0.4 }}>(-5 XP)</span>
                      </button>
                    )}
                    {hintsShown === 0 && (
                      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 2, marginTop: 12 }}>
                        // Stuck? Reveal hints one by one. Each costs 5 XP.
                      </div>
                    )}
                    {hintsShown === PROBLEM.hints.length && (
                      <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "rgba(34,197,94,0.4)", letterSpacing: 2, marginTop: 8 }}>
                        ✓ ALL HINTS REVEALED
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* SIMILAR */}
              {activeLeft === "similar" && (
                <>
                  <div className="section-label">RELATED QUESTS</div>
                  {SIMILAR.map((s) => (
                    <div key={s.id} className="similar-item">
                      <span className="similar-num">#{s.id}</span>
                      <span className="similar-name">{s.title}</span>
                      <span className="diff-badge" style={{ color: diffColor(s.diff), borderColor: diffColor(s.diff) + "40", fontSize: 8, padding: "2px 6px" }}>
                        {s.diff}
                      </span>
                      <span className="similar-xp">+{s.xp}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* RESIZER */}
          <div className="resizer"
            onMouseDown={(e) => {
              dragRef.current = true;
              const onMove = (ev) => {
                if (!dragRef.current) return;
                const pct = (ev.clientX / window.innerWidth) * 100;
                if (pct > 25 && pct < 70) setSplitPos(pct);
              };
              const onUp = () => { dragRef.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
              window.addEventListener("mousemove", onMove);
              window.addEventListener("mouseup", onUp);
            }}
          />

          {/* RIGHT PANEL: EDITOR + BOTTOM */}
          <div className="right-panel">
            <div className="editor-area">
              <div className="editor-toolbar">
                <div className="editor-toolbar-left">
                  <span className="editor-label">// CODE EDITOR · {lang.toUpperCase()}</span>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="toolbar-action" onClick={() => setCode(PROBLEM.starterCode[lang])}>RESET</button>
                  <button className="toolbar-action">FORMAT</button>
                  <button className="toolbar-action">FULLSCREEN</button>
                </div>
              </div>

              <div className="code-wrap">
                <div className="line-numbers">
                  {code.split("\n").map((_, i) => (
                    <div key={i} className="line-num">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  className="code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                />
              </div>
            </div>

            {/* BOTTOM PANEL */}
            <div className="bottom-panel">
              <div className="bottom-header" onClick={() => setBottomOpen((p) => !p)}>
                <div className="bottom-tabs" onClick={(e) => e.stopPropagation()}>
                  {["testcases", "result"].map((t) => (
                    <button key={t} className={`btab ${activeBottom === t ? "active" : ""}`}
                      onClick={(e) => { e.stopPropagation(); setActiveBottom(t); setBottomOpen(true); }}>
                      {t.toUpperCase()}
                      {t === "result" && submitStatus === "accepted" && " ✓"}
                      {t === "result" && submitStatus === "failed" && " ✗"}
                    </button>
                  ))}
                  {!isJudging && runStatus && (
                    <span className={`run-status-chip ${runStatus}`}>
                      {runStatus === "passed" ? `${passedCount}/${testCases.length} PASSED` : `${failedCount} FAILED`}
                    </span>
                  )}
                </div>
                <button className="toggle-btn">{bottomOpen ? "▾" : "▴"}</button>
              </div>

              {bottomOpen && (
                <div className="bottom-body">
                  {isJudging ? (
                    <div className="running-bar">
                      <div className="running-dots">
                        <span /><span /><span />
                      </div>
                      <div className="running-bar-title">
                        {judgeMode === "submit" ? "JUDGING SUBMISSION" : "RUNNING TESTS"}
                      </div>
                      <div className="running-bar-sub">
                        Executing {testCases.length} test case{testCases.length !== 1 ? "s" : ""} via judge API…
                      </div>
                    </div>
                  ) : activeBottom === "testcases" ? (
                    <>
                      {judgeError && (
                        <div className="judge-error-banner">
                          <strong>JUDGE ERROR</strong>
                          <br />
                          {judgeError}
                        </div>
                      )}
                      <div className="tc-grid">
                        {testCases.map((tc) => {
                          const statusLabel = tc.status === "pass"
                            ? "PASS"
                            : tc.status === "fail"
                              ? "FAIL"
                              : "PENDING";
                          const outMismatch = tc.status === "fail" && tc.output;

                          return (
                            <div key={tc.id} className={`tc-item ${tc.status || "pending"}`}>
                              <div className="tc-num">
                                <span className="tc-num-left">
                                  {tc.status && <div className={`tc-status-dot ${tc.status}`} />}
                                  CASE {tc.id}
                                </span>
                                <span className={`tc-status-label ${tc.status || "pending"}`}>
                                  {statusLabel}
                                </span>
                              </div>
                              <div className="tc-io">
                                <div className="tc-row"><span>IN:</span> {tc.input}</div>
                                <div className="tc-row"><span>EXP:</span> {tc.expected}</div>
                                {tc.output !== undefined && tc.output !== "" && (
                                  <div className={`tc-row ${outMismatch ? "mismatch" : ""}`}>
                                    <span>OUT:</span> {tc.output}
                                  </div>
                                )}
                                {tc.status === "fail" && !tc.output && (
                                  <div className="tc-row mismatch"><span>OUT:</span> (no output)</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="result-panel">
                      {submitStatus === "accepted" ? (
                        <>
                          <div className="result-accepted">
                            <div className="result-icon">✦</div>
                            <div className="result-text">
                              <div className="result-heading accepted">ACCEPTED</div>
                              <div className="result-sub">
                                ALL {testCases.length} TEST CASES PASSED · {formatTime(time)}
                              </div>
                            </div>
                          </div>
                          <div className="result-stats">
                            {[
                              { val: `+${animatedXp || PROBLEM.xp}`, lbl: "XP EARNED", xp: true },
                              { val: `${passedCount}/${testCases.length}`, lbl: "TESTS PASSED" },
                              { val: lang.toUpperCase(), lbl: "LANGUAGE" },
                              { val: formatTime(time), lbl: "TIME TAKEN" },
                            ].map((r) => (
                              <div key={r.lbl} className="result-stat">
                                <div className={`result-stat-val ${r.xp && showXPBurst ? "xp-pop" : ""}`}>
                                  {r.val}
                                </div>
                                <div className="result-stat-lbl">{r.lbl}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : submitStatus === "failed" ? (
                        <>
                          <div className="result-failed">
                            <div className="result-icon">✕</div>
                            <div className="result-text">
                              <div className="result-heading failed">FAILED</div>
                              <div className="result-sub">
                                {passedCount}/{testCases.length} TEST CASES PASSED · {formatTime(time)}
                              </div>
                              {judgeError && (
                                <div className="result-error-detail">{judgeError}</div>
                              )}
                            </div>
                          </div>
                          <div className="tc-grid">
                            {testCases.map((tc) => (
                              <div key={tc.id} className={`tc-item ${tc.status || "fail"}`}>
                                <div className="tc-num">
                                  <span className="tc-num-left">
                                    <div className={`tc-status-dot ${tc.status || "fail"}`} />
                                    CASE {tc.id}
                                  </span>
                                  <span className={`tc-status-label ${tc.status || "fail"}`}>
                                    {tc.status === "pass" ? "PASS" : "FAIL"}
                                  </span>
                                </div>
                                <div className="tc-io">
                                  <div className="tc-row"><span>EXP:</span> {tc.expected}</div>
                                  {tc.output && (
                                    <div className={`tc-row ${tc.status === "fail" ? "mismatch" : ""}`}>
                                      <span>OUT:</span> {tc.output}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.2)", letterSpacing: 2 }}>
                          {"// Submit your solution to see results"}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}