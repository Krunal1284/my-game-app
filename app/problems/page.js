"use client";

import { useState, useEffect } from "react";
import { supabase } from '@/lib/supabase';

const PROBLEMS = [
  { id: 1,   title: "Two Sum",                    tag: ["Array","Hash Map"],          diff: "EASY",   xp: 120,  solved: true,  attempts: 4821, acceptance: 82 },
  { id: 2,   title: "Valid Parentheses",           tag: ["Stack","String"],            diff: "EASY",   xp: 120,  solved: true,  attempts: 3201, acceptance: 76 },
  { id: 3,   title: "Best Time to Buy Stock",      tag: ["Array","Greedy"],            diff: "EASY",   xp: 150,  solved: false, attempts: 2908, acceptance: 71 },
  { id: 4,   title: "Palindrome Number",           tag: ["Math"],                      diff: "EASY",   xp: 120,  solved: false, attempts: 2100, acceptance: 68 },
  { id: 5,   title: "Reverse Linked List",         tag: ["Linked List"],               diff: "EASY",   xp: 150,  solved: false, attempts: 1900, acceptance: 72 },
  { id: 6,   title: "Binary Search",               tag: ["Binary Search","Array"],     diff: "EASY",   xp: 120,  solved: false, attempts: 1800, acceptance: 74 },
  { id: 7,   title: "Climbing Stairs",             tag: ["DP","Math"],                 diff: "EASY",   xp: 150,  solved: false, attempts: 2200, acceptance: 70 },
  { id: 8,   title: "Maximum Subarray",            tag: ["Array","DP"],                diff: "EASY",   xp: 150,  solved: false, attempts: 2400, acceptance: 67 },
  { id: 9,   title: "Fizz Buzz",                   tag: ["Math","String"],             diff: "EASY",   xp: 100,  solved: false, attempts: 3100, acceptance: 88 },
  { id: 10,  title: "Merge Sorted Array",          tag: ["Array","Two Pointer"],       diff: "EASY",   xp: 120,  solved: false, attempts: 1700, acceptance: 73 },
  { id: 11,  title: "Majority Element",            tag: ["Array","Hash Map"],          diff: "EASY",   xp: 120,  solved: false, attempts: 1600, acceptance: 75 },
  { id: 12,  title: "Contains Duplicate",          tag: ["Array","Hash Map"],          diff: "EASY",   xp: 100,  solved: false, attempts: 2800, acceptance: 79 },
  { id: 13,  title: "Single Number",               tag: ["Array","Bit Manipulation"],  diff: "EASY",   xp: 120,  solved: false, attempts: 2100, acceptance: 81 },
  { id: 14,  title: "Move Zeroes",                 tag: ["Array","Two Pointer"],       diff: "EASY",   xp: 120,  solved: false, attempts: 1900, acceptance: 77 },
  { id: 15,  title: "Roman to Integer",            tag: ["Math","String"],             diff: "EASY",   xp: 130,  solved: false, attempts: 1800, acceptance: 69 },
  { id: 16,  title: "Longest Substring",           tag: ["Sliding Window","String"],   diff: "MEDIUM", xp: 280,  solved: false, attempts: 1842, acceptance: 54 },
  { id: 17,  title: "Merge Intervals",             tag: ["Sorting","Array"],           diff: "MEDIUM", xp: 280,  solved: false, attempts: 1620, acceptance: 49 },
  { id: 18,  title: "3Sum",                        tag: ["Array","Two Pointer"],       diff: "MEDIUM", xp: 300,  solved: false, attempts: 1380, acceptance: 43 },
  { id: 19,  title: "Word Search",                 tag: ["Backtracking","Matrix"],     diff: "MEDIUM", xp: 320,  solved: false, attempts: 1120, acceptance: 41 },
  { id: 20,  title: "Coin Change",                 tag: ["DP","BFS"],                  diff: "MEDIUM", xp: 350,  solved: false, attempts: 980,  acceptance: 38 },
  { id: 21,  title: "Product of Array Except Self",tag: ["Array","Prefix Sum"],        diff: "MEDIUM", xp: 280,  solved: false, attempts: 1200, acceptance: 52 },
  { id: 22,  title: "Jump Game",                   tag: ["Array","Greedy"],            diff: "MEDIUM", xp: 280,  solved: false, attempts: 1100, acceptance: 48 },
  { id: 23,  title: "Rotate Array",                tag: ["Array","Math"],              diff: "MEDIUM", xp: 260,  solved: false, attempts: 1000, acceptance: 45 },
  { id: 24,  title: "Spiral Matrix",               tag: ["Matrix","Array"],            diff: "MEDIUM", xp: 300,  solved: false, attempts: 900,  acceptance: 42 },
  { id: 25,  title: "Set Matrix Zeroes",           tag: ["Matrix","Array"],            diff: "MEDIUM", xp: 280,  solved: false, attempts: 850,  acceptance: 44 },
  { id: 26,  title: "Group Anagrams",              tag: ["Array","Hash Map"],          diff: "MEDIUM", xp: 300,  solved: false, attempts: 1300, acceptance: 50 },
  { id: 27,  title: "Longest Palindromic Substring",tag: ["String","DP"],             diff: "MEDIUM", xp: 320,  solved: false, attempts: 1400, acceptance: 46 },
  { id: 28,  title: "Container With Most Water",   tag: ["Array","Two Pointer"],       diff: "MEDIUM", xp: 300,  solved: false, attempts: 1250, acceptance: 47 },
  { id: 29,  title: "Letter Combinations",         tag: ["Backtracking","String"],     diff: "MEDIUM", xp: 310,  solved: false, attempts: 950,  acceptance: 43 },
  { id: 30,  title: "Combination Sum",             tag: ["Backtracking","Array"],      diff: "MEDIUM", xp: 320,  solved: false, attempts: 1050, acceptance: 41 },
  { id: 31,  title: "Permutations",                tag: ["Backtracking","Array"],      diff: "MEDIUM", xp: 320,  solved: false, attempts: 980,  acceptance: 40 },
  { id: 32,  title: "Rotate Image",                tag: ["Matrix","Array"],            diff: "MEDIUM", xp: 280,  solved: false, attempts: 870,  acceptance: 46 },
  { id: 33,  title: "Search in Rotated Array",     tag: ["Binary Search","Array"],     diff: "MEDIUM", xp: 310,  solved: false, attempts: 1100, acceptance: 44 },
  { id: 34,  title: "Find First and Last Position", tag: ["Binary Search","Array"],    diff: "MEDIUM", xp: 300,  solved: false, attempts: 920,  acceptance: 42 },
  { id: 35,  title: "Next Permutation",            tag: ["Array","Two Pointer"],       diff: "MEDIUM", xp: 290,  solved: false, attempts: 800,  acceptance: 39 },
  { id: 36,  title: "Binary Tree Max Path",        tag: ["Tree","DFS"],                diff: "HARD",   xp: 500,  solved: false, attempts: 620,  acceptance: 28 },
  { id: 37,  title: "Trapping Rain Water",         tag: ["DP","Two Pointer"],          diff: "HARD",   xp: 500,  solved: false, attempts: 540,  acceptance: 25 },
  { id: 38,  title: "Serialize Binary Tree",       tag: ["Tree","BFS"],                diff: "HARD",   xp: 550,  solved: false, attempts: 410,  acceptance: 22 },
  { id: 39,  title: "Median of Two Arrays",        tag: ["Binary Search","Array"],     diff: "HARD",   xp: 600,  solved: false, attempts: 380,  acceptance: 18 },
  { id: 40,  title: "Merge K Sorted Lists",        tag: ["Linked List","Heap"],        diff: "HARD",   xp: 520,  solved: false, attempts: 450,  acceptance: 24 },
  { id: 41,  title: "Word Ladder",                 tag: ["BFS","Hash Map"],            diff: "HARD",   xp: 530,  solved: false, attempts: 420,  acceptance: 21 },
  { id: 42,  title: "Longest Valid Parentheses",   tag: ["String","DP"],               diff: "HARD",   xp: 510,  solved: false, attempts: 390,  acceptance: 23 },
  { id: 43,  title: "Jump Game II",                tag: ["Array","Greedy"],            diff: "HARD",   xp: 520,  solved: false, attempts: 480,  acceptance: 26 },
  { id: 44,  title: "N-Queens",                    tag: ["Backtracking"],              diff: "HARD",   xp: 560,  solved: false, attempts: 360,  acceptance: 20 },
  { id: 45,  title: "Sudoku Solver",               tag: ["Backtracking","Matrix"],     diff: "HARD",   xp: 580,  solved: false, attempts: 340,  acceptance: 19 },
  { id: 46,  title: "First Missing Positive",      tag: ["Array","Hash Map"],          diff: "HARD",   xp: 510,  solved: false, attempts: 410,  acceptance: 22 },
  { id: 47,  title: "Wildcard Matching",           tag: ["String","DP"],               diff: "HARD",   xp: 540,  solved: false, attempts: 370,  acceptance: 20 },
  { id: 48,  title: "Regular Expression Matching", tag: ["String","DP"],               diff: "HARD",   xp: 560,  solved: false, attempts: 350,  acceptance: 18 },
  { id: 49,  title: "Largest Rectangle Histogram", tag: ["Stack","Array"],             diff: "HARD",   xp: 550,  solved: false, attempts: 380,  acceptance: 21 },
  { id: 50,  title: "Edit Distance",               tag: ["String","DP"],               diff: "HARD",   xp: 530,  solved: false, attempts: 400,  acceptance: 23 },
    { id: 51,  title: "Kth Largest Element",          tag: ["Heap","Array"],              diff: "MEDIUM", xp: 320,  solved: false, attempts: 980,  acceptance: 48 },
  { id: 52,  title: "Top K Frequent Elements",      tag: ["Heap","Hash Map"],           diff: "MEDIUM", xp: 330,  solved: false, attempts: 1020, acceptance: 46 },
  { id: 53,  title: "Daily Temperatures",           tag: ["Stack","Array"],             diff: "MEDIUM", xp: 300,  solved: false, attempts: 910,  acceptance: 50 },
  { id: 54,  title: "Min Stack",                    tag: ["Stack","Design"],            diff: "MEDIUM", xp: 290,  solved: false, attempts: 850,  acceptance: 54 },
  { id: 55,  title: "Implement Queue Using Stacks",tag: ["Stack","Queue"],             diff: "EASY",   xp: 150,  solved: false, attempts: 1600, acceptance: 79 },
  { id: 56,  title: "Valid Sudoku",                 tag: ["Matrix","Hash Map"],         diff: "MEDIUM", xp: 310,  solved: false, attempts: 940,  acceptance: 47 },
  { id: 57,  title: "Subarray Sum Equals K",        tag: ["Array","Prefix Sum"],        diff: "MEDIUM", xp: 320,  solved: false, attempts: 980,  acceptance: 44 },
  { id: 58,  title: "House Robber",                 tag: ["DP","Array"],                diff: "MEDIUM", xp: 290,  solved: false, attempts: 1200, acceptance: 58 },
  { id: 59,  title: "House Robber II",              tag: ["DP","Array"],                diff: "MEDIUM", xp: 330,  solved: false, attempts: 870,  acceptance: 43 },
  { id: 60,  title: "Decode Ways",                  tag: ["DP","String"],               diff: "MEDIUM", xp: 340,  solved: false, attempts: 760,  acceptance: 39 },

  { id: 61,  title: "Unique Paths",                 tag: ["DP","Matrix"],               diff: "MEDIUM", xp: 300,  solved: false, attempts: 950,  acceptance: 52 },
  { id: 62,  title: "Minimum Path Sum",             tag: ["DP","Matrix"],               diff: "MEDIUM", xp: 320,  solved: false, attempts: 820,  acceptance: 48 },
  { id: 63,  title: "Number of Islands",            tag: ["Graph","DFS"],               diff: "MEDIUM", xp: 350,  solved: false, attempts: 790,  acceptance: 41 },
  { id: 64,  title: "Course Schedule",              tag: ["Graph","Topological Sort"],  diff: "MEDIUM", xp: 360,  solved: false, attempts: 700,  acceptance: 38 },
  { id: 65,  title: "Pacific Atlantic Water Flow", tag: ["Graph","DFS"],               diff: "MEDIUM", xp: 370,  solved: false, attempts: 610,  acceptance: 35 },
  { id: 66,  title: "Reorder List",                 tag: ["Linked List","Two Pointer"], diff: "MEDIUM", xp: 310,  solved: false, attempts: 740,  acceptance: 45 },
  { id: 67,  title: "Add Two Numbers",              tag: ["Linked List","Math"],        diff: "MEDIUM", xp: 320,  solved: false, attempts: 860,  acceptance: 49 },
  { id: 68,  title: "Linked List Cycle",            tag: ["Linked List","Two Pointer"], diff: "EASY",   xp: 170,  solved: false, attempts: 1500, acceptance: 82 },
  { id: 69,  title: "Detect Cycle in Linked List",  tag: ["Linked List","Hash Map"],    diff: "MEDIUM", xp: 310,  solved: false, attempts: 710,  acceptance: 46 },
  { id: 70,  title: "Remove Nth Node From End",     tag: ["Linked List","Two Pointer"], diff: "MEDIUM", xp: 300,  solved: false, attempts: 820,  acceptance: 50 },

  { id: 71,  title: "Lowest Common Ancestor",       tag: ["Tree","DFS"],                diff: "MEDIUM", xp: 340,  solved: false, attempts: 660,  acceptance: 42 },
  { id: 72,  title: "Invert Binary Tree",           tag: ["Tree","DFS"],                diff: "EASY",   xp: 160,  solved: false, attempts: 1800, acceptance: 84 },
  { id: 73,  title: "Balanced Binary Tree",         tag: ["Tree","DFS"],                diff: "EASY",   xp: 170,  solved: false, attempts: 1700, acceptance: 78 },
  { id: 74,  title: "Diameter of Binary Tree",      tag: ["Tree","DFS"],                diff: "EASY",   xp: 190,  solved: false, attempts: 1550, acceptance: 73 },
  { id: 75,  title: "Same Tree",                    tag: ["Tree","DFS"],                diff: "EASY",   xp: 150,  solved: false, attempts: 1620, acceptance: 80 },
  { id: 76,  title: "Subtree of Another Tree",      tag: ["Tree","DFS"],                diff: "EASY",   xp: 180,  solved: false, attempts: 1200, acceptance: 69 },
  { id: 77,  title: "Validate BST",                 tag: ["Tree","DFS"],                diff: "MEDIUM", xp: 330,  solved: false, attempts: 710,  acceptance: 43 },
  { id: 78,  title: "Kth Smallest in BST",          tag: ["Tree","DFS"],                diff: "MEDIUM", xp: 320,  solved: false, attempts: 680,  acceptance: 45 },
  { id: 79,  title: "Construct Binary Tree",        tag: ["Tree","DFS"],                diff: "MEDIUM", xp: 340,  solved: false, attempts: 590,  acceptance: 39 },
  { id: 80,  title: "Binary Tree Level Order",      tag: ["Tree","BFS"],                diff: "MEDIUM", xp: 300,  solved: false, attempts: 890,  acceptance: 51 },

  { id: 81,  title: "Network Delay Time",           tag: ["Graph","Dijkstra"],          diff: "MEDIUM", xp: 380,  solved: false, attempts: 540,  acceptance: 36 },
  { id: 82,  title: "Cheapest Flights Within K",   tag: ["Graph","BFS"],               diff: "MEDIUM", xp: 390,  solved: false, attempts: 500,  acceptance: 34 },
  { id: 83,  title: "Alien Dictionary",             tag: ["Graph","Topological Sort"],  diff: "HARD",   xp: 560,  solved: false, attempts: 290,  acceptance: 21 },
  { id: 84,  title: "Redundant Connection",         tag: ["Graph","Union Find"],        diff: "MEDIUM", xp: 360,  solved: false, attempts: 430,  acceptance: 40 },
  { id: 85,  title: "Accounts Merge",               tag: ["Graph","DFS"],               diff: "MEDIUM", xp: 350,  solved: false, attempts: 410,  acceptance: 42 },
  { id: 86,  title: "Min Cost Climbing Stairs",     tag: ["DP","Array"],                diff: "EASY",   xp: 170,  solved: false, attempts: 1750, acceptance: 77 },
  { id: 87,  title: "Longest Increasing Subsequence",tag:["DP","Binary Search"],        diff: "MEDIUM", xp: 380,  solved: false, attempts: 620,  acceptance: 37 },
  { id: 88,  title: "Partition Equal Subset Sum",   tag: ["DP","Knapsack"],             diff: "MEDIUM", xp: 390,  solved: false, attempts: 570,  acceptance: 35 },
  { id: 89,  title: "Target Sum",                   tag: ["DP","Backtracking"],         diff: "MEDIUM", xp: 360,  solved: false, attempts: 520,  acceptance: 41 },
  { id: 90,  title: "Longest Common Subsequence",   tag: ["DP","String"],               diff: "MEDIUM", xp: 370,  solved: false, attempts: 610,  acceptance: 39 },

  { id: 91,  title: "Word Break",                   tag: ["DP","String"],               diff: "MEDIUM", xp: 360,  solved: false, attempts: 590,  acceptance: 40 },
  { id: 92,  title: "Palindrome Partitioning",      tag: ["Backtracking","String"],     diff: "MEDIUM", xp: 350,  solved: false, attempts: 470,  acceptance: 38 },
  { id: 93,  title: "Generate Parentheses",         tag: ["Backtracking","String"],     diff: "MEDIUM", xp: 320,  solved: false, attempts: 860,  acceptance: 58 },
  { id: 94,  title: "Subsets",                      tag: ["Backtracking","Array"],      diff: "MEDIUM", xp: 300,  solved: false, attempts: 920,  acceptance: 61 },
  { id: 95,  title: "Combination Sum II",           tag: ["Backtracking","Array"],      diff: "MEDIUM", xp: 340,  solved: false, attempts: 510,  acceptance: 42 },
  { id: 96,  title: "Find Median from Data Stream", tag: ["Heap","Design"],             diff: "HARD",   xp: 590,  solved: false, attempts: 250,  acceptance: 18 },
  { id: 97,  title: "LRU Cache",                    tag: ["Design","Hash Map"],         diff: "HARD",   xp: 570,  solved: false, attempts: 320,  acceptance: 24 },
  { id: 98,  title: "Task Scheduler",               tag: ["Heap","Greedy"],             diff: "MEDIUM", xp: 350,  solved: false, attempts: 450,  acceptance: 43 },
  { id: 99,  title: "Gas Station",                  tag: ["Greedy","Array"],            diff: "MEDIUM", xp: 340,  solved: false, attempts: 530,  acceptance: 41 },
  { id: 100, title: "Candy Distribution",           tag: ["Greedy","Array"],            diff: "HARD",   xp: 550,  solved: false, attempts: 310,  acceptance: 22 },
];

