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
  /** Hint for the browser's fetch priority. Set 'high' on the LCP hero. */
  fetchPriority?: 'high' | 'low' | 'auto';
  /** Style passthrough for the inner <img>. */
  style?: React.CSSProperties;
  /** Optional explicit dims (overrides manifest width/height). */
  width?: number | string;
  height?: number | string;
  /**
   * `sizes` attribute hint. Without it the browser assumes the image
   * occupies 100vw and picks oversized variants — es. 640w o più
   * per una card della home che in realtà è 286px (1280 viewport, 4 col)
   * o 220px (768 viewport, 3 col). Tipici buoni valori:
   *   - card grid auto-fill min-280px:  "(max-width: 480px) 100vw, 320px"
   *   - inline content (~720px col):     "(max-width: 720px) 100vw, 720px"
   * Default: content-column (720px).
   */
  sizes?: string;
}

const DEFAULT_SIZES = '(max-width: 720px) 100vw, 720px';

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
  fetchPriority,
  style,
  width,
  height,
  sizes = DEFAULT_SIZES,
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
        <source srcSet={srcsetData.srcset} type="image/webp" sizes={sizes} />
        <img
          src={srcsetData.original || src}
          alt={alt}
          className={className}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          fetchPriority={fetchPriority}
          width={imgWidth}
          height={imgHeight}
          style={style}
          sizes={sizes}
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
      fetchPriority={fetchPriority}
      width={imgWidth}
      height={imgHeight}
      style={style}
    />
  );
}
