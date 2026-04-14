import { NextResponse } from 'next/server'
import { translateEmail } from '@/lib/translator'

export async function POST(request) {
  try {
    const { text, targetLang = 'English' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'text is required' }, { status: 400 })
    }

    const result = await translateEmail(text, targetLang)
    return NextResponse.json(result)

  } catch (err) {
    console.error('[/api/translate]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
