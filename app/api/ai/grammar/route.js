import { NextResponse } from 'next/server'
import { grammarCheckText } from '@/lib/translator'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const corrected = await grammarCheckText(text)
    return NextResponse.json({ corrected })
  } catch (err) {
    console.error('[/api/ai/grammar]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
