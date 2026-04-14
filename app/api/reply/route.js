import { NextResponse } from 'next/server'
import { translateReply } from '@/lib/translator'
import { sendReply } from '@/lib/gmail'

export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const {
      replyText,
      recipientLang,
      to,
      subject,
      threadId,
      accessToken,
      sendAfterTranslate = false,
    } = await request.json()

    if (!replyText || !recipientLang) {
      return NextResponse.json(
        { error: 'replyText and recipientLang are required' },
        { status: 400 }
      )
    }

    // Translate the reply
    const result = await translateReply(replyText, recipientLang)

    // Optionally send via Gmail
    if (sendAfterTranslate && accessToken && to) {
      await sendReply({ accessToken, to, subject, body: result.translated, threadId })
    }

    return NextResponse.json({ ...result, sent: sendAfterTranslate })

  } catch (err) {
    console.error('[/api/reply]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
