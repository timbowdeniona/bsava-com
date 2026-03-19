import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { query, variables } = await req.json();
  
  const PIMCORE_URL = process.env.PIMCORE_BACKEND_URL;
  const PIMCORE_API_KEY = process.env.PIMCORE_API_KEY;

  if (!PIMCORE_URL || !PIMCORE_API_KEY) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`${PIMCORE_URL}/pimcore-graphql-webservices/bsava?apikey=${PIMCORE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Pimcore Proxy Error:', message);
    return NextResponse.json({ error: 'Proxy Error connecting to Pimcore', details: message }, { status: 500 });
  }
}
