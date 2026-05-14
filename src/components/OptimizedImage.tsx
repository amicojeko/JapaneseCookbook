import React from 'react';
import imageSrcset from '../../static/image-srcset.json';

interface ImageSrcsetData {
  hash?: string;
  original: string;
  srcset: string; // WebP-only since the 2026-05 image pipeline rework
  width: number;
  height: number;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  pictureClassName?: string;
  /** Disable lazy loading for above-the-fold heroes. Default: true. */
  lazy?: boolean;
  /** Style passthrough for the inner <img>. */
  style?: React.CSSProperties;
  /** Optional explicit dims (overrides manifest width/height). */
  width?: number | string;
  height?: number | string;
}

/**
 * Renders a `<picture>` that serves a WebP responsive variant from the
 * pre-generated srcset (built by scripts/optimize-images.js + tracked in
 * static/image-srcset.json) with the master image as fallback for the
 * <0.6% of browsers without WebP support.
 *
 * Falls back to a plain <img> when the master isn't in the manifest
 * (e.g. external URL, or a path outside static/img/).
 */
export default function OptimizedImage({
  src,
  alt,
  className,
  pictureClassName,
  lazy = true,
  style,
  width,
  height,
}: OptimizedImageProps): React.ReactElement {
  const srcsetKey = src.replace(/^\/img\//, '');
  const srcsetData = (imageSrcset as Record<string, ImageSrcsetData>)[srcsetKey] as
    | ImageSrcsetData
    | undefined;

  const imgWidth = width ?? srcsetData?.width;
  const imgHeight = height ?? srcsetData?.height;

  if (srcsetData?.srcset) {
    return (
      <picture className={pictureClassName}>
        <source srcSet={srcsetData.srcset} type="image/webp" />
        <img
          src={srcsetData.original || src}
          alt={alt}
          className={className}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          width={imgWidth}
          height={imgHeight}
          style={style}
        />
      </picture>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      width={imgWidth}
      height={imgHeight}
      style={style}
    />
  );
}
