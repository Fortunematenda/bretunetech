import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

const log = logger.child('Cloudinary');

const DEFAULT_CLOUDINARY_FOLDER = 'bretunetech/products';

function hasCloudinaryConfig(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

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
 * Returns null if Cloudinary is not configured or upload fails.
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string = DEFAULT_CLOUDINARY_FOLDER
): Promise<UploadResult | null> {
  const trimmedUrl = imageUrl?.trim();

  if (!trimmedUrl) {
    log.warn('No image URL provided — skipping Cloudinary upload');
    return null;
  }

  if (!hasCloudinaryConfig()) {
    log.warn('Cloudinary not configured — cannot re-host image, skipping');
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(trimmedUrl, {
      folder,
      transformation: [
        {
          width: 800,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          fetch_format: 'auto',
        },
      ],
      timeout: 30000,
    });

    log.info('Image uploaded to Cloudinary', {
      publicId: result.public_id,
      folder,
      url: result.secure_url,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (err: any) {
    log.error('Image upload failed', {
      imageUrl: trimmedUrl,
      folder,
      error: err?.message || String(err),
    });

    return null;
  }
}

/**
 * Upload a buffer, for example from multer, to Cloudinary.
 * Returns null if Cloudinary is not configured or upload fails.
 */
export async function uploadImageBuffer(
  buffer: Buffer,
  filename: string,
  folder: string = DEFAULT_CLOUDINARY_FOLDER
): Promise<UploadResult | null> {
  if (!buffer) {
    log.warn('No image buffer provided — skipping Cloudinary upload');
    return null;
  }

  if (!hasCloudinaryConfig()) {
    log.warn('Cloudinary not configured — cannot upload buffer');
    return null;
  }

  try {
    const safeFilename = filename
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase();

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            public_id: safeFilename,
            transformation: [
              {
                width: 800,
                height: 800,
                crop: 'limit',
                quality: 'auto',
                fetch_format: 'auto',
              },
            ],
          },
          (err, res) => {
            if (err) {
              reject(err);
              return;
            }

            if (!res) {
              reject(new Error('Cloudinary upload returned no response'));
              return;
            }

            resolve(res);
          }
        )
        .end(buffer);
    });

    log.info('Buffer image uploaded to Cloudinary', {
      publicId: result.public_id,
      folder,
      url: result.secure_url,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (err: any) {
    log.error('Buffer upload failed', {
      filename,
      folder,
      error: err?.message || String(err),
    });

    return null;
  }
}

export default cloudinary;