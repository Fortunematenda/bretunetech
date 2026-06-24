import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  objectFit = 'cover',
}: OptimizedImageProps) {
  // Ensure alt text is always present and descriptive
  const safeAlt = alt?.trim() || 'Bretunetech product image';

  // Validate src is a valid URL or path
  if (!src || (!src.startsWith('http') && !src.startsWith('/'))) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width: fill ? '100%' : width, height: fill ? '100%' : height }}
      >
        <span className="text-xs text-gray-400">No image</span>
      </div>
    );
  }

  const imageStyle = objectFit ? { objectFit } : undefined;

  if (fill) {
    return (
      <Image
        src={src}
        alt={safeAlt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
        style={imageStyle}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={safeAlt}
      width={width || 400}
      height={height || 300}
      className={className}
      priority={priority}
      sizes={sizes}
      style={imageStyle}
    />
  );
}
