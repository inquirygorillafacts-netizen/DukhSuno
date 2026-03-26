import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sortBy = searchParams.get('sort') || 'all';
    const gender = searchParams.get('gender');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const ratingMin = searchParams.get('ratingMin');
    const specialty = searchParams.get('specialty');
    const ageMin = searchParams.get('ageMin');
    const ageMax = searchParams.get('ageMax');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // TODO: Query Firestore with filters
    // const q = query(
    //   collection(db, 'users'),
    //   where('roles', 'array-contains', 'sunne_wala'),
    //   where('isVerified', '==', true),
    //   ...(gender ? [where('gender', '==', gender)] : []),
    //   ...(specialty ? [where('specialties', 'array-contains', specialty)] : []),
    //   orderBy(sortBy === 'top_rated' ? 'ratingAvg' : sortBy === 'cheapest' ? 'plans' : 'createdAt', 'desc'),
    //   limit(pageSize)
    // );

    // Demo response
    const demoListeners = [
      { uid: '1', displayName: 'Meera Ji', avatarUrl: 'avatar:👩‍💼', headline: 'Aapka dost hu', specialties: ['relationship'], ratingAvg: 4.8, ratingCount: 142, totalSessions: 200, isAvailable: true, isVerified: true, gender: 'female', age: 28, cheapestPlan: { price: 50, minutes: 5 }, username: 'meera-ji' },
      { uid: '2', displayName: 'Ravi Bhai', avatarUrl: 'avatar:🧑‍💼', headline: 'Sab sunta hu', specialties: ['stress'], ratingAvg: 4.6, ratingCount: 89, totalSessions: 120, isAvailable: true, isVerified: true, gender: 'male', age: 32, cheapestPlan: { price: 80, minutes: 10 }, username: 'ravi-bhai' },
    ];

    return NextResponse.json({
      listeners: demoListeners,
      total: demoListeners.length,
      page,
      pageSize,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