const TAGS = ["All", "Array", "String", "Tree", "DP", "Graph", "Sliding Window", "Two Pointer", "Stack", "Backtracking", "Binary Search", "Greedy"];

export default function ProblemsPage() {
  const [search, setSearch]   = useState("");
  const [diff, setDiff]       = useState("ALL");
  const [tag, setTag]         = useState("All");
  const [status, setStatus]   = useState("ALL");
  const [hovered, setHovered] = useState(null);
  const [loaded, setLoaded]   = useState(false);
  const [problems, setProblems] = useState(PROBLEMS);

useEffect(() => {
  const fetchProblems = async () => {
    const { data } = await supabase
      .from('problems')
      .select('*')
      .order('id', { ascending: true });
    const { data: { user } } = await supabase.auth.getUser();
    let solvedIds = [];
    if (user) {
      const { data: subs } = await supabase
        .from('submissions')
        .select('problem_id')
        .eq('user_id', user.id)
        .eq('status', 'ACCEPTED');
      if (subs) solvedIds = subs.map(s => s.problem_id);
    }
    if (data && data.length > 0) {
     const mapped = data.map(p => ({
  ...p,
  diff: p.difficulty,
  tag: typeof p.tags === 'string'
    ? p.tags.split(',').map(t => t.trim())
    : (p.tags || []),
  solved: solvedIds.includes(p.id),
  attempts: 1000,
}));
      setProblems(mapped);
    }
  };
  fetchProblems();
}, []);

  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  const filtered = problems.filter((p) => {
  const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
  const matchDiff   = diff === "ALL" || p.diff === diff;
  const matchTag    = tag === "All"  || p.tag.includes(tag);
  const matchStatus = status === "ALL" || (status === "SOLVED" ? p.solved : !p.solved);
  return matchSearch && matchDiff && matchTag && matchStatus;
});

const totalSolved = problems.filter(p => p.solved).length;
const easySolved = problems.filter(p => p.solved && p.diff === "EASY").length;
const medSolved = problems.filter(p => p.solved && p.diff === "MEDIUM").length;
const hardSolved = problems.filter(p => p.solved && p.diff === "HARD").length;

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

        .page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse at 10% 20%, rgba(250,204,21,0.05) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 80%, rgba(234,88,12,0.04) 0%, transparent 50%),
            #080810;
        }

        /* TOPBAR */
        .topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 40px; height: 60px;
          background: rgba(8,8,16,0.95);
          border-bottom: 1px solid rgba(250,204,21,0.12);
          backdrop-filter: blur(20px);
          position: sticky; top: 0; z-index: 100;
        }
        .logo {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Orbitron', monospace; font-size: 18px;
          font-weight: 900; color: #facc15; letter-spacing: 3px;
          cursor: pointer;
        }
        .logo-hex {
          width: 32px; height: 32px;
          background: rgba(250,204,21,0.15); border: 1px solid #facc15;
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center; font-size: 12px;
        }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link {
          padding: 6px 16px; font-family: 'Share Tech Mono', monospace;
          font-size: 11px; letter-spacing: 2px; color: rgba(255,255,255,0.35);
          cursor: pointer; border: none; background: none; transition: color 0.2s;
          text-transform: uppercase;
        }
        .nav-link:hover { color: rgba(250,204,21,0.7); }
        .nav-link.active { color: #facc15; }
        .avatar {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #facc15, #f59e0b);
          clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #080810; cursor: pointer;
          font-family: 'Orbitron', monospace;
        }

        /* MAIN */
        .main { max-width: 1200px; margin: 0 auto; padding: 32px 40px; }

        /* PAGE HEADER */
        .page-header {
          margin-bottom: 28px;
          opacity: ${loaded ? 1 : 0};
          transform: translateY(${loaded ? 0 : 16}px);
          transition: all 0.5s ease;
        }
        .page-tag {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 4px; color: rgba(250,204,21,0.4); margin-bottom: 8px;
        }
        .page-title {
          font-family: 'Orbitron', monospace; font-size: 30px;
          font-weight: 900; color: #fff; margin-bottom: 6px;
        }
        .page-title span { color: #facc15; }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.35); letter-spacing: 0.5px; }

        /* STATS ROW */
        .stats-row {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
          margin-bottom: 24px;
          opacity: ${loaded ? 1 : 0};
          transform: translateY(${loaded ? 0 : 12}px);
          transition: all 0.5s 0.1s ease;
        }
        .stat-box {
          padding: 16px 20px;
          background: rgba(8,8,16,0.9);
          border: 1px solid rgba(250,204,21,0.1);
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);
          transition: border-color 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .stat-box:hover { border-color: rgba(250,204,21,0.25); transform: translateY(-2px); }
        .stat-box::after {
          content: ''; position: absolute; top: 0; right: 0;
          width: 10px; height: 10px;
          border-top: 1px solid rgba(250,204,21,0.3);
          border-right: 1px solid rgba(250,204,21,0.3);
        }
        .stat-box-val {
          font-family: 'Orbitron', monospace; font-size: 24px;
          font-weight: 700; line-height: 1; margin-bottom: 4px;
        }
        .stat-box-lbl { font-size: 10px; letter-spacing: 2px; color: rgba(255,255,255,0.3); font-family: 'Share Tech Mono', monospace; }
        .stat-box-bar { height: 3px; margin-top: 10px; background: rgba(255,255,255,0.05); overflow: hidden; }
        .stat-box-fill { height: 100%; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

        /* FILTERS */
        .filters {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
          margin-bottom: 16px;
          opacity: ${loaded ? 1 : 0};
          transition: all 0.5s 0.15s ease;
        }
        .search-wrap {
          position: relative; flex: 1; min-width: 200px;
        }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(250,204,21,0.3); font-family: 'Share Tech Mono', monospace; font-size: 13px;
          pointer-events: none;
        }
        .search-input {
          width: 100%; background: rgba(250,204,21,0.03);
          border: 1px solid rgba(250,204,21,0.15);
          color: #f5f5f5; font-family: 'Share Tech Mono', monospace;
          font-size: 13px; padding: 11px 14px 11px 40px; outline: none;
          clip-path: polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,0 100%);
          transition: border-color 0.2s, background 0.2s;
          letter-spacing: 1px;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.15); }
        .search-input:focus { border-color: rgba(250,204,21,0.4); background: rgba(250,204,21,0.05); }

        .filter-group { display: flex; gap: 6px; }
        .filter-btn {
          padding: 9px 16px; background: rgba(250,204,21,0.04);
          border: 1px solid rgba(250,204,21,0.12);
          color: rgba(255,255,255,0.4); font-family: 'Share Tech Mono', monospace;
          font-size: 10px; letter-spacing: 2px; cursor: pointer;
          transition: all 0.2s; text-transform: uppercase;
          clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
        }
        .filter-btn:hover { color: rgba(250,204,21,0.8); border-color: rgba(250,204,21,0.3); }
        .filter-btn.active { background: rgba(250,204,21,0.12); border-color: rgba(250,204,21,0.4); color: #facc15; }
        .filter-btn.easy.active   { background: rgba(34,197,94,0.1);  border-color: rgba(34,197,94,0.4);  color: #22c55e; }
        .filter-btn.medium.active { background: rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.4); color: #f59e0b; }
        .filter-btn.hard.active   { background: rgba(239,68,68,0.1);  border-color: rgba(239,68,68,0.4);  color: #ef4444; }

        /* TAG SCROLL */
        .tags-scroll {
          display: flex; gap: 8px; margin-bottom: 20px;
          overflow-x: auto; padding-bottom: 4px;
          opacity: ${loaded ? 1 : 0}; transition: all 0.5s 0.2s ease;
        }
        .tags-scroll::-webkit-scrollbar { height: 2px; }
        .tags-scroll::-webkit-scrollbar-thumb { background: rgba(250,204,21,0.2); }
        .tag-chip {
          padding: 5px 12px; white-space: nowrap;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.35); font-family: 'Share Tech Mono', monospace;
          font-size: 9px; letter-spacing: 2px; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
        }
        .tag-chip:hover { color: rgba(250,204,21,0.7); border-color: rgba(250,204,21,0.25); }
        .tag-chip.active { background: rgba(250,204,21,0.08); border-color: rgba(250,204,21,0.35); color: #facc15; }

        /* TABLE */
        .table-wrap {
          background: rgba(8,8,16,0.85); border: 1px solid rgba(250,204,21,0.1);
          backdrop-filter: blur(10px);
          opacity: ${loaded ? 1 : 0};
          transform: translateY(${loaded ? 0 : 8}px);
          transition: all 0.5s 0.25s ease;
        }
        .table-header {
          display: grid;
          grid-template-columns: 48px 40px 1fr 160px 100px 80px 80px;
          gap: 0; padding: 12px 20px;
          border-bottom: 1px solid rgba(250,204,21,0.1);
        }
        .th {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 2px; color: rgba(250,204,21,0.35); text-transform: uppercase;
          display: flex; align-items: center;
        }

        .problem-row {
          display: grid;
          grid-template-columns: 48px 40px 1fr 160px 100px 80px 80px;
          gap: 0; padding: 14px 20px;
          border-bottom: 1px solid rgba(250,204,21,0.05);
          cursor: pointer; transition: background 0.15s;
          position: relative;
          animation: rowIn 0.3s ease both;
        }
        .problem-row:last-child { border-bottom: none; }
        .problem-row:hover { background: rgba(250,204,21,0.03); }
        .problem-row:hover .row-arrow { opacity: 1; transform: translateX(0); }
        .problem-row.solved { }

        @keyframes rowIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .row-status {
          display: flex; align-items: center;
        }
        .status-icon {
          width: 18px; height: 18px;
          border: 1px solid rgba(250,204,21,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px;
          clip-path: polygon(3px 0,100% 0,100% calc(100% - 3px),calc(100% - 3px) 100%,0 100%,0 3px);
        }
        .status-icon.done {
          background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); color: #22c55e;
        }

        .row-num {
          display: flex; align-items: center;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: rgba(255,255,255,0.2);
        }

        .row-title-wrap { display: flex; flex-direction: column; justify-content: center; gap: 4px; }
        .row-title {
          font-size: 14px; font-weight: 500; color: #e2e8f0;
          transition: color 0.2s;
        }
        .problem-row:hover .row-title { color: #facc15; }
        .row-tags { display: flex; gap: 6px; }
        .row-tag {
          font-family: 'Share Tech Mono', monospace; font-size: 8px;
          letter-spacing: 1px; color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.04); padding: 2px 7px;
        }

        .row-diff {
          display: flex; align-items: center;
        }
        .diff-badge {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 1px; padding: 4px 10px; border: 1px solid;
          clip-path: polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px));
        }

        .row-acceptance { display: flex; align-items: center; flex-direction: column; gap: 4px; justify-content: center; }
        .acceptance-val { font-family: 'Share Tech Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.5); }
        .acceptance-bar { width: 60px; height: 2px; background: rgba(255,255,255,0.05); }
        .acceptance-fill { height: 100%; background: rgba(250,204,21,0.3); }

        .row-xp { display: flex; align-items: center; }
        .xp-val { font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 600; color: #facc15; }

        .row-action { display: flex; align-items: center; justify-content: flex-end; }
        .row-arrow {
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: rgba(250,204,21,0.5); opacity: 0;
          transform: translateX(-6px); transition: all 0.2s;
        }

        /* EMPTY STATE */
        .empty {
          padding: 60px; text-align: center;
          font-family: 'Share Tech Mono', monospace;
          color: rgba(250,204,21,0.2); letter-spacing: 3px; font-size: 12px;
        }

        /* RESULT COUNT */
        .result-count {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 12px;
        }
        .count-text {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: rgba(255,255,255,0.25); letter-spacing: 2px;
        }
        .count-text span { color: #facc15; }
        .sort-btn {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          color: rgba(250,204,21,0.3); background: none; border: none;
          cursor: pointer; letter-spacing: 2px; transition: color 0.2s;
        }
        .sort-btn:hover { color: #facc15; }
      @media (max-width: 768px) {
          .mobile-nav { display: grid !important; }
          .main { padding: 16px; padding-bottom: 80px; }
          .stats-row { grid-template-columns: repeat(2, 1fr) !important; }
          .filters { flex-direction: column; }
          .filter-group { flex-wrap: wrap; }
          .table-header { display: none; }
          .problem-row { grid-template-columns: 40px 1fr 80px 50px !important; }
          .row-acceptance { display: none; }
          .row-action { display: none; }
          .nav-links { display: none; }
          .page-title { font-size: 24px !important; }
          .topbar { padding: 0 16px; }
        }
      `}</style>
      <div className="page">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="logo" onClick={() => window.location.href = "/dashboard"}>
            <div className="logo-hex">⬡</div>
            CODEARENA
          </div>
          <nav className="nav-links">
            {["Dashboard","Problems","Arena","Leaderboard","Profile"].map((n) => (
              <button key={n} className={`nav-link ${n === "Problems" ? "active" : ""}`}
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
          {/* Page header */}
          <div className="page-header">
            <div className="page-tag">// QUEST BOARD</div>
            <div className="page-title">Choose Your <span>Challenge</span></div>
            <div className="page-sub">Earn XP, rank up, and dominate the leaderboard</div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[
              { val: `${totalSolved}/${problems.length}`, lbl: "Total Solved", fill: (totalSolved/problems.length)*100, color: "#facc15" },
              { val: `${easySolved}/3`,  lbl: "Easy Solved",   fill: (easySolved/3)*100,  color: "#22c55e" },
              { val: `${medSolved}/5`,   lbl: "Medium Solved", fill: (medSolved/5)*100,   color: "#f59e0b" },
              { val: `${hardSolved}/4`,  lbl: "Hard Solved",   fill: (hardSolved/4)*100,  color: "#ef4444" },
            ].map((s) => (
              <div key={s.lbl} className="stat-box">
                <div className="stat-box-val" style={{ color: s.color }}>{s.val}</div>
                <div className="stat-box-lbl">{s.lbl}</div>
                <div className="stat-box-bar">
                  <div className="stat-box-fill" style={{ width: `${s.fill}%`, background: s.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-wrap">
              <span className="search-icon">▸</span>
              <input
                className="search-input"
                placeholder="Search quests..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              {["ALL","EASY","MEDIUM","HARD"].map((d) => (
                <button key={d}
                  className={`filter-btn ${d.toLowerCase()} ${diff === d ? "active" : ""}`}
                  onClick={() => setDiff(d)}>
                  {d}
                </button>
              ))}
            </div>
            <div className="filter-group">
              {["ALL","SOLVED","UNSOLVED"].map((s) => (
                <button key={s}
                  className={`filter-btn ${status === s ? "active" : ""}`}
                  onClick={() => setStatus(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Tag chips */}
          <div className="tags-scroll">
            {TAGS.map((t) => (
              <button key={t} className={`tag-chip ${tag === t ? "active" : ""}`} onClick={() => setTag(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Result count */}
          <div className="result-count">
            <div className="count-text">
              Showing <span>{filtered.length}</span> of <span>{problems.length}</span> quests
            </div>
            <button className="sort-btn">SORT BY XP ↓</button>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <div className="table-header">
              <div className="th">Status</div>
              <div className="th">#</div>
              <div className="th">Quest Title</div>
              <div className="th">Difficulty</div>
              <div className="th">Acceptance</div>
              <div className="th">XP</div>
              <div className="th"></div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty">// NO QUESTS FOUND · ADJUST FILTERS</div>
            ) : (
              filtered.map((p, i) => (
                <div
                  key={p.id}
                  className={`problem-row ${p.solved ? "solved" : ""}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => window.location.href = `/solve/${p.id}`}
                >
                  <div className="row-status">
                    <div className={`status-icon ${p.solved ? "done" : ""}`}>
                      {p.solved ? "✓" : ""}
                    </div>
                  </div>

                  <div className="row-num">{String(p.id).padStart(2,"0")}</div>

                  <div className="row-title-wrap">
                    <div className="row-title">{p.title}</div>
                    <div className="row-tags">
                      {p.tag.map((t) => <span key={t} className="row-tag">{t}</span>)}
                    </div>
                  </div>

                  <div className="row-diff">
                    <div className="diff-badge" style={{ color: diffColor(p.diff), borderColor: diffColor(p.diff) + "40", background: `rgba(${p.diff==="EASY"?"34,197,94":p.diff==="MEDIUM"?"245,158,11":"239,68,68"},0.06)` }}>
                      {p.diff}
                    </div>
                  </div>

                  <div className="row-acceptance">
                    <div className="acceptance-val">{p.acceptance}%</div>
                    <div className="acceptance-bar">
                      <div className="acceptance-fill" style={{ width: `${p.acceptance}%` }} />
                    </div>
                  </div>

                  <div className="row-xp">
                    <div className="xp-val">+{p.xp}</div>
                  </div>

                  <div className="row-action">
                    <div className="row-arrow">SOLVE →</div>
                  </div>
                </div>
              ))
            )}
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
              color: item.link === '/problems' ? '#facc15' : 'rgba(250,204,21,0.5)',
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