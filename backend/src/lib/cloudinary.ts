import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

const log = logger.child('Cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

/**
 * Upload an image from a URL to Cloudinary.
 * Falls back to null if upload fails.
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string = 'voltnet/products'
): Promise<UploadResult | null> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    log.warn('Cloudinary not configured — skipping upload, using original URL');
    return { url: imageUrl, publicId: '', width: 0, height: 0 };
  }

  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder,
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
      timeout: 30000,
    });

    log.info('Image uploaded', { publicId: result.public_id, url: result.secure_url });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (err: any) {
    log.error('Image upload failed', { imageUrl, error: err.message });
    return null;
  }
}

/**
 * Upload a buffer (from multer) to Cloudinary.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  folder: string = 'voltnet/products'
): Promise<UploadResult | null> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    log.warn('Cloudinary not configured — cannot upload buffer');
    return null;
  }

  try {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: filename.replace(/\.[^.]+$/, ''),
            transformation: [
              { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (err, res) => {
            if (err) reject(err);
            else resolve(res);
          }
        )
        .end(buffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (err: any) {
    log.error('Buffer upload failed', { filename, error: err.message });
    return null;
  }
}

export default cloudinary;
