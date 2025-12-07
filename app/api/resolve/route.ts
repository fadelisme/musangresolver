import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const urls = body.urls as string[]

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input: urls must be a non-empty array' },
        { status: 400 }
      )
    }

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const finalUrl = await resolveRedirect(url)
          return { original: url, resolved: finalUrl }
        } catch (error) {
          return {
            original: url,
            resolved: `FAILED TO RESOLVE: ${url}`,
          }
        }
      })
    )

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function resolveRedirect(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000) // 5 second timeout

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    clearTimeout(timeout)

    // Strip query parameters from the resolved URL
    const resolvedUrl = new URL(response.url)
    resolvedUrl.search = ''

    return resolvedUrl.toString()
  } catch (error) {
    clearTimeout(timeout)
    throw new Error(`Failed to resolve: ${url}`)
  }
}
