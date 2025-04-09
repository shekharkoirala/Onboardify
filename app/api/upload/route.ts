import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL!

const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const { csvData, schemaMapping } = await request.json()

    // Upload to Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('vehicle_data')
      .insert(csvData)

    if (supabaseError) {
      throw supabaseError
    }

    // Send to FastAPI
    const fastApiResponse = await fetch(`${fastApiUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: csvData, mapping: schemaMapping }),
    })

    if (!fastApiResponse.ok) {
      throw new Error('FastAPI upload failed')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}