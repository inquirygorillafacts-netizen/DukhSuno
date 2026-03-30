import { NextRequest, NextResponse } from 'next/server';

const IMGBB_API_KEY = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY || '7d9a915aa083baaff80ad8484186bc7d';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    // Upload to imgbb
    const imgbbForm = new FormData();
    imgbbForm.append('image', base64);
    
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: imgbbForm,
    });
    
    const data = await res.json();
    
    if (data.success) {
      return NextResponse.json({ url: data.data.url });
    }
    
    console.error('ImgBB API Error:', data.error);
    return NextResponse.json({ 
      error: data.error?.message || 'Upload failed' 
    }, { status: 500 });
  } catch (err: any) {
    console.error('Upload Route Exception:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
