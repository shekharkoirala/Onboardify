import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL!

const supabase = createClient(supabaseUrl, supabaseKey)

interface UserInfo {
  id: string
  email: string
  name: string
}

export async function POST(request: Request) {
  try {
    console.log("fastapi url: ", fastApiUrl)
    const { csvData, schemaMapping, onboarding_data, user_info } = await request.json()

    // Add user ID to each vehicle data record
    const enrichedCsvData = csvData.map((record: any) => ({
      ...record,
      user_id: user_info?.id || null,
    }))

    // Upload vehicle data to Supabase
    const { data: supabaseData, error: supabaseError } = await supabase
      .from('vehicle_data')
      .insert(enrichedCsvData)

    if (supabaseError) {
      throw supabaseError
    }
    
    // Store onboarding data with user information
    if (onboarding_data) {
      const { error: onboardingError } = await supabase
        .from('onboarding_data')
        .insert({
          ...onboarding_data,
          user_id: user_info?.id || null,
          user_email: user_info?.email || null,
          user_name: user_info?.name || null,
          created_at: new Date().toISOString()
        })

      if (onboardingError) {
        console.error('Error storing onboarding data:', onboardingError)
        // Continue execution even if onboarding data storage fails
      }
    }

    // Send to FastAPI
    console.log('fastapi url: ', fastApiUrl)
    const fastApiResponse = await fetch(`${fastApiUrl}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        data: csvData, 
        mapping: schemaMapping,
        onboarding_data: onboarding_data,
        user_info: user_info
      }),
    })

    if (!fastApiResponse.ok) {
      console.error('FastAPI upload failed')

      throw new Error('FastAPI upload failed')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}