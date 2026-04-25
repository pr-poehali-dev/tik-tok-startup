import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { searchContent, followUser, unfollowUser, type Video } from "@/lib/api";

const TRENDING_TAGS = ["#fyp", "#танцы", "#кулинария", "#спорт", "#животные", "#музыка", "#юмор", "#путешествия"];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "users" | "tags">("all");
  const [results, setResults] = useState<{ videos: Video[]; users: { id: string; username: string; display_name: string; avatar_url: string; followers_count: number; is_verified: boolean }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filters = [
    { id: "all" as const, label: "Все" },
    { id: "users" as const, label: "Авторы" },
    { id: "tags" as const, label: "Хэштеги" },
  ];

  useEffect(() => {
    if (!query.trim()) { setResults(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchContent(query.trim());
        setResults(data as typeof results);
      } catch { /* silent */ }
      finally { setLoading(false); }
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const handleFollow = async (uid: string) => {
    const isFollowing = followedIds.has(uid);
    setFollowedIds((prev) => { const s = new Set(prev); if (isFollowing) { s.delete(uid); } else { s.add(uid); } return s; });
    try {
      if (isFollowing) { await unfollowUser(uid); } else { await followUser(uid); }
    } catch {
      setFollowedIds((prev) => { const s = new Set(prev); if (isFollowing) { s.add(uid); } else { s.delete(uid); } return s; });
    }
  };

  const filteredVideos = results?.videos.filter(() => activeFilter !== "users") ?? [];
  const filteredUsers = results?.users.filter(() => activeFilter !== "tags") ?? [];

  return (
    <div className="h-full overflow-y-auto bg-background pb-4">
      {/* Search bar */}
      <div className="sticky top-0 z-10 glass-dark px-4 pt-12 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
          <Icon name="Search" size={18} className="text-white/40 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск видео, людей, хэштегов..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            autoFocus={false}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <Icon name="X" size={16} className="text-white/40" />
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-600 transition-all ${activeFilter === f.id ? "bg-[hsl(var(--neon-pink))] text-white" : "glass text-white/60 hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-white/20 border-t-[hsl(var(--neon-pink))] rounded-full animate-spin" />
        </div>
      )}

      {/* No query: trending */}
      {!query && !loading && (
        <div className="px-4 pt-5">
          <h2 className="text-white/50 text-xs font-700 uppercase tracking-wider mb-3">Популярные теги</h2>
          <div className="grid grid-cols-2 gap-2">
            {TRENDING_TAGS.map((tag, i) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="flex items-center gap-3 py-3 px-3 rounded-xl glass hover:border-white/20 transition-colors group animate-fade-in text-left"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div className="w-9 h-9 rounded-xl bg-[hsl(var(--neon-pink))/0.1] flex items-center justify-center flex-shrink-0">
                  <span className="text-[hsl(var(--neon-cyan))] font-900 text-base">#</span>
                </div>
                <span className="text-white/80 text-sm font-500 truncate">{tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && !loading && (
        <div className="pt-2">
          {filteredUsers.length === 0 && filteredVideos.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 animate-fade-in">
              <Icon name="SearchX" size={48} className="mb-3" />
              <p className="text-sm">Ничего не найдено по «{query}»</p>
            </div>
          )}

          {/* Users */}
          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 border-b border-white/8">
              <h3 className="text-white/40 text-xs mb-3 font-700 uppercase tracking-wide">АВТОРЫ</h3>
              <div className="space-y-3">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 animate-slide-in-right">
                    <img src={u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`} alt={u.display_name} className="w-11 h-11 rounded-full bg-white/10" />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-white font-600 text-sm">{u.display_name || u.username}</span>
                        {u.is_verified && <Icon name="BadgeCheck" size={13} className="text-[hsl(var(--neon-cyan))]" />}
                      </div>
                      <p className="text-white/40 text-xs">@{u.username} · {u.followers_count} подписчиков</p>
                    </div>
                    <button
                      onClick={() => handleFollow(u.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-600 transition-all border ${followedIds.has(u.id) ? "border-white/20 text-white/60" : "border-[hsl(var(--neon-pink))] text-[hsl(var(--neon-pink))]"}`}
                    >
                      {followedIds.has(u.id) ? "Отписаться" : "Подписаться"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {filteredVideos.length > 0 && (
            <div className="px-4 pt-3">
              <h3 className="text-white/40 text-xs mb-3 font-700 uppercase tracking-wide">ВИДЕО</h3>
              <div className="grid grid-cols-2 gap-2">
                {filteredVideos.map((v, i) => (
                  <div key={v.id} className="rounded-xl overflow-hidden relative cursor-pointer group animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}>
                    <div className="aspect-[9/14] overflow-hidden bg-white/5">
                      <img src={v.thumbnail_url} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 gradient-overlay rounded-xl" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-500 line-clamp-2 leading-tight">{v.title || v.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Icon name="Play" size={10} className="text-white/60 fill-current" />
                        <span className="text-white/60 text-xs">{v.views_count > 0 ? (v.views_count >= 1000 ? Math.round(v.views_count / 1000) + "К" : v.views_count) : "0"}</span>
                        <Icon name="Heart" size={10} className="text-white/60 ml-1" />
                        <span className="text-white/60 text-xs">{v.likes_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}