import React from 'react';
import imageSrcset from '../../static/image-srcset.json';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  pictureClassName?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  pictureClassName,
}: OptimizedImageProps): React.ReactElement {
  const srcsetKey = src.replace(/^\/img\//, '');
  const srcsetData = (imageSrcset as Record<string, any>)[srcsetKey];

  if (srcsetData?.srcset) {
    return (
      <picture className={pictureClassName}>
        <source srcSet={srcsetData.srcset} type="image/jpeg" />
        <img
          src={srcsetData.original || src}
          alt={alt}
          className={className}
          loading="lazy"
          decoding="async"
          width={srcsetData.width}
          height={srcsetData.height}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
