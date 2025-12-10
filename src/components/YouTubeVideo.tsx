import React from 'react';

type Props = {
  videoId: string;
  title?: string;
};

const YouTubeVideo: React.FC<Props> = ({ videoId, title = 'YouTube video player' }) => {
  return (
    <div className="video-container-responsive">
      <div>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?hd=1&vq=hd720&modestbranding=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ display: 'block' }}
        ></iframe>
      </div>
    </div>
  );
};

export default YouTubeVideo;
