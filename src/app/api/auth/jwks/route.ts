import { NextResponse } from 'next/server';
import { getJwks } from '../[...nextauth]/jwks';

export async function GET() {
  const secret = process.env.NEXTAUTH_SECRET || 'd41d8cd98f00b204e9800998ecf8427e4b6de62a859c9a0ae9af5c86c7ad1b89';
  const jwks = await getJwks(secret);
  
  return NextResponse.json(jwks);
} 