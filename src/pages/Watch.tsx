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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-8 border-foreground border-t-transparent mx-auto"></div>
          <p className="font-black text-xl uppercase">Loading room...</p>
        </div>
      </div>
    );
  }

  if (notFound || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 border-4 border-foreground p-12">
          <h1 className="text-5xl font-black uppercase">Room Not Found</h1>
          <p className="font-bold text-xl">The room you're looking for doesn't exist.</p>
          <a href="/" className="inline-block bg-foreground text-background px-8 py-4 font-black uppercase border-4 border-foreground hover:bg-background hover:text-foreground transition-all">
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
