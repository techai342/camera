/**
 * Uploads a base64 or blob image through the secure Next.js /api/upload API route.
 * Keeps server credentials (ImgBB / ImageKit) protected on the server side.
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: dataUrl }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
    return null;
  } catch (err) {
    console.error('Image upload failed:', err);
    return null;
  }
}
