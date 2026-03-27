import { NextResponse } from 'next/server';
import { getTwilioCredentials } from '@/lib/config';
import twilio from 'twilio';

export async function GET() {
  try {
    const creds = await getTwilioCredentials();
    if (!creds.sid || !creds.token) {
      return NextResponse.json({ 
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ] 
      });
    }

    const client = twilio(creds.sid, creds.token);
    const token = await client.tokens.create();

    // Twilio returns a complete list of STUN and TURN servers with ephemeral credentials
    return NextResponse.json({ iceServers: token.iceServers });
  } catch (error) {
    console.error('Failed to generate ICE servers:', error);
    // Fallback to basic STUN
    return NextResponse.json({ 
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ] 
    });
  }
}
