import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import VideoPlayer from '@/components/VideoPlayer';
import Chat from '@/components/Chat';
import RoomHeader from '@/components/RoomHeader';

interface Room {
  id: string;
  name: string | null;
  hls_url: string;
  created_at: string;
}

const Watch = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          setNotFound(true);
        } else {
          setRoom(data);
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load room');
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Room Not Found</h1>
          <p className="text-muted-foreground">The room you're looking for doesn't exist.</p>
          <a href="/" className="text-primary hover:underline">
            Create a new room
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <RoomHeader roomName={room.name} roomId={room.id} />
      
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Video Section - 70% on desktop */}
        <div className="w-full lg:w-[70%] bg-black">
          <VideoPlayer hlsUrl={room.hls_url} />
        </div>
        
        {/* Chat Section - 30% on desktop */}
        <div className="w-full lg:w-[30%] border-l border-border">
          <Chat roomId={room.id} />
        </div>
      </div>
    </div>
  );
};

export default Watch;
