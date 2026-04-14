import { google } from 'googleapis'

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
}

export function getAuthUrl(oauth2Client) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  })
}

/**
 * Decode base64url encoded Gmail message part
 */
export function decodeBody(data) {
  if (!data) return ''
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

/**
 * Extract plain text body from Gmail message payload
 */
export function extractBody(payload) {
  if (!payload) return ''

  // Flat body (no parts)
  if (payload.body?.data) return decodeBody(payload.body.data)

  // Multipart — find text/plain first, fallback to text/html
  const parts = payload.parts || []
  const plain = parts.find(p => p.mimeType === 'text/plain')
  if (plain?.body?.data) return decodeBody(plain.body.data)

  const html = parts.find(p => p.mimeType === 'text/html')
  if (html?.body?.data) {
    const raw = decodeBody(html.body.data)
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  // Nested multipart
  for (const part of parts) {
    const nested = extractBody(part)
    if (nested) return nested
  }

  return ''
}

/**
 * Parse Gmail message into a clean object
 */
export function parseMessage(msg) {
  const headers = msg.payload?.headers || []
  const get = (name) => headers.find(h => h.name.toLowerCase() === name.toLowerCase())?.value || ''

  return {
    id: msg.id,
    threadId: msg.threadId,
    subject: get('Subject') || '(no subject)',
    from: get('From'),
    to: get('To'),
    date: get('Date'),
    snippet: msg.snippet || '',
    body: extractBody(msg.payload),
    labelIds: msg.labelIds || [],
  }
}

/**
 * Fetch emails based on category
 */
export async function fetchCategoryEmails(accessToken, category = 'inbox', maxResults = 20) {
  const oauth2 = getOAuth2Client()
  oauth2.setCredentials({ access_token: accessToken })

  const gmail = google.gmail({ version: 'v1', auth: oauth2 })

  let q = `in:${category}`
  if (category === 'snoozed' || category === 'important') {
    q = `is:${category}`
  } else if (category === 'social' || category === 'updates') {
    q = `category:${category}`
  } else if (category === 'bin') {
    q = 'in:trash'
  }

  const listRes = await gmail.users.messages.list({
    userId: 'me',
    maxResults,
    q,
  })

  const messages = listRes.data.messages || []

  const full = await Promise.all(
    messages.map(m =>
      gmail.users.messages.get({ userId: 'me', id: m.id, format: 'full' })
    )
  )

  return full.map(r => parseMessage(r.data))
}

/**
 * Send a reply or new email via Gmail
 */
export async function sendReply({ accessToken, to, subject, body, threadId }) {
  const oauth2 = getOAuth2Client()
  oauth2.setCredentials({ access_token: accessToken })
  const gmail = google.gmail({ version: 'v1', auth: oauth2 })

  let safeSubject = subject || '(no subject)'
  if (threadId && !safeSubject.startsWith('Re:')) {
    safeSubject = `Re: ${safeSubject}`
  }

  const raw = [
    `To: ${to}`,
    `Subject: ${safeSubject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n')

  const encoded = Buffer.from(raw).toString('base64url')

  const params = {
    userId: 'me',
    requestBody: { raw: encoded },
  }
  
  if (threadId) {
    params.requestBody.threadId = threadId
  }

  await gmail.users.messages.send(params)
}
