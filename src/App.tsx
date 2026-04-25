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

  if (user === undefined) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
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
    return <AuthPage onAuth={setUser} />;
  }

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

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden font-golos">
      <div className="h-full">{renderPage()}</div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10">
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
                    className="w-13 h-13 rounded-2xl flex items-center justify-center transition-all"
                    style={{
                      width: 52,
                      height: 52,
                      background: "linear-gradient(135deg, hsl(350, 100%, 55%), hsl(180, 100%, 45%))",
                      boxShadow: isActive
                        ? "0 0 24px hsl(350, 100%, 55%, 0.8), 0 0 48px hsl(350, 100%, 55%, 0.3)"
                        : "0 4px 20px hsl(350, 100%, 55%, 0.5)",
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