import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sessionId, listenerId, rating, comment } = await req.json();

    if (!sessionId || !listenerId || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    // TODO: Save rating to session doc
    // TODO: Recalculate listener ratingAvg:
    // newAvg = ((oldAvg * oldCount) + newRating) / (oldCount + 1)
    // TODO: Update listener's ratingAvg and ratingCount in Firestore

    console.log(`Rating: session=${sessionId}, listener=${listenerId}, stars=${rating}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
