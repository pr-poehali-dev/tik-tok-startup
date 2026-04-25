import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { getChats, getMessages, sendMessage, type Chat, type Message } from "@/lib/api";
import { getToken } from "@/lib/auth";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "сейчас";
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ч`;
  return `${Math.floor(h / 24)}д`;
}

interface ChatWindowProps {
  chat: Chat;
  myId: string;
  onBack: () => void;
}

function ChatWindow({ chat, myId, onBack }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages(chat.user_id).then((d) => {
      setMessages(d.messages);
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }).catch(() => setLoading(false));
  }, [chat.user_id]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const msgText = text.trim();
    setSending(true);
    setText("");
    const tempMsg: Message = {
      id: "temp_" + Date.now(),
      sender_id: myId,
      receiver_id: chat.user_id,
      text: msgText,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, tempMsg]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      const { message } = await sendMessage(chat.user_id, msgText);
      setMessages((p) => p.map((m) => m.id === tempMsg.id ? message : m));
    } catch {
      setMessages((p) => p.filter((m) => m.id !== tempMsg.id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="glass-dark px-4 pt-12 pb-3 flex items-center gap-3 border-b border-white/10 flex-shrink-0">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={22} />
        </button>
        <div className="relative">
          <img src={chat.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${chat.username}`} alt={chat.display_name} className="w-10 h-10 rounded-full bg-white/10" />
        </div>
        <div className="flex-1">
          <p className="text-white font-700 text-sm">{chat.display_name || chat.username}</p>
          <p className="text-white/40 text-xs">@{chat.username}</p>
        </div>
        <button className="text-white/50 hover:text-white transition-colors">
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {loading && <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}
        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
            <Icon name="MessageCircle" size={40} />
            <p className="text-sm">Напишите первым!</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isMine = m.sender_id === myId;
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${Math.min(i, 10) * 0.03}s`, opacity: 0, animationFillMode: "forwards" }}>
              {!isMine && (
                <img src={chat.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${chat.username}`} alt="" className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end bg-white/10" />
              )}
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine ? "bg-[hsl(var(--neon-pink))] text-white rounded-br-sm" : "glass text-white/90 rounded-bl-sm"}`}>
                <p>{m.text}</p>
                <p className={`text-xs mt-1 ${isMine ? "text-white/60 text-right" : "text-white/30"}`}>
                  {new Date(m.created_at).toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4 glass-dark border-t border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 glass rounded-full px-4 py-2.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Сообщение..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${text.trim() && !sending ? "bg-[hsl(var(--neon-pink))] text-white" : "glass text-white/30"}`}
          >
            <Icon name={sending ? "Loader2" : "Send"} size={17} className={sending ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [myId, setMyId] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    getChats().then((d) => {
      setChats(d.chats);
      setLoading(false);
    }).catch(() => setLoading(false));

    const stored = localStorage.getItem("vspyshka_user_id");
    if (stored) setMyId(stored);
  }, []);

  if (activeChat) {
    return <ChatWindow chat={activeChat} myId={myId} onBack={() => setActiveChat(null)} />;
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-4">
      <div className="sticky top-0 z-10 glass-dark px-4 pt-12 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="font-rubik font-900 text-white text-xl">Сообщения</h1>
          <button className="glass rounded-full p-2">
            <Icon name="Edit" size={18} className="text-white/70" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3 glass rounded-xl px-4 py-2.5">
          <Icon name="Search" size={16} className="text-white/30" />
          <span className="text-white/30 text-sm">Найти переписку...</span>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[hsl(var(--neon-pink))] rounded-full animate-spin" />
        </div>
      )}

      {!loading && chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3">
          <Icon name="MessageCircle" size={48} />
          <div className="text-center">
            <p className="font-rubik font-700 text-white/50">Нет переписок</p>
            <p className="text-sm mt-1">Подпишитесь на авторов и начните общение</p>
          </div>
        </div>
      )}

      <div className="divide-y divide-white/5">
        {chats.map((chat, i) => (
          <button
            key={chat.user_id}
            onClick={() => setActiveChat(chat)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/3 transition-colors text-left animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}
          >
            <div className="relative flex-shrink-0">
              <img src={chat.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${chat.username}`} alt={chat.display_name} style={{ width: 52, height: 52 }} className="rounded-full bg-white/10 object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-700 text-sm ${chat.unread_count > 0 ? "text-white" : "text-white/80"}`}>{chat.display_name || chat.username}</span>
                <span className="text-white/30 text-xs flex-shrink-0 ml-2">{timeAgo(chat.last_time)}</span>
              </div>
              <p className={`text-sm truncate ${chat.unread_count > 0 ? "text-white/70" : "text-white/40"}`}>{chat.last_message}</p>
            </div>
            {chat.unread_count > 0 && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--neon-pink))] flex items-center justify-center">
                <span className="text-white text-xs font-700">{chat.unread_count}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
