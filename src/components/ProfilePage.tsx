import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getUserVideos, type Video } from "@/lib/api";
import type { User } from "@/lib/auth";

function formatBig(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "М";
  if (n >= 1000) return (n / 1000).toFixed(0) + "К";
  return String(n);
}

interface ProfilePageProps {
  user: User;
  onLogout: () => void;
}

export default function ProfilePage({ user: currentUser, onLogout }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<"videos" | "liked">("videos");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    getUserVideos(currentUser.id).then((d) => {
      setVideos(d.videos);
      setLoadingVideos(false);
    }).catch(() => setLoadingVideos(false));
  }, [currentUser.id]);

  // Save user id for chat
  useEffect(() => {
    localStorage.setItem("vspyshka_user_id", currentUser.id);
  }, [currentUser.id]);

  const avatarUrl = currentUser.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${currentUser.username}&backgroundColor=b6e3f4`;

  const stats = [
    { label: "Подписчики", value: formatBig(currentUser.followers_count) },
    { label: "Подписки", value: formatBig(currentUser.following_count) },
    { label: "Лайки", value: formatBig(currentUser.likes_count) },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background pb-20">
      <div className="relative">
        <div className="h-36 w-full" style={{ background: "linear-gradient(135deg, hsl(350 100% 20% / 0.8) 0%, hsl(180 100% 15% / 0.8) 100%)" }}>
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(var(--neon-pink)) 0%, transparent 60%), radial-gradient(circle at 70% 50%, hsl(var(--neon-cyan)) 0%, transparent 60%)" }} />
        </div>

        <div className="absolute top-12 right-4 flex gap-2">
          <button className="glass rounded-full p-2">
            <Icon name="Share2" size={18} className="text-white" />
          </button>
          <button onClick={onLogout} className="glass rounded-full p-2" title="Выйти">
            <Icon name="LogOut" size={18} className="text-white" />
          </button>
        </div>

        <div className="flex flex-col items-center -mt-12 relative z-10">
          <div className="w-24 h-24 rounded-full border-4 border-background overflow-hidden animate-glow-pulse">
            <img src={avatarUrl} alt={currentUser.display_name} className="w-full h-full object-cover bg-white/10" />
          </div>
          <h2 className="font-rubik font-900 text-xl text-white mt-2">{currentUser.display_name || currentUser.username}</h2>
          <p className="text-white/50 text-sm">@{currentUser.username}</p>
          <p className="text-white/70 text-sm mt-1.5 text-center max-w-xs px-4">{currentUser.bio || "Новый пользователь ВспышкаВидео ✨"}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mt-5 px-4">
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 0.08}s`, opacity: 0, animationFillMode: "forwards" }}>
            <span className="font-rubik font-900 text-xl text-white">{s.value}</span>
            <span className="text-white/50 text-xs mt-0.5">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 px-6 mt-5">
        <button className="flex-1 py-2.5 rounded-full glass border border-white/20 text-white text-sm font-600 hover:border-white/40 transition-colors">
          Редактировать профиль
        </button>
        <button className="px-4 py-2.5 rounded-full glass border border-white/20 text-white hover:border-white/40 transition-colors">
          <Icon name="Share2" size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mt-6 border-b border-white/10">
        {(["videos", "liked"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-600 transition-all ${activeTab === tab ? "text-white border-b-2 border-[hsl(var(--neon-pink))]" : "text-white/40 hover:text-white/60"}`}
          >
            <Icon name={tab === "videos" ? "Grid3x3" : "Heart"} size={17} />
            {tab === "videos" ? `Видео${videos.length > 0 ? ` (${videos.length})` : ""}` : "Лайки"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loadingVideos ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[hsl(var(--neon-pink))] rounded-full animate-spin" />
        </div>
      ) : videos.length === 0 && activeTab === "videos" ? (
        <div className="flex flex-col items-center justify-center py-16 text-white/30 gap-3">
          <Icon name="Video" size={48} />
          <div className="text-center">
            <p className="font-rubik font-700 text-white/50">Нет видео</p>
            <p className="text-sm mt-1">Загрузи первое видео!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
          {videos.map((v, i) => (
            <div key={v.id} className="relative overflow-hidden cursor-pointer group animate-fade-in" style={{ aspectRatio: "9/16", animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}>
              <img src={v.thumbnail_url || "/placeholder.svg"} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                <Icon name="Play" size={10} className="text-white fill-white" />
                <span className="text-white text-xs font-600">
                  {v.views_count >= 1000 ? Math.round(v.views_count / 1000) + "К" : v.views_count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
