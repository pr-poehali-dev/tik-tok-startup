import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Icon from "@/components/ui/icon";
import FeedPage from "@/components/FeedPage";
import SearchPage from "@/components/SearchPage";
import UploadPage from "@/components/UploadPage";
import ChatPage from "@/components/ChatPage";
import ProfilePage from "@/components/ProfilePage";
import AuthPage from "@/components/AuthPage";
import { getMe, logout, type User } from "@/lib/auth";
import "./App.css";

const queryClient = new QueryClient();

type Tab = "feed" | "search" | "upload" | "chat" | "profile";

function MainApp() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>("feed");

  useEffect(() => {
    getMe()
      .then((u) => setUser(u))
      .catch(() => setUser(null));
  }, []);

  const tabs = [
    { id: "feed" as Tab, icon: "Home", label: "Лента" },
    { id: "search" as Tab, icon: "Search", label: "Поиск" },
    { id: "upload" as Tab, icon: "Plus", label: "" },
    { id: "chat" as Tab, icon: "MessageCircle", label: "Чат" },
    { id: "profile" as Tab, icon: "User", label: "Профиль" },
  ];

  const renderPage = () => {
    switch (tab) {
      case "feed": return <FeedPage />;
      case "search": return <SearchPage />;
      case "upload": return <UploadPage />;
      case "chat": return <ChatPage />;
      case "profile": return <ProfilePage user={user} onLogout={() => { logout(); setUser(null); }} />;
    }
  };

  const phoneContent = (
    <div className="relative w-full h-full overflow-hidden font-golos bg-background">
      <div className="h-full">{renderPage()}</div>

      {/* Bottom navigation */}
      <nav className="absolute bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10">
        <div className="flex items-center justify-around px-2 pt-2 pb-4">
          {tabs.map((t) => {
            const isUpload = t.id === "upload";
            const isActive = tab === t.id;

            if (isUpload) {
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex flex-col items-center -mt-5"
                >
                  <div
                    className="rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, hsl(350,100%,55%), hsl(180,100%,45%))",
                      boxShadow: isActive
                        ? "0 0 24px hsl(350,100%,55%, 0.8)"
                        : "0 4px 20px hsl(350,100%,55%, 0.5)",
                    }}
                  >
                    <Icon name="Plus" size={26} className="text-white" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className="flex flex-col items-center gap-1 py-1 px-3 transition-all duration-200"
              >
                <div className={`relative transition-all duration-200 ${isActive ? "scale-110" : ""}`}>
                  <Icon
                    name={t.icon as "Home"}
                    size={24}
                    className={`transition-all duration-200 ${isActive ? "text-[hsl(350,100%,55%)]" : "text-white/45"}`}
                  />
                  {t.id === "chat" && (
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[hsl(350,100%,55%)] rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] font-semibold transition-all duration-200 ${isActive ? "text-[hsl(350,100%,55%)]" : "text-white/30"}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );

  if (user === undefined) {
    return (
      <div className="h-screen bg-[#111] flex flex-col items-center justify-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, hsl(350,100%,55%), hsl(180,100%,45%))" }}
        >
          <Icon name="Play" size={28} className="text-white fill-white ml-1" />
        </div>
        <div className="w-6 h-6 border-2 border-white/20 border-t-[hsl(350,100%,55%)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0a14 0%, #0a0a0a 70%)" }}
      >
        <div
          className="w-full overflow-hidden rounded-3xl shadow-2xl"
          style={{
            maxWidth: 420,
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          <AuthPage onAuth={setUser} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0a14 0%, #0a0a0a 70%)" }}
    >
      {/* Phone frame */}
      <div
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl"
        style={{
          width: 390,
          height: 844,
          maxHeight: "calc(100vh - 48px)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.07), inset 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {phoneContent}
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MainApp />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;