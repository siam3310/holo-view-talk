import { useEffect, useRef, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Hls from 'hls.js';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

type PlayerType = 'videojs' | 'hlsjs' | 'native';

interface VideoPlayerProps {
  hlsUrl: string;
}

const VideoPlayer = ({ hlsUrl }: VideoPlayerProps) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerType>('videojs');
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (!videoRef.current) return;

      // Cleanup previous player
      if (playerRef.current) {
        try {
          if (selectedPlayer === 'videojs' && playerRef.current.dispose) {
            playerRef.current.dispose();
          } else if (selectedPlayer === 'hlsjs' && playerRef.current.destroy) {
            playerRef.current.destroy();
          }
        } catch (error) {
          console.error('Error cleaning up player:', error);
        }
        playerRef.current = null;
      }

      // Reset video element
      if (videoRef.current) {
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }

      try {
        switch (selectedPlayer) {
          case 'videojs':
            initVideoJs();
            break;
          case 'hlsjs':
            initHlsJs();
            break;
          case 'native':
            initNative();
            break;
        }
      } catch (error) {
        console.error(`Error initializing ${selectedPlayer}:`, error);
      }
    };

    initPlayer();

    return () => {
      if (playerRef.current) {
        try {
          if (selectedPlayer === 'videojs' && playerRef.current.dispose) {
            playerRef.current.dispose();
          } else if (selectedPlayer === 'hlsjs' && playerRef.current.destroy) {
            playerRef.current.destroy();
          }
        } catch (error) {
          console.error('Error cleaning up on unmount:', error);
        }
      }
    };
  }, [selectedPlayer, hlsUrl]);

  const initVideoJs = () => {
    if (!videoRef.current) return;
    
    playerRef.current = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
      fluid: true,
      sources: [{
        src: hlsUrl,
        type: 'application/x-mpegURL'
      }]
    });
  };

  const initHlsJs = () => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('HLS manifest loaded');
      });
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
      });
      
      playerRef.current = hls;
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      videoRef.current.src = hlsUrl;
    }
  };

  const initNative = () => {
    if (!videoRef.current) return;
    videoRef.current.src = hlsUrl;
  };

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <div className="bg-card p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Label htmlFor="player-select" className="text-sm font-medium whitespace-nowrap">
            Video Player:
          </Label>
          <Select value={selectedPlayer} onValueChange={(value) => setSelectedPlayer(value as PlayerType)}>
            <SelectTrigger id="player-select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="videojs">Video.js (Default)</SelectItem>
              <SelectItem value="hlsjs">HLS.js</SelectItem>
              <SelectItem value="native">Native HTML5</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center bg-black">
        <div id="player-container" className="w-full max-w-7xl aspect-video">
          <video
            ref={videoRef}
            className="video-js vjs-default-skin w-full h-full"
            controls
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
