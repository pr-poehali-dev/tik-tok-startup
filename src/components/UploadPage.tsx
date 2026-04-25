import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [privacy, setPrivacy] = useState<"all" | "friends" | "private">("all");

  const privacyOptions = [
    { value: "all", label: "Все", icon: "Globe" },
    { value: "friends", label: "Друзья", icon: "Users" },
    { value: "private", label: "Только я", icon: "Lock" },
  ] as const;

  return (
    <div className="h-screen overflow-y-auto bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark px-4 py-4 flex items-center justify-between border-b border-white/10">
        <h1 className="font-rubik font-900 text-white text-lg">Новое видео</h1>
        <button
          className={`px-5 py-2 rounded-full text-sm font-700 transition-all ${
            uploaded && title
              ? "bg-[hsl(var(--neon-pink))] text-white animate-glow-pulse"
              : "glass text-white/40 cursor-not-allowed"
          }`}
        >
          Опубликовать
        </button>
      </div>

      <div className="px-4 pt-5 space-y-5">
        {/* Upload zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); setUploaded(true); }}
          onClick={() => setUploaded((p) => !p)}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center py-12 ${
            isDragging
              ? "border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink))/0.05]"
              : uploaded
              ? "border-[hsl(var(--neon-cyan))] bg-[hsl(var(--neon-cyan))/0.05]"
              : "border-white/20 hover:border-white/40 bg-white/2"
          }`}
        >
          {uploaded ? (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--neon-cyan))/0.2] flex items-center justify-center mb-3">
                <Icon name="CheckCircle2" size={32} className="text-[hsl(var(--neon-cyan))]" />
              </div>
              <p className="text-white font-700 text-base">Видео загружено!</p>
              <p className="text-white/50 text-sm mt-1">Нажмите чтобы изменить</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 animate-float">
                <Icon name="Upload" size={32} className="text-white/50" />
              </div>
              <p className="text-white font-700 text-base">Выберите видео</p>
              <p className="text-white/50 text-sm mt-1 text-center px-4">
                MP4, WebM · до 500 МБ · до 10 минут
              </p>
              <div className="mt-4 px-5 py-2.5 bg-[hsl(var(--neon-pink))] rounded-full text-white text-sm font-700">
                Загрузить файл
              </div>
            </>
          )}
        </div>

        {/* Cover preview */}
        {uploaded && (
          <div className="flex items-center gap-3 p-3 glass rounded-xl animate-fade-in">
            <div className="w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
              <img src="https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/dba0e4de-0d9e-45eb-aee9-c77b8b8b6900.jpg" className="w-full h-full object-cover" alt="cover" />
            </div>
            <div className="flex-1">
              <p className="text-white/60 text-xs mb-1.5">Обложка</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`w-10 h-14 rounded-md overflow-hidden border-2 cursor-pointer transition-all ${i === 0 ? "border-[hsl(var(--neon-pink))]" : "border-white/20"}`}>
                    <img src="https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/dba0e4de-0d9e-45eb-aee9-c77b8b8b6900.jpg" className="w-full h-full object-cover" style={{ objectPosition: `${i * 25}% center` }} alt="" />
                  </div>
                ))}
              </div>
            </div>
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

        {/* Privacy */}
        <div className="space-y-2">
          <label className="text-white/60 text-sm font-500">Кто видит</label>
          <div className="flex gap-2">
            {privacyOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPrivacy(opt.value)}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                  privacy === opt.value
                    ? "border-[hsl(var(--neon-pink))] bg-[hsl(var(--neon-pink))/0.1] text-white"
                    : "border-white/15 bg-white/5 text-white/50 hover:text-white/70"
                }`}
              >
                <Icon name={opt.icon} size={18} />
                <span className="text-xs font-500">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings row */}
        <div className="space-y-1">
          {[
            { icon: "MessageSquare", label: "Комментарии", on: true },
            { icon: "Share2", label: "Репосты", on: true },
            { icon: "Download", label: "Скачивание", on: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/8">
              <div className="flex items-center gap-3">
                <Icon name={item.icon as "MessageSquare"} size={18} className="text-white/50" />
                <span className="text-white/80 text-sm">{item.label}</span>
              </div>
              <div className={`w-10 h-5.5 rounded-full transition-all cursor-pointer relative ${item.on ? "bg-[hsl(var(--neon-pink))]" : "bg-white/20"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${item.on ? "left-5.5" : "left-0.5"}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
