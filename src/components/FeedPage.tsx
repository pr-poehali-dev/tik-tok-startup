import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { VIDEOS, COMMENTS, type Video } from "@/data/mockData";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "М";
  if (n >= 1000) return (n / 1000).toFixed(0) + "К";
  return String(n);
}

interface CommentsDrawerProps {
  video: Video;
  onClose: () => void;
}

function CommentsDrawer({ video, onClose }: CommentsDrawerProps) {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full max-h-[75vh] glass-dark rounded-t-3xl flex flex-col animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-rubik font-700 text-white text-base">
            Комментарии · {formatNumber(video.comments)}
          </span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {COMMENTS.map((c, i) => (
            <div key={c.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.05}s`, opacity: 0, animationFillMode: "forwards" }}>
              <img src={c.user.avatar} alt={c.user.name} className="w-9 h-9 rounded-full flex-shrink-0 bg-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-500 text-sm">{c.user.name}</span>
                  <span className="text-white/40 text-xs">{c.time}</span>
                </div>
                <p className="text-white/80 text-sm mt-0.5">{c.text}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Heart" size={14} className="text-white/40" />
                <span className="text-white/40 text-xs">{c.likes}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Добавить комментарий..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
            {text && (
              <button onClick={() => setText("")} className="text-[hsl(var(--neon-pink))] font-600 text-sm">
                Отправить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  isActive: boolean;
}

function VideoCard({ video, isActive }: VideoCardProps) {
  const [liked, setLiked] = useState(video.isLiked);
  const [following, setFollowing] = useState(video.isFollowing);
  const [likesCount, setLikesCount] = useState(video.likes);
  const [showComments, setShowComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);

  const handleLike = () => {
    setLiked((p) => {
      setLikesCount((c) => (p ? c - 1 : c + 1));
      return !p;
    });
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
  };

  return (
    <div className="video-snap-item relative w-full h-screen flex-shrink-0 bg-black overflow-hidden">
      {/* Thumbnail */}
      <img
        src={video.thumbnail}
        alt={video.description}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: isActive ? "none" : "brightness(0.5)" }}
      />

      {/* Gradient */}
      <div className="absolute inset-0 gradient-overlay" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 pb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="glass rounded-full px-3 py-1">
            <span className="text-white/90 text-xs font-golos">Для вас</span>
          </div>
          <div className="glass rounded-full px-3 py-1">
            <span className="text-white/50 text-xs font-golos">Подписки</span>
          </div>
        </div>
        <button className="glass rounded-full p-2">
          <Icon name="Search" size={18} className="text-white/80" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-10">
        {/* Avatar */}
        <div className="relative">
          <img
            src={video.user.avatar}
            alt={video.user.name}
            className="w-12 h-12 rounded-full border-2 border-white object-cover bg-white/10"
          />
          <button
            onClick={() => setFollowing((p) => !p)}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
              following ? "bg-white" : "bg-[hsl(var(--neon-pink))]"
            }`}
          >
            <Icon name={following ? "Check" : "Plus"} size={11} className={following ? "text-black" : "text-white"} />
          </button>
        </div>

        {/* Like */}
        <button onClick={handleLike} className="flex flex-col items-center gap-1">
          <div className={`p-2.5 rounded-full transition-all ${liked ? "like-btn-active" : "text-white"} ${heartAnim ? "animate-heart-pop" : ""}`}>
            <Icon name={liked ? "Heart" : "Heart"} size={28} className={liked ? "fill-current text-[hsl(var(--neon-pink))]" : ""} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(likesCount)}</span>
        </button>

        {/* Comments */}
        <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full text-white hover:scale-110 transition-transform">
            <Icon name="MessageCircle" size={28} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(video.comments)}</span>
        </button>

        {/* Share */}
        <button className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full text-white hover:scale-110 transition-transform">
            <Icon name="Share2" size={26} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(video.shares)}</span>
        </button>

        {/* Music disc */}
        <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden animate-spin-slow relative">
          <img src={video.user.avatar} alt="music" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-black/80" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-24 left-4 right-16 z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-rubik font-700 text-base">{video.user.name}</span>
          {video.user.verified && (
            <Icon name="BadgeCheck" size={16} className="text-[hsl(var(--neon-cyan))]" />
          )}
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-2 line-clamp-2">{video.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {video.hashtags.map((tag) => (
            <span key={tag} className="text-[hsl(var(--neon-cyan))] text-sm font-500 hover:underline cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5 w-fit">
          <Icon name="Music2" size={13} className="text-white/70 animate-float" />
          <span className="text-white/80 text-xs truncate max-w-[180px]">{video.music}</span>
        </div>
      </div>

      {/* View count */}
      <div className="absolute top-14 right-4 glass rounded-full px-2.5 py-1 z-10">
        <span className="text-white/80 text-xs">{video.views}</span>
      </div>

      {showComments && <CommentsDrawer video={video} onClose={() => setShowComments(false)} />}
    </div>
  );
}

export default function FeedPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / window.innerHeight);
      setActiveIdx(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={containerRef} className="video-snap h-screen w-full">
      {VIDEOS.map((v, i) => (
        <VideoCard key={v.id} video={v} isActive={i === activeIdx} />
      ))}
    </div>
  );
}
