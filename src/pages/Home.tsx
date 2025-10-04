import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Video, Users, Zap } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState('');
  const [hlsUrl, setHlsUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateHlsUrl = (url: string): boolean => {
    if (!url.startsWith('https://')) {
      toast.error('URL must start with https://');
      return false;
    }
    if (!url.includes('.m3u8')) {
      toast.error('URL must include .m3u8');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateHlsUrl(hlsUrl)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          name: roomName || null,
          hls_url: hlsUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Room created successfully!');
      navigate(`/watch/${data.id}`);
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          
          {/* Hero Title - Full Width */}
          <div className="md:col-span-12 border-4 border-foreground p-8 md:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-foreground flex items-center justify-center">
                <Video className="w-8 h-8 text-background" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
                StreamSync
              </h1>
            </div>
            <p className="text-xl md:text-2xl font-bold max-w-3xl">
              Watch HLS streams together in real-time. Chat, like messages, and enjoy synchronized viewing.
            </p>
          </div>

          {/* Feature Box 1 */}
          <div className="md:col-span-4 border-4 border-foreground p-6 bg-foreground text-background">
            <Video className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-black mb-2">MULTI-PLAYER</h3>
            <p className="font-bold">Switch between 3 different video players</p>
          </div>

          {/* Feature Box 2 */}
          <div className="md:col-span-4 border-4 border-foreground p-6">
            <Users className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-black mb-2">LIVE CHAT</h3>
            <p className="font-bold">Chat in real-time with other viewers</p>
          </div>

          {/* Feature Box 3 */}
          <div className="md:col-span-4 border-4 border-foreground p-6 bg-foreground text-background">
            <Zap className="w-12 h-12 mb-4" />
            <h3 className="text-2xl font-black mb-2">INSTANT SYNC</h3>
            <p className="font-bold">Everyone watches in perfect sync</p>
          </div>

          {/* Create Room Form - Larger Box */}
          <div className="md:col-span-12 border-4 border-foreground p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-2">Create a Watch Room</h2>
            <p className="text-lg font-bold mb-8 text-muted-foreground">Enter an HLS stream URL to start watching together</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-lg font-black uppercase">Room Name (Optional)</Label>
                <Input
                  id="roomName"
                  placeholder="My Awesome Stream"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-background border-4 border-foreground h-14 text-lg font-bold focus:ring-0 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hlsUrl" className="text-lg font-black uppercase">HLS Stream URL *</Label>
                <Input
                  id="hlsUrl"
                  type="url"
                  placeholder="https://example.com/stream.m3u8"
                  value={hlsUrl}
                  onChange={(e) => setHlsUrl(e.target.value)}
                  required
                  className="bg-background border-4 border-foreground h-14 text-lg font-bold focus:ring-0 focus:border-foreground"
                />
                <p className="text-sm font-bold text-muted-foreground">
                  Must start with https:// and include .m3u8
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-foreground text-background hover:bg-background hover:text-foreground border-4 border-foreground font-black text-xl uppercase h-16 transition-all"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Room...' : 'Create Room & Start Watching'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
