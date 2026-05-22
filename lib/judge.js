import { spawn } from 'child_process'

const PISTON_EXECUTE_URL = 'https://emkc.org/api/v2/piston/execute'
const EXECUTION_TIMEOUT_MS = 15000

const LANG_MAP = {
  python: 'python',
  javascript: 'node',
  java: 'java',
  cpp: 'c++',
}

const LOCAL_EXECUTABLE = {
  python: 'python3',
  javascript: 'node',
}

function escapeForSingleQuotedString(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

export function normalizeOutput(value) {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return ''
  try {
    return JSON.stringify(JSON.parse(trimmed))
  } catch {
    return trimmed
  }
}

export function buildRunnableCode(code, language, input) {
  const escapedInput = escapeForSingleQuotedString(input)

  switch (language) {
    case 'python':
      return `${code}

import json
__intervals = json.loads('${escapedInput}')
__result = Solution().merge(__intervals)
print(json.dumps(__result, separators=(',', ':')))
`
    case 'javascript':
      return `${code}

const __intervals = JSON.parse('${escapedInput}')
console.log(JSON.stringify(merge(__intervals)))
`
    case 'java':
      return `${code}

class Main {
  static int[][] parseIntervals(String s) {
    s = s.trim();
    if (s.equals("[]")) return new int[0][];
    java.util.List<int[]> rows = new java.util.ArrayList<>();
    int i = 0;
    while (i < s.length()) {
      if (s.charAt(i) == '[') {
        int end = s.indexOf(']', i);
        String inner = s.substring(i + 1, end);
        String[] parts = inner.split(",");
        int[] row = new int[parts.length];
        for (int j = 0; j < parts.length; j++) {
          row[j] = Integer.parseInt(parts[j].trim());
        }
        rows.add(row);
        i = end + 1;
      } else {
        i++;
      }
    }
    return rows.toArray(new int[0][]);
  }

  static String formatIntervals(int[][] arr) {
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < arr.length; i++) {
      if (i > 0) sb.append(",");
      sb.append("[");
      for (int j = 0; j < arr[i].length; j++) {
        if (j > 0) sb.append(",");
        sb.append(arr[i][j]);
      }
      sb.append("]");
    }
    sb.append("]");
    return sb.toString();
  }

  public static void main(String[] args) {
    int[][] intervals = parseIntervals("${escapedInput}");
    int[][] result = new Solution().merge(intervals);
    System.out.print(formatIntervals(result));
  }
}
`
    case 'cpp':
      return `${code}

#include <iostream>
#include <sstream>
#include <vector>
#include <string>

using namespace std;

vector<vector<int>> parseIntervals(const string& s) {
  vector<vector<int>> result;
  stringstream ss(s.substr(1, s.size() - 2));
  string row;
  while (getline(ss, row, ']')) {
    if (row.find('[') == string::npos) continue;
    size_t start = row.find('[') + 1;
    string inner = row.substr(start);
    vector<int> nums;
    stringstream rs(inner);
    string num;
    while (getline(rs, num, ',')) {
      if (!num.empty()) nums.push_back(stoi(num));
    }
    if (!nums.empty()) result.push_back(nums);
  }
  return result;
}

string formatIntervals(const vector<vector<int>>& arr) {
  string out = "[";
  for (size_t i = 0; i < arr.size(); i++) {
    if (i > 0) out += ",";
    out += "[";
    for (size_t j = 0; j < arr[i].size(); j++) {
      if (j > 0) out += ",";
      out += to_string(arr[i][j]);
    }
    out += "]";
  }
  out += "]";
  return out;
}

int main() {
  string input = "${escapedInput}";
  Solution solution;
  auto intervals = parseIntervals(input);
  auto merged = solution.merge(intervals);
  cout << formatIntervals(merged);
  return 0;
}
`
    default:
      throw new Error(`Unsupported language: ${language}`)
  }
}

function parsePistonResponse(data) {
  const stdout = (data.run?.stdout ?? '').trim()
  const stderr = (data.run?.stderr ?? '').trim()
  const compileOutput = (data.compile?.output ?? '').trim()

  if (compileOutput) {
    return { ok: false, output: compileOutput }
  }

  if (stderr && !stdout) {
    return { ok: false, output: stderr }
  }

  return { ok: true, output: stdout || stderr }
}

async function executeViaPiston(code, language) {
  const pistonLanguage = LANG_MAP[language]
  if (!pistonLanguage) {
    throw new Error(`Unsupported language: ${language}`)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS)

  try {
    const response = await fetch(PISTON_EXECUTE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*',
        files: [{ content: code }],
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      let detail = `Code execution service returned ${response.status}`
      try {
        const errorBody = await response.json()
        if (errorBody?.message) detail = errorBody.message
      } catch {
        // ignore JSON parse errors
      }
      const error = new Error(detail)
      error.pistonUnavailable = true
      throw error
    }

    const data = await response.json()
    return parsePistonResponse(data)
  } finally {
    clearTimeout(timeout)
  }
}

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args)
    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timeout = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, EXECUTION_TIMEOUT_MS)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on('close', (code) => {
      clearTimeout(timeout)
      if (timedOut) {
        reject(new Error('Execution timed out'))
        return
      }

      const out = stdout.trim()
      const err = stderr.trim()

      if (code !== 0 && !out) {
        resolve({ ok: false, output: err || `Process exited with code ${code}` })
        return
      }

      resolve({ ok: true, output: out || err })
    })
  })
}

async function executeLocally(code, language) {
  const command = LOCAL_EXECUTABLE[language]
  if (!command) {
    throw new Error(`Local execution is not available for ${language}`)
  }

  const args = language === 'python' ? ['-c', code] : ['-e', code]
  return runProcess(command, args)
}

function canUseLocalFallback(language) {
  return language === 'python' || language === 'javascript'
}

export async function executeCode(code, language) {
  try {
    return await executeViaPiston(code, language)
  } catch (pistonError) {
    if (!canUseLocalFallback(language)) {
      throw pistonError
    }

    try {
      return await executeLocally(code, language)
    } catch (localError) {
      throw new Error(
        `${pistonError.message}. Local fallback failed: ${localError.message}`
      )
    }
  }
}

export async function judgeSubmission({ code, language, testCases }) {
  const results = []
  let firstFailureOutput = ''

  for (const testCase of testCases) {
    let execution

    try {
      const runnableCode = buildRunnableCode(code, language, testCase.input)
      execution = await executeCode(runnableCode, language)
    } catch (error) {
      const message = error?.message || 'Execution failed'
      return {
        passed: false,
        output: message,
        results: testCases.map((tc) => ({
          id: tc.id,
          status: 'fail',
          output: message,
        })),
      }
    }

    const actualOutput = execution.output
    const passed =
      execution.ok &&
      normalizeOutput(actualOutput) === normalizeOutput(testCase.expected)

    results.push({
      id: testCase.id,
      status: passed ? 'pass' : 'fail',
      output: actualOutput,
    })

    if (!passed && !firstFailureOutput) {
      firstFailureOutput = actualOutput || 'Execution failed'
    }
  }

  const allPassed = results.every((result) => result.status === 'pass')
  const lastResult = results[results.length - 1]

  return {
    passed: allPassed,
    output: allPassed
      ? lastResult?.output ?? ''
      : firstFailureOutput || 'One or more test cases failed',
    results,
  }
}
