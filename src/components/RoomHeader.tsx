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
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-primary">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg">
              {roomName || 'Untitled Room'}
            </h1>
            <p className="text-xs text-muted-foreground">Room ID: {roomId.slice(0, 8)}</p>
          </div>
        </div>
        <Button 
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Room
        </Button>
      </div>
    </header>
  );
};

export default RoomHeader;
