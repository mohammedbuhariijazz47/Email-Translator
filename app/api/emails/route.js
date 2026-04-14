import { NextResponse } from 'next/server'
import { fetchCategoryEmails } from '@/lib/gmail'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const max = parseInt(searchParams.get('max') || '20', 10)
    const category = searchParams.get('category') || 'inbox'

    if (!accessToken) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const emails = await fetchCategoryEmails(accessToken, category, max)
    return NextResponse.json({ emails })

  } catch (err) {
    console.error('[/api/emails]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
