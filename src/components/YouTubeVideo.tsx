import React, { useState, useCallback } from 'react';
import { gtagEvent } from '@site/src/lib/analytics';

type Props = {
  videoId: string;
  title?: string;
};

// Thumbnail quality ladder. maxresdefault (1280×720, native 16:9) is the
// sharpest but only exists for videos uploaded in HD; sddefault (640×480) is a
// reliable middle ground; hqdefault (480×360) always exists. We start at maxres
// and step down on the first load error.
const THUMB_QUALITIES = ['maxresdefault', 'sddefault', 'hqdefault'] as const;

// Warm up the connections to YouTube's domains on first hover/focus so the
// iframe + player JS start resolving DNS/TLS before the actual click.
let warmed = false;
function warmConnections() {
  if (warmed || typeof document === 'undefined') return;
  warmed = true;
  for (const href of [
    'https://www.youtube-nocookie.com',
    'https://www.google.com',
  ]) {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }
}

/**
 * Facade-pattern YouTube embed. Renders only a thumbnail + play button until
 * the user clicks — the 1+ MB of YouTube player JS (and its tracking cookies)
 * load on demand instead of at first paint. Uses youtube-nocookie so nothing
 * is set until the user opts in by pressing play (GDPR-friendly).
 */
const YouTubeVideo: React.FC<Props> = ({ videoId, title = 'Video YouTube' }) => {
  const [activated, setActivated] = useState(false);
  const [qualityIndex, setQualityIndex] = useState(0);
  const activate = useCallback(() => {
    setActivated(true);
    // GA4 key-event (P6): il click sul facade e' il segnale di "play".
    gtagEvent('youtube_video_play', {
      video_id: videoId,
      page_path:
        typeof window !== 'undefined' ? window.location.pathname : undefined,
    });
  }, [videoId]);
  const onThumbError = useCallback(
    () => setQualityIndex((i) => Math.min(i + 1, THUMB_QUALITIES.length - 1)),
    [],
  );

  return (
    <div className="video-container-responsive">
      <div>
        {activated ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&hd=1&vq=hd720&modestbranding=1`}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ display: 'block' }}
          ></iframe>
        ) : (
          <button
            type="button"
            className="yt-facade"
            onClick={activate}
            onPointerOver={warmConnections}
            onFocus={warmConnections}
            aria-label={`Riproduci il video: ${title}`}
          >
            <img
              className="yt-facade__thumb"
              src={`https://i.ytimg.com/vi/${videoId}/${THUMB_QUALITIES[qualityIndex]}.jpg`}
              onError={onThumbError}
              alt=""
              loading="lazy"
              decoding="async"
            />
            <span className="yt-facade__play" aria-hidden="true">
              <svg viewBox="0 0 68 48" width="68" height="48">
                <path
                  className="yt-facade__play-bg"
                  d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
                />
                <path className="yt-facade__play-arrow" d="M45 24 27 14v20z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideo;
