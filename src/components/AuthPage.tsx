import { useState } from "react";
import Icon from "@/components/ui/icon";
import { register, login, type User } from "@/lib/auth";

interface AuthPageProps {
  onAuth: (user: User) => void;
}

export default function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    email: "",
    password: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const { user } = await register({
          username: form.username,
          email: form.email,
          password: form.password,
          display_name: form.display_name || form.username,
        });
        onAuth(user);
      } else {
        const { user } = await login({
          login: form.email,
          password: form.password,
        });
        onAuth(user);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
    setForm({ username: "", display_name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(350,100%,55%) 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(180,100%,50%) 0%, transparent 70%)" }}
        />
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: "linear-gradient(135deg, hsl(350,100%,55%), hsl(180,100%,45%))" }}
        >
          <Icon name="Play" size={28} className="text-white fill-white ml-1" />
        </div>
        <h1 className="font-rubik font-900 text-3xl text-white tracking-tight">ВспышкаВидео</h1>
        <p className="text-white/40 text-sm mt-1">Твоё видео — твой момент</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm glass rounded-3xl p-6 animate-scale-in">
        {/* Tabs */}
        <div className="flex glass rounded-xl p-1 mb-6">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-700 transition-all duration-200 ${
                mode === m
                  ? "bg-[hsl(350,100%,55%)] text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {m === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <>
              <div className="space-y-1">
                <label className="text-white/50 text-xs font-500">Имя для отображения</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[hsl(350,100%,55%)] transition-colors">
                  <Icon name="User" size={16} className="text-white/30 flex-shrink-0" />
                  <input
                    value={form.display_name}
                    onChange={set("display_name")}
                    placeholder="Как вас зовут?"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-white/50 text-xs font-500">Имя пользователя *</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[hsl(350,100%,55%)] transition-colors">
                  <span className="text-white/30 text-sm flex-shrink-0">@</span>
                  <input
                    value={form.username}
                    onChange={set("username")}
                    placeholder="username"
                    required
                    autoComplete="username"
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-white/50 text-xs font-500">
              {mode === "register" ? "Email *" : "Email или имя пользователя"}
            </label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[hsl(350,100%,55%)] transition-colors">
              <Icon name="Mail" size={16} className="text-white/30 flex-shrink-0" />
              <input
                type={mode === "register" ? "email" : "text"}
                value={form.email}
                onChange={set("email")}
                placeholder={mode === "register" ? "you@example.com" : "email или @username"}
                required
                autoComplete="email"
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-white/50 text-xs font-500">Пароль *</label>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-[hsl(350,100%,55%)] transition-colors">
              <Icon name="Lock" size={16} className="text-white/30 flex-shrink-0" />
              <input
                type="password"
                value={form.password}
                onChange={set("password")}
                placeholder={mode === "register" ? "Минимум 6 символов" : "Ваш пароль"}
                required
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 animate-fade-in">
              <Icon name="AlertCircle" size={15} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-rubik font-700 text-white text-base transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
            style={{
              background: loading
                ? "hsl(350,100%,45%)"
                : "linear-gradient(135deg, hsl(350,100%,55%), hsl(180,100%,45%))",
              boxShadow: "0 4px 20px hsl(350,100%,55%, 0.4)",
            }}
          >
            {loading ? (
              <>
                <Icon name="Loader2" size={18} className="animate-spin" />
                <span>{mode === "register" ? "Создаём аккаунт..." : "Входим..."}</span>
              </>
            ) : (
              <span>{mode === "register" ? "Создать аккаунт" : "Войти"}</span>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <p className="text-center text-white/30 text-sm mt-4">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}
          {" "}
          <button
            onClick={toggleMode}
            className="text-[hsl(350,100%,65%)] font-600 hover:text-[hsl(350,100%,75%)] transition-colors"
          >
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </p>
      </div>

      {/* Footer */}
      <p className="text-white/20 text-xs mt-6 text-center">
        Регистрируясь, вы соглашаетесь с условиями использования
      </p>
    </div>
  );
}
