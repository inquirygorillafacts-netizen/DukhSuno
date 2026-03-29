import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sort') || 'all';
    const gender = searchParams.get('gender');
    const specialty = searchParams.get('specialty');
    const type = searchParams.get('type'); // New: 'influencer', 'mentor', etc.
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Base query: All verified providers who are not blocked
    let colRef = adminDb.collection('users');
    let query: any = colRef
      .where('roles', 'array-contains', 'provider')
      .where('isVerified', '==', true)
      .where('isBlocked', '==', false);

    // Apply Filters
    if (gender && gender !== 'all') {
      query = query.where('gender', '==', gender);
    }
    if (specialty && specialty !== 'all') {
      query = query.where('specialties', 'array-contains', specialty);
    }
    if (type && type !== 'all') {
      query = query.where('providerType', '==', type);
    }

    // Apply Sorting
    if (sortBy === 'top_rated') {
      query = query.orderBy('ratingAvg', 'desc');
    } else if (sortBy === 'cheapest') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sortBy === 'newest') {
      query = query.orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    // Pagination
    const snapshot = await query.limit(pageSize).get();
    
    const listeners = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      // Calculate cheapest plan for easy UI consumption
      const plans = data.plans || [];
      const cheapestPlan = plans.length > 0 ? [...plans].sort((a: any, b: any) => a.price - b.price)[0] : null;

      return {
        uid: doc.id,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        headline: data.headline,
        specialties: data.specialties || [],
        ratingAvg: data.ratingAvg || 0,
        ratingCount: data.ratingCount || 0,
        totalSessions: data.totalSessions || 0,
        isAvailable: data.isAvailable || false,
        isVerified: data.isVerified || false,
        gender: data.gender,
        age: data.age,
        cheapestPlan: cheapestPlan,
        username: data.username,
        isBlocked: data.isBlocked || false,
        providerType: data.providerType
      };
    });

    return NextResponse.json({
      listeners,
      total: listeners.length,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Fetch Listeners Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

