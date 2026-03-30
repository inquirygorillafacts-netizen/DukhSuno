/**
 * Centralized image upload utility for BigSuno.
 * Calls the internal /api/upload-qr route to handle ImgBB uploads.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/upload-qr', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.url) {
      return data.url;
    } else {
      throw new Error(data.error || 'Upload failed');
    }
  } catch (error: any) {
    console.error('Image Upload Error:', error);
    throw new Error(error.message || 'Failed to upload image. Please try again.');
  }
}
