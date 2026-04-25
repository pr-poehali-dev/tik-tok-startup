import { useState } from "react";
import Icon from "@/components/ui/icon";
import { VIDEOS, HASHTAG_TRENDS } from "@/data/mockData";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "users" | "tags" | "sounds">("all");
  const focused = query.length > 0;

  const filters = [
    { id: "all", label: "Все" },
    { id: "users", label: "Авторы" },
    { id: "tags", label: "Хэштеги" },
    { id: "sounds", label: "Звуки" },
  ] as const;

  const filteredVideos = focused
    ? VIDEOS.filter(
        (v) =>
          v.description.toLowerCase().includes(query.toLowerCase()) ||
          v.hashtags.some((h) => h.toLowerCase().includes(query.toLowerCase())) ||
          v.user.name.toLowerCase().includes(query.toLowerCase())
      )
    : VIDEOS;

  return (
    <div className="h-screen overflow-y-auto bg-background pb-20">
      {/* Search bar */}
      <div className="sticky top-0 z-10 glass-dark px-4 pt-12 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
          <Icon name="Search" size={18} className="text-white/40 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск видео, людей, хэштегов..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <Icon name="X" size={16} className="text-white/40" />
            </button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-600 transition-all ${
                activeFilter === f.id
                  ? "bg-[hsl(var(--neon-pink))] text-white"
                  : "glass text-white/60 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {!focused ? (
        <div className="px-4 pt-5">
          {/* Trending hashtags */}
          <h2 className="text-white/50 text-xs font-700 uppercase tracking-wider mb-3">Тренды сейчас</h2>
          <div className="space-y-0.5">
            {HASHTAG_TRENDS.map((t, i) => (
              <button
                key={t.tag}
                className="w-full flex items-center gap-4 py-3.5 px-3 rounded-xl hover:bg-white/5 transition-colors group animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}
                onClick={() => setQuery(t.tag)}
              >
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center flex-shrink-0 group-hover:border-[hsl(var(--neon-pink))/0.4] transition-colors">
                  <span className="text-[hsl(var(--neon-cyan))] font-900 text-lg">#</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-600 text-sm">{t.tag}</p>
                  <p className="text-white/40 text-xs">{t.count}</p>
                </div>
                <Icon name="TrendingUp" size={16} className="text-[hsl(var(--neon-pink))] ml-auto" />
              </button>
            ))}
          </div>

          {/* Popular users */}
          <h2 className="text-white/50 text-xs font-700 uppercase tracking-wider mt-6 mb-3">Популярные авторы</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {VIDEOS.map((v, i) => (
              <div
                key={v.id}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${i * 0.07}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div className="relative">
                  <img
                    src={v.user.avatar}
                    alt={v.user.name}
                    className="w-16 h-16 rounded-full border-2 border-white/20 group-hover:border-[hsl(var(--neon-pink))] transition-all bg-white/10"
                  />
                  {v.user.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-0.5">
                      <Icon name="BadgeCheck" size={14} className="text-[hsl(var(--neon-cyan))]" />
                    </div>
                  )}
                </div>
                <span className="text-white/80 text-xs text-center max-w-[64px] truncate">{v.user.name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="pt-2">
          {filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30 animate-fade-in">
              <Icon name="SearchX" size={48} className="mb-3" />
              <p className="text-sm">Ничего не найдено по «{query}»</p>
            </div>
          ) : (
            <>
              {/* Users */}
              <div className="px-4 py-3 border-b border-white/8">
                <h3 className="text-white/40 text-xs mb-3">АВТОРЫ</h3>
                <div className="space-y-3">
                  {filteredVideos.slice(0, 2).map((v) => (
                    <div key={v.id} className="flex items-center gap-3 animate-slide-in-right">
                      <img src={v.user.avatar} alt={v.user.name} className="w-11 h-11 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white font-600 text-sm">{v.user.name}</span>
                          {v.user.verified && <Icon name="BadgeCheck" size={13} className="text-[hsl(var(--neon-cyan))]" />}
                        </div>
                        <p className="text-white/40 text-xs">{v.user.username}</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-600 hover:border-[hsl(var(--neon-pink))] transition-colors">
                        Подписаться
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Videos grid */}
              <div className="px-4 pt-3">
                <h3 className="text-white/40 text-xs mb-3">ВИДЕО</h3>
                <div className="grid grid-cols-2 gap-2">
                  {filteredVideos.map((v, i) => (
                    <div key={v.id} className="rounded-xl overflow-hidden relative cursor-pointer group animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: "forwards" }}>
                      <div className="aspect-[9/14] overflow-hidden">
                        <img src={v.thumbnail} alt={v.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="absolute inset-0 gradient-overlay rounded-xl" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-500 line-clamp-2 leading-tight">{v.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Icon name="Play" size={10} className="text-white/60 fill-current" />
                          <span className="text-white/60 text-xs">{v.views}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
