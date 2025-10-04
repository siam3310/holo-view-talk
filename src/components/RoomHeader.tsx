import { Button } from '@/components/ui/button';
import { Share2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface RoomHeaderProps {
  roomName: string | null;
  roomId: string;
}

const RoomHeader = ({ roomName, roomId }: RoomHeaderProps) => {
  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Room link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy link');
    }
  };

  return (
    <header className="bg-background border-b-4 border-foreground px-4 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-foreground">
            <Video className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="font-black text-xl uppercase">
              {roomName || 'Untitled Room'}
            </h1>
            <p className="text-xs font-bold text-muted-foreground">ID: {roomId.slice(0, 8)}</p>
          </div>
        </div>
        <Button 
          onClick={handleShare}
          className="gap-2 bg-foreground text-background hover:bg-background hover:text-foreground border-4 border-foreground font-black uppercase"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default RoomHeader;
