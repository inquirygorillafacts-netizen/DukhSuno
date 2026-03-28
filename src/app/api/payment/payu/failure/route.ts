import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData.entries());
    const txnid = data.txnid as string;
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;
    
    return NextResponse.redirect(`${origin}/wallet?payment=failed&txnid=${txnid}`);
  } catch (error) {
    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${protocol}://${host}`;
    return NextResponse.redirect(`${origin}/wallet?payment=failed`);
  }
}
