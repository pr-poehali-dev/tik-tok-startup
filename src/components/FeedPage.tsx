import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { getFeed, likeVideo, unlikeVideo, getComments, addComment, followUser, unfollowUser, viewVideo, type Video, type Comment } from "@/lib/api";

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "М";
  if (n >= 1000) return (n / 1000).toFixed(0) + "К";
  return String(n);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m}м`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ч`;
  return `${Math.floor(h / 24)}д`;
}

interface CommentsDrawerProps {
  video: Video;
  onClose: () => void;
  onCommentAdded: () => void;
}

function CommentsDrawer({ video, onClose, onCommentAdded }: CommentsDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    getComments(video.id).then((d) => {
      setComments(d.comments);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [video.id]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const { comment } = await addComment(video.id, text.trim());
      setComments((p) => [comment, ...p]);
      setText("");
      onCommentAdded();
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="w-full max-h-[75vh] glass-dark rounded-t-3xl flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="font-rubik font-700 text-white text-base">Комментарии · {formatNumber(video.comments_count)}</span>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {loading && <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}
          {!loading && comments.length === 0 && (
            <div className="text-center py-10 text-white/30">
              <Icon name="MessageCircle" size={32} className="mx-auto mb-2" />
              <p className="text-sm">Будьте первым, кто оставит комментарий</p>
            </div>
          )}
          {comments.map((c, i) => (
            <div key={c.id} className="flex gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.04}s`, opacity: 0, animationFillMode: "forwards" }}>
              <img src={c.user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${c.user.username}`} alt="" className="w-9 h-9 rounded-full flex-shrink-0 bg-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-600 text-sm">{c.user.display_name || c.user.username}</span>
                  <span className="text-white/40 text-xs">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-white/80 text-sm mt-0.5">{c.text}</p>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Heart" size={14} className="text-white/40" />
                <span className="text-white/40 text-xs">{c.likes_count}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 glass rounded-full px-4 py-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Добавить комментарий..."
              className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
            />
            {text && (
              <button onClick={handleSend} disabled={sending} className="text-[hsl(var(--neon-pink))] font-600 text-sm disabled:opacity-50">
                {sending ? "..." : "Отправить"}
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
  onVideoEnd: () => void;
}

function VideoCard({ video, isActive, onVideoEnd }: VideoCardProps) {
  const [liked, setLiked] = useState(video.is_liked);
  const [following, setFollowing] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes_count);
  const [commentsCount, setCommentsCount] = useState(video.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [bigHeart, setBigHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewedRef = useRef(false);
  const lastTapRef = useRef(0);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.play().catch(() => {});
      if (!viewedRef.current) {
        viewedRef.current = true;
        setTimeout(() => viewVideo(video.id).catch(() => {}), 2000);
      }
    } else {
      videoRef.current.pause();
    }
  }, [isActive, video.id]);

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikesCount((c) => wasLiked ? c - 1 : c + 1);
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 400);
    try {
      const res = wasLiked ? await unlikeVideo(video.id) : await likeVideo(video.id);
      setLikesCount(res.likes_count);
      setLiked(res.liked);
    } catch {
      setLiked(wasLiked);
      setLikesCount((c) => wasLiked ? c + 1 : c - 1);
    }
  };

  const handleFollow = async () => {
    const wasFollowing = following;
    setFollowing(!wasFollowing);
    try {
      if (wasFollowing) { await unfollowUser(video.user.id); } else { await followUser(video.user.id); }
    } catch {
      setFollowing(wasFollowing);
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!liked) {
        handleLike();
        setBigHeart(true);
        setTimeout(() => setBigHeart(false), 800);
      }
    }
    lastTapRef.current = now;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: video.title, text: video.description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  return (
    <div className="video-snap-item relative w-full h-full flex-shrink-0 bg-black overflow-hidden" onClick={handleDoubleTap}>
      {/* Video or thumbnail */}
      {video.video_url ? (
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          muted
          playsInline
          onEnded={onVideoEnd}
        />
      ) : (
        <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Gradient */}
      <div className="absolute inset-0 gradient-overlay pointer-events-none" />

      {/* Big heart on double tap */}
      {bigHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <Icon name="Heart" size={100} className="text-white fill-white opacity-90 animate-heart-pop drop-shadow-2xl" />
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-4 z-10 pointer-events-none" style={{ paddingTop: 12 }}>
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="glass rounded-full px-3 py-1">
            <span className="text-white/90 text-xs font-golos">Для вас</span>
          </div>
          <div className="glass rounded-full px-3 py-1">
            <span className="text-white/50 text-xs font-golos">Подписки</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <div className="relative">
          <img
            src={video.user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${video.user.username}`}
            alt={video.user.display_name}
            className="w-12 h-12 rounded-full border-2 border-white object-cover bg-white/10"
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleFollow(); }}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all ${following ? "bg-white" : "bg-[hsl(var(--neon-pink))]"}`}
          >
            <Icon name={following ? "Check" : "Plus"} size={11} className={following ? "text-black" : "text-white"} />
          </button>
        </div>

        <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1">
          <div className={`p-2.5 rounded-full transition-all ${heartAnim ? "animate-heart-pop" : ""}`}>
            <Icon name="Heart" size={28} className={liked ? "fill-[hsl(var(--neon-pink))] text-[hsl(var(--neon-pink))]" : "text-white"} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(likesCount)}</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); setShowComments(true); }} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full text-white hover:scale-110 transition-transform">
            <Icon name="MessageCircle" size={28} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(commentsCount)}</span>
        </button>

        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center gap-1">
          <div className="p-2.5 rounded-full text-white hover:scale-110 transition-transform">
            <Icon name="Share2" size={26} />
          </div>
          <span className="text-white text-xs font-500">{formatNumber(video.shares_count)}</span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden animate-spin-slow relative">
          <img src={video.user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${video.user.username}`} alt="music" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-black/80" />
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-20 left-4 right-16 z-10 pointer-events-none">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-rubik font-700 text-base">{video.user.display_name || video.user.username}</span>
          {video.user.is_verified && <Icon name="BadgeCheck" size={16} className="text-[hsl(var(--neon-cyan))]" />}
        </div>
        <p className="text-white/90 text-sm leading-relaxed mb-2 line-clamp-2">{video.description || video.title}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(video.hashtags || []).map((tag) => (
            <span key={tag} className="text-[hsl(var(--neon-cyan))] text-sm font-500">{tag.startsWith("#") ? tag : "#" + tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5 w-fit">
          <Icon name="Music2" size={13} className="text-white/70 animate-float" />
          <span className="text-white/80 text-xs truncate max-w-[180px]">{video.music_title}</span>
        </div>
      </div>

      {/* Views */}
      <div className="absolute top-3 right-4 glass rounded-full px-2.5 py-1 z-10">
        <span className="text-white/80 text-xs">{formatNumber(video.views_count)}</span>
      </div>

      {showComments && (
        <CommentsDrawer
          video={video}
          onClose={() => setShowComments(false)}
          onCommentAdded={() => setCommentsCount((c) => c + 1)}
        />
      )}
    </div>
  );
}

// Skeleton placeholder for loading
function VideoSkeleton() {
  return (
    <div className="video-snap-item relative w-full h-full bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/20">
        <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse flex items-center justify-center">
          <Icon name="Play" size={32} className="text-white/20 fill-current ml-1" />
        </div>
        <p className="text-sm">Загрузка видео...</p>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const loadFeed = useCallback(async (offset = 0) => {
    try {
      const { videos: newVideos } = await getFeed(offset);
      if (offset === 0) {
        setVideos(newVideos);
      } else {
        setVideos((p) => [...p, ...newVideos]);
      }
      offsetRef.current = offset + newVideos.length;
    } catch {
      // silent
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(0);
  }, [loadFeed]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollTop / el.clientHeight);
      setActiveIdx(idx);
      // Load more when near end
      if (idx >= videos.length - 3 && !loadingMore && videos.length > 0) {
        setLoadingMore(true);
        loadFeed(offsetRef.current);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [videos.length, loadingMore, loadFeed]);

  if (loading) {
    return (
      <div className="video-snap h-full w-full">
        <VideoSkeleton />
      </div>
    );
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/30 gap-4">
        <Icon name="Video" size={56} />
        <div className="text-center">
          <p className="font-rubik font-700 text-lg text-white/50">Пока нет видео</p>
          <p className="text-sm mt-1">Загрузи первое видео!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="video-snap h-full w-full">
      {videos.map((v, i) => (
        <VideoCard
          key={v.id}
          video={v}
          isActive={i === activeIdx}
          onVideoEnd={() => {
            const el = containerRef.current;
            if (el) el.scrollTo({ top: (i + 1) * el.clientHeight, behavior: "smooth" });
          }}
        />
      ))}
      {loadingMore && (
        <div className="video-snap-item relative w-full h-full bg-black flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}