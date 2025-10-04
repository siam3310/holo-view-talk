import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Heart, Send } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  room_id: string;
  username: string;
  content: string;
  likes: number;
  created_at: string;
}

interface ChatProps {
  roomId: string;
}

const Chat = ({ roomId }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('Anonymous');
  const [isSending, setIsSending] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [...prev, payload.new as Message]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev =>
              prev.map(msg => msg.id === payload.new.id ? payload.new as Message : msg)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    if (newMessage.length > 200) {
      toast.error('Message too long (max 200 characters)');
      return;
    }

    // Rate limiting: 1 message per 5 seconds
    const now = Date.now();
    if (now - lastMessageTime < 5000) {
      toast.error('Please wait before sending another message');
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          username: username,
          content: newMessage.trim(),
        });

      if (error) throw error;

      setNewMessage('');
      setLastMessageTime(now);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleLikeMessage = async (messageId: string, currentLikes: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ likes: currentLikes + 1 })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error liking message:', error);
      toast.error('Failed to like message');
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg">Live Chat</h2>
        <p className="text-sm text-muted-foreground">{messages.length} messages</p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="bg-secondary rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary truncate">
                    {message.username}
                  </p>
                  <p className="text-sm break-words">{message.content}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 gap-1 hover:text-accent"
                  onClick={() => handleLikeMessage(message.id, message.likes)}
                >
                  <Heart className="w-3 h-3" fill={message.likes > 0 ? 'currentColor' : 'none'} />
                  <span>{message.likes}</span>
                </Button>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-2">
        <Input
          placeholder="Username (optional)"
          value={username}
          onChange={(e) => setUsername(e.target.value || 'Anonymous')}
          className="bg-secondary"
          maxLength={50}
        />
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="bg-secondary"
            maxLength={200}
            disabled={isSending}
          />
          <Button 
            type="submit" 
            size="icon"
            className="bg-gradient-primary hover:opacity-90"
            disabled={isSending || !newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center">
          {newMessage.length}/200 characters
        </p>
      </div>
    </div>
  );
};

export default Chat;
