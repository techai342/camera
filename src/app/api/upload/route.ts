import { NextResponse } from 'next/server';

const IMAGEKIT_PUBLIC = process.env.IMAGEKIT_PUBLIC || 'public_W8pXprjPHYrYwlWMf811dtUm2Og=';
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE || 'private_Wu/w/ZEmydjv/FbRgVKOffRxtNY=';
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'a26bed1b2fd07ba03bff75343d0834fe';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Convert dataURL / base64 string to Buffer
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.startsWith('data:')) {
      const parts = image.split(',');
      const match = parts[0].match(/:(.*?);/);
      if (match) mimeType = match[1];
      base64Data = parts[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `capture_${Date.now()}.${extension}`;

    // 1. Try ImgBB first
    try {
      const formData = new FormData();
      formData.append('image', base64Data);

      const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
      });

      if (imgbbRes.ok) {
        const data = await imgbbRes.json();
        if (data.success && data.data?.url) {
          return NextResponse.json(
            { success: true, url: data.data.url },
            { headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }
      }
    } catch (e) {
      console.warn('ImgBB upload error in route:', e);
    }

    // 2. Fallback to ImageKit
    try {
      const blob = new Blob([buffer], { type: mimeType });
      const formData = new FormData();
      formData.append('file', blob, fileName);
      formData.append('fileName', fileName);
      formData.append('publicKey', IMAGEKIT_PUBLIC);
      formData.append('useUniqueFileName', 'true');

      const ikRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(IMAGEKIT_PRIVATE + ':').toString('base64'),
        },
        body: formData,
      });

      if (ikRes.ok) {
        const data = await ikRes.json();
        if (data.url) {
          return NextResponse.json(
            { success: true, url: data.url },
            { headers: { 'Access-Control-Allow-Origin': '*' } }
          );
        }
      }
    } catch (e) {
      console.warn('ImageKit upload error in route:', e);
    }

    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 502, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('Upload API route error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
