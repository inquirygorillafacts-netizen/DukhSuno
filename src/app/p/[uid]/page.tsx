import type { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import type { BigSunoUser } from '@/types';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ uid: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;
  try {
    const doc = await adminDb.collection('users').doc(uid).get();
    
    if (!doc.exists) {
      return {
        title: 'Profile Not Found — BigSuno',
      };
    }

    const user = doc.data() as BigSunoUser;
    const name = user.displayName || 'Expert';
    const headline = user.headline || 'Dil ki baat sune koi apna';
    const avatar = user.avatarUrl && !user.avatarUrl.startsWith('emoji:') 
      ? user.avatarUrl 
      : 'https://bigsuno.com/og-default.png';

    return {
      title: `${name} — BigSuno Certified Expert ✨`,
      description: headline,
      openGraph: {
        title: `${name} | BigSuno`,
        description: headline,
        images: [{ url: avatar, width: 800, height: 800, alt: name }],
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${name} | BigSuno`,
        description: headline,
        images: [avatar],
      },
    };
  } catch (e) {
    return { title: 'BigSuno Profile' };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { uid } = await params;
  
  const doc = await adminDb.collection('users').doc(uid).get();

  if (!doc.exists) {
    notFound();
  }

  const data = doc.data();
  // Serialize for Client Component (Firebase Timestamps -> ISO Strings)
  const provider = {
    ...data,
    uid: doc.id,
    registeredAt: data?.registeredAt?.toDate?.() 
      ? data.registeredAt.toDate().toISOString() 
      : (data?.registeredAt || new Date().toISOString()),
    updatedAt: data?.updatedAt?.toDate?.() 
      ? data.updatedAt.toDate().toISOString() 
      : undefined,
  } as unknown as BigSunoUser;

  return <PublicProfileView provider={provider} />;
}
