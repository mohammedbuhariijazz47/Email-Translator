import { NextResponse } from 'next/server'
import { generateDraftReply } from '@/lib/translator'

export async function POST(request) {
  try {
    const { emailBody, lang } = await request.json()

    if (!emailBody) {
      return NextResponse.json({ error: 'emailBody is required' }, { status: 400 })
    }

    const draft = await generateDraftReply(emailBody, lang)
    return NextResponse.json({ draft })
  } catch (err) {
    console.error('[/api/ai/draft]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
