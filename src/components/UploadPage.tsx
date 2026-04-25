import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";
import { uploadVideo } from "@/lib/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [music, setMusic] = useState("");
  const [privacy, setPrivacy] = useState<"all" | "friends" | "private">("all");
  const [allowComments, setAllowComments] = useState(true);
  const [allowDownloads, setAllowDownloads] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const privacyOptions = [
    { value: "all" as const, label: "Все", icon: "Globe" },
    { value: "friends" as const, label: "Друзья", icon: "Users" },
    { value: "private" as const, label: "Только я", icon: "Lock" },
  ];

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Выберите видео файл");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      setError("Файл слишком большой (максимум 500 МБ)");
      return;
    }
    setError("");
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handlePublish = async () => {
    if (!title.trim()) { setError("Укажите название видео"); return; }
    if (!videoFile) { setError("Выберите видео файл"); return; }
    setError("");
    setUploading(true);
    setProgress(10);

    try {
      const hashtagList = hashtags.trim()
        ? hashtags.trim().split(/[\s,]+/).filter(Boolean).map((h) => h.startsWith("#") ? h : "#" + h)
        : [];

      setProgress(30);
      const videoData = await fileToBase64(videoFile);
      setProgress(60);

      await uploadVideo({
        title: title.trim(),
        description: desc.trim(),
        hashtags: hashtagList,
        music_title: music.trim() || "Оригинальный звук",
        privacy,
        allow_comments: allowComments,
        allow_downloads: allowDownloads,
        video_data: videoData,
      });

      setProgress(100);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setVideoFile(null);
        setVideoPreview("");
        setTitle("");
        setDesc("");
        setHashtags("");
        setMusic("");
        setPrivacy("all");
        setProgress(0);
      }, 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 bg-background animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-[hsl(180,100%,45%)/0.15] flex items-center justify-center animate-glow-pulse">
          <Icon name="CheckCircle2" size={48} className="text-[hsl(var(--neon-cyan))]" />
        </div>
        <h2 className="font-rubik font-900 text-2xl text-white">Видео опубликовано!</h2>
        <p className="text-white/50 text-sm">Оно уже появится в ленте</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 flex items-center justify-between border-b border-white/10">
        <h1 className="font-rubik font-900 text-white text-lg">Новое видео</h1>
        <button
          onClick={handlePublish}
          disabled={uploading || !videoFile || !title.trim()}
          className={`px-5 py-2 rounded-full text-sm font-700 transition-all flex items-center gap-2 ${videoFile && title.trim() && !uploading ? "bg-[hsl(var(--neon-pink))] text-white" : "glass text-white/40 cursor-not-allowed"}`}
        >
          {uploading ? <><Icon name="Loader2" size={15} className="animate-spin" /> Загрузка...</> : "Опубликовать"}
        </button>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="px-4 pt-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/70 text-sm">Загрузка видео...</span>
              <span className="text-white/70 text-sm">{progress}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, hsl(var(--neon-pink)), hsl(var(--neon-cyan)))" }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="px-4 pt-5 space-y-5">
        {/* Upload zone */}
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

        {!videoPreview ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-12 ${isDragging ? "border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink))/0.05]" : "border-white/20 hover:border-white/40 bg-white/2"}`}
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 animate-float">
              <Icon name="Upload" size={32} className="text-white/50" />
            </div>
            <p className="text-white font-700 text-base">Выберите видео</p>
            <p className="text-white/50 text-sm mt-1 text-center px-4">MP4, WebM, MOV · до 500 МБ</p>
            <div className="mt-4 px-5 py-2.5 bg-[hsl(var(--neon-pink))] rounded-full text-white text-sm font-700">
              Загрузить файл
            </div>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-64 flex items-center">
            <video src={videoPreview} className="w-full h-full object-contain" controls />
            <button
              onClick={() => { setVideoFile(null); setVideoPreview(""); }}
              className="absolute top-2 right-2 glass rounded-full p-1.5"
            >
              <Icon name="X" size={16} className="text-white" />
            </button>
            <div className="absolute bottom-2 left-2 glass rounded-full px-2 py-1 flex items-center gap-1">
              <Icon name="CheckCircle2" size={12} className="text-[hsl(var(--neon-cyan))]" />
              <span className="text-white text-xs">{videoFile?.name}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 animate-fade-in">
            <Icon name="AlertCircle" size={15} className="text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-sm font-500">Название *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Придумайте цепляющий заголовок..."
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[hsl(var(--neon-pink))] transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-sm font-500">Описание</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Расскажите о вашем видео..."
            rows={3}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[hsl(var(--neon-pink))] transition-colors placeholder:text-white/30 resize-none"
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-sm font-500">Хэштеги</label>
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#танцы #музыка #fyp"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[hsl(var(--neon-cyan))] transition-colors placeholder:text-white/30"
          />
        </div>

        {/* Music */}
        <div className="space-y-1.5">
          <label className="text-white/60 text-sm font-500">Музыка</label>
          <div className="relative">
            <Icon name="Music2" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={music}
              onChange={(e) => setMusic(e.target.value)}
              placeholder="Исполнитель — Название трека"
              className="w-full bg-white/5 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[hsl(var(--neon-pink))] transition-colors placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Privacy */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm font-500">Кто видит</label>
          <div className="flex gap-2">
            {privacyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPrivacy(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${privacy === opt.value ? "border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink))/0.1] text-white" : "border-white/15 bg-white/5 text-white/50 hover:text-white/70"}`}
              >
                <Icon name={opt.icon as "Globe"} size={18} />
                <span className="text-xs font-500">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-1">
          {[
            { label: "Комментарии", value: allowComments, set: setAllowComments, icon: "MessageSquare" },
            { label: "Скачивание", value: allowDownloads, set: setAllowDownloads, icon: "Download" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/8">
              <div className="flex items-center gap-3">
                <Icon name={item.icon as "MessageSquare"} size={18} className="text-white/50" />
                <span className="text-white/80 text-sm">{item.label}</span>
              </div>
              <button
                onClick={() => item.set(!item.value)}
                className={`w-10 h-6 rounded-full transition-all relative ${item.value ? "bg-[hsl(var(--neon-pink))]" : "bg-white/20"}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${item.value ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
