import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sort') || 'all';
    const gender = searchParams.get('gender');
    const specialty = searchParams.get('specialty');
    const type = searchParams.get('type') || searchParams.get('category'); // Handle both aliases
    const queryStr = searchParams.get('query')?.trim().toLowerCase(); // For name search
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    // Base query: All verified providers who are not blocked
    let colRef = adminDb.collection('users');
    let q: any = colRef
      .where('roles', 'array-contains', 'provider')
      .where('isVerified', '==', true)
      .where('isBlocked', '==', false);

    // Apply Filters
    if (gender && gender !== 'all') {
      q = q.where('gender', '==', gender);
    }
    if (specialty && specialty !== 'all') {
      q = q.where('specialties', 'array-contains', specialty);
    }
    if (type && type !== 'all') {
      q = q.where('providerType', '==', type);
    }

    // Apply Sorting
    if (sortBy === 'top_rated') {
      q = q.orderBy('ratingAvg', 'desc');
    } else if (sortBy === 'cheapest') {
      q = q.orderBy('createdAt', 'desc');
    } else if (sortBy === 'newest') {
      q = q.orderBy('createdAt', 'desc');
    } else {
      q = q.orderBy('createdAt', 'desc');
    }

    // Fetch more for client-side search filtering
    const fetchLimit = queryStr ? 200 : pageSize;
    const snapshot = await q.limit(fetchLimit).get();
    
    let listeners = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      // Include all plans for UI
      const plans = data.plans || [];
      const cheapestPlan = plans.length > 0 ? [...plans].sort((a: any, b: any) => a.price - b.price)[0] : null;

      return {
        uid: doc.id,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        headline: data.headline,
        bio: data.bio ? (data.bio.length > 100 ? data.bio.substring(0, 100) + '...' : data.bio) : '',
        specialties: data.specialties || [],
        ratingAvg: data.ratingAvg || 0,
        ratingCount: data.ratingCount || 0,
        totalSessions: data.totalSessions || 0,
        isAvailable: data.isAvailable || false,
        isVerified: data.isVerified || false,
        gender: data.gender,
        age: data.age,
        cheapestPlan: cheapestPlan,
        plans: plans, // Include full plans for card display
        username: data.username,
        isBlocked: data.isBlocked || false,
        providerType: data.providerType
      };
    });

    // ─── NAME SEARCH (Instagram-style prefix match) ───
    if (queryStr) {
      listeners = listeners.filter((provider: any) => {
        const name = (provider.displayName || '').toLowerCase();
        return name.includes(queryStr);
      });
    }

    // Paginate after filter
    const start = (page - 1) * pageSize;
    const paginatedListeners = listeners.slice(start, start + pageSize);

    return NextResponse.json({
      listeners: paginatedListeners,
      total: listeners.length,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('Fetch Listeners Error DETAILS:', error);
    if (error.message?.includes('index')) {
      return NextResponse.json({ error: 'Firestore index required. Check server logs.', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
