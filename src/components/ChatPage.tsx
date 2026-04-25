import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MESSAGES } from "@/data/mockData";

interface ChatWindowProps {
  user: { name: string; username: string; avatar: string; online: boolean };
  onBack: () => void;
}

function ChatWindow({ user, onBack }: ChatWindowProps) {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState([
    { id: "1", mine: false, text: "Привет! Видел твоё последнее видео — огонь! 🔥", time: "14:20" },
    { id: "2", mine: true, text: "Спасибо! Старался 😊 Давно снимал этот момент", time: "14:21" },
    { id: "3", mine: false, text: "Будут ещё коллаборации?", time: "14:22" },
    { id: "4", mine: true, text: "Обязательно! Уже есть несколько идей 🎬", time: "14:24" },
    { id: "5", mine: false, text: user.username === "@alexdj" ? "Спасибо за поддержку! 🙏" : "Попробуй этот рецепт!", time: "14:28" },
  ]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs((p) => [...p, { id: String(Date.now()), mine: true, text: text.trim(), time: new Date().toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" }) }]);
    setText("");
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="glass-dark px-4 pt-12 pb-3 flex items-center gap-3 border-b border-white/10">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={22} />
        </button>
        <div className="relative">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-white/10" />
          {user.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-background" />}
        </div>
        <div className="flex-1">
          <p className="text-white font-700 text-sm">{user.name}</p>
          <p className="text-white/40 text-xs">{user.online ? "онлайн" : "был недавно"}</p>
        </div>
        <button className="text-white/50 hover:text-white transition-colors">
          <Icon name="MoreHorizontal" size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"} animate-fade-in`} style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}>
            {!m.mine && (
              <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full mr-2 flex-shrink-0 self-end bg-white/10" />
            )}
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.mine
                ? "bg-[hsl(var(--neon-pink))] text-white rounded-br-sm"
                : "glass text-white/90 rounded-bl-sm"
            }`}>
              <p>{m.text}</p>
              <p className={`text-xs mt-1 ${m.mine ? "text-white/60 text-right" : "text-white/30"}`}>{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-4 glass-dark border-t border-white/10">
        <div className="flex items-center gap-3">
          <button className="text-white/50 hover:text-white transition-colors flex-shrink-0">
            <Icon name="PlusCircle" size={22} />
          </button>
          <div className="flex-1 flex items-center gap-2 glass rounded-full px-4 py-2.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Сообщение..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
            <button className="text-white/40 hover:text-white transition-colors">
              <Icon name="Smile" size={18} />
            </button>
          </div>
          <button
            onClick={send}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              text.trim() ? "bg-[hsl(var(--neon-pink))] text-white" : "glass text-white/30"
            }`}
          >
            <Icon name="Send" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState<string | null>(null);

  const active = MESSAGES.find((m) => m.id === activeChat);

  if (active) {
    return <ChatWindow user={active.user} onBack={() => setActiveChat(null)} />;
  }

  return (
    <div className="h-screen overflow-y-auto bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark px-4 pt-12 pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h1 className="font-rubik font-900 text-white text-xl">Сообщения</h1>
          <button className="glass rounded-full p-2">
            <Icon name="Edit" size={18} className="text-white/70" />
          </button>
        </div>

        {/* New message bar */}
        <div className="mt-3 flex items-center gap-3 glass rounded-xl px-4 py-2.5">
          <Icon name="Search" size={16} className="text-white/30" />
          <span className="text-white/30 text-sm">Найти переписку...</span>
        </div>
      </div>

      {/* Message list */}
      <div className="divide-y divide-white/5">
        {MESSAGES.map((m, i) => (
          <button
            key={m.id}
            onClick={() => setActiveChat(m.id)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-white/3 transition-colors text-left animate-fade-in"
            style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img src={m.user.avatar} alt={m.user.name} className="w-13 h-13 rounded-full bg-white/10" style={{ width: 52, height: 52 }} />
              {m.user.online && <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`font-700 text-sm ${m.unread > 0 ? "text-white" : "text-white/80"}`}>{m.user.name}</span>
                <span className="text-white/30 text-xs flex-shrink-0 ml-2">{m.time}</span>
              </div>
              <p className={`text-sm truncate ${m.unread > 0 ? "text-white/70" : "text-white/40"}`}>{m.lastMessage}</p>
            </div>

            {/* Unread badge */}
            {m.unread > 0 && (
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(var(--neon-pink))] flex items-center justify-center">
                <span className="text-white text-xs font-700">{m.unread}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Empty state hint */}
      <div className="px-4 pt-6 pb-4">
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-pink))/0.15] flex items-center justify-center flex-shrink-0">
            <Icon name="Zap" size={20} className="text-[hsl(var(--neon-pink))]" />
          </div>
          <div>
            <p className="text-white font-600 text-sm">Открытые сообщения</p>
            <p className="text-white/40 text-xs mt-0.5">Авторы могут написать вам первыми</p>
          </div>
          <Icon name="ChevronRight" size={16} className="text-white/30 ml-auto flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
