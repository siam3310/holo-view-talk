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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
      <div className="w-full max-w-4xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-primary mb-4 shadow-glow">
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            StreamSync
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch HLS streams together in real-time with friends. Chat, like messages, and enjoy synchronized viewing.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Video className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Multi-Player Support</h3>
              <p className="text-sm text-muted-foreground">Switch between 6 different video players</p>
            </CardContent>
          </Card>
          <Card className="border-accent/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold">Live Chat</h3>
              <p className="text-sm text-muted-foreground">Chat in real-time with other viewers</p>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Instant Sync</h3>
              <p className="text-sm text-muted-foreground">Everyone watches in perfect sync</p>
            </CardContent>
          </Card>
        </div>

        {/* Create Room Form */}
        <Card className="border-primary/30 shadow-glow">
          <CardHeader>
            <CardTitle className="text-2xl">Create a Watch Room</CardTitle>
            <CardDescription>Enter an HLS stream URL to start watching together</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name (Optional)</Label>
                <Input
                  id="roomName"
                  placeholder="My Awesome Stream"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="bg-secondary border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hlsUrl">HLS Stream URL *</Label>
                <Input
                  id="hlsUrl"
                  type="url"
                  placeholder="https://example.com/stream.m3u8"
                  value={hlsUrl}
                  onChange={(e) => setHlsUrl(e.target.value)}
                  required
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Must start with https:// and include .m3u8
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-6 text-lg shadow-glow"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Room...' : 'Create Room & Start Watching'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
