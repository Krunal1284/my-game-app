import { NextResponse } from 'next/server'
import { judgeSubmission } from '@/lib/judge'

const SUPPORTED_LANGUAGES = new Set(['python', 'javascript', 'java', 'cpp'])

export async function POST(request) {
  try {
    const body = await request.json()
    const { code, language, testCases } = body

    if (typeof code !== 'string' || !code.trim()) {
      return NextResponse.json(
        { passed: false, output: 'Code is required' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES.has(language)) {
      return NextResponse.json(
        { passed: false, output: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { passed: false, output: 'At least one test case is required' },
        { status: 400 }
      )
    }

    for (const testCase of testCases) {
      if (
        typeof testCase?.input !== 'string' ||
        typeof testCase?.expected !== 'string'
      ) {
        return NextResponse.json(
          { passed: false, output: 'Invalid test case format' },
          { status: 400 }
        )
      }
    }

    const verdict = await judgeSubmission({ code, language, testCases })

    return NextResponse.json({
      passed: verdict.passed,
      output: verdict.output,
      results: verdict.results,
    })
  } catch (error) {
    const message =
      error?.name === 'AbortError'
        ? 'Execution timed out'
        : error?.message || 'Submission failed'

    return NextResponse.json(
      {
        passed: false,
        output: message,
        results: [],
      },
      { status: 500 }
    )
  }
}
