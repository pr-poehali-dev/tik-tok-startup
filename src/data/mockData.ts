export interface Video {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  thumbnail: string;
  description: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  views: string;
  music: string;
  duration: string;
  isLiked: boolean;
  isFollowing: boolean;
}

export interface Comment {
  id: string;
  user: { name: string; username: string; avatar: string };
  text: string;
  likes: number;
  time: string;
}

export interface Message {
  id: string;
  user: { name: string; username: string; avatar: string; online: boolean };
  lastMessage: string;
  time: string;
  unread: number;
}

export const VIDEOS: Video[] = [
  {
    id: "1",
    user: {
      id: "u1",
      name: "Алекс Диджей",
      username: "@alexdj",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex&backgroundColor=b6e3f4",
      verified: true,
      followers: 1200000,
    },
    thumbnail: "https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/dba0e4de-0d9e-45eb-aee9-c77b8b8b6900.jpg",
    description: "Когда музыка захватывает тебя целиком 🔥 Ночной танцпол зажигает!",
    hashtags: ["#танцы", "#музыка", "#ночь", "#fyp"],
    likes: 284000,
    comments: 3420,
    shares: 12800,
    views: "4.2М",
    music: "Нойз МС — Улицы",
    duration: "0:28",
    isLiked: false,
    isFollowing: false,
  },
  {
    id: "2",
    user: {
      id: "u2",
      name: "Кулинар Маша",
      username: "@mashaFood",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=masha&backgroundColor=ffdfbf",
      verified: false,
      followers: 340000,
    },
    thumbnail: "https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/691b0e72-3ecb-4a0e-89b1-9ff598b3e42e.jpg",
    description: "Паста карбонара за 15 минут — проще не бывает! Сохраняй рецепт 🍝",
    hashtags: ["#еда", "#кулинария", "#рецепт", "#вкусно"],
    likes: 96700,
    comments: 1890,
    shares: 44300,
    views: "1.8М",
    music: "Оригинальный звук",
    duration: "0:45",
    isLiked: true,
    isFollowing: true,
  },
  {
    id: "3",
    user: {
      id: "u3",
      name: "Сноуборд Дима",
      username: "@dimaRides",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=dima&backgroundColor=c0aede",
      verified: true,
      followers: 2100000,
    },
    thumbnail: "https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/f3c1aebb-6052-4833-baf2-cde45b2d42c3.jpg",
    description: "Первый прыжок с горы в этом сезоне! Адреналин зашкаливает ⛷️❄️",
    hashtags: ["#сноуборд", "#горы", "#спорт", "#экстрим"],
    likes: 512000,
    comments: 7830,
    shares: 23100,
    views: "9.1М",
    music: "Imagine Dragons — Believer",
    duration: "0:32",
    isLiked: false,
    isFollowing: false,
  },
  {
    id: "4",
    user: {
      id: "u4",
      name: "КотоМания",
      username: "@cats_world",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=cats&backgroundColor=d1d4f9",
      verified: false,
      followers: 780000,
    },
    thumbnail: "https://cdn.poehali.dev/projects/30b8c93b-e042-4a7e-aeba-41cf25197819/files/b013fc4d-df0e-4504-8f46-4d3e3e41a20a.jpg",
    description: "Мурзик решил стать ниткой 😂🐈 Кто узнал своего кота?",
    hashtags: ["#кот", "#животные", "#смешно", "#котики"],
    likes: 1340000,
    comments: 21400,
    shares: 89200,
    views: "22М",
    music: "Звуки природы",
    duration: "0:18",
    isLiked: false,
    isFollowing: false,
  },
];

export const COMMENTS: Comment[] = [
  { id: "c1", user: { name: "Катя", username: "@katya99", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=katya" }, text: "Это просто огонь! 🔥🔥🔥", likes: 234, time: "2ч" },
  { id: "c2", user: { name: "Вася Пупкин", username: "@vася", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=vasya" }, text: "Где это снято? Хочу туда!", likes: 87, time: "4ч" },
  { id: "c3", user: { name: "Марина", username: "@marina_life", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=marina" }, text: "Уже поставил на репит 😍", likes: 45, time: "6ч" },
  { id: "c4", user: { name: "Серёжа", username: "@seryozha", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=sergey" }, text: "Давно искал такое видео, спасибо!", likes: 23, time: "1д" },
  { id: "c5", user: { name: "Лена Романова", username: "@lena_r", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=lena" }, text: "Так вдохновляет! Надо попробовать самой 💪", likes: 156, time: "1д" },
];

export const MESSAGES: Message[] = [
  { id: "m1", user: { name: "Алекс Диджей", username: "@alexdj", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=alex&backgroundColor=b6e3f4", online: true }, lastMessage: "Спасибо за поддержку! 🙏", time: "сейчас", unread: 2 },
  { id: "m2", user: { name: "Кулинар Маша", username: "@mashaFood", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=masha&backgroundColor=ffdfbf", online: false }, lastMessage: "Попробуй этот рецепт!", time: "10 мин", unread: 0 },
  { id: "m3", user: { name: "КотоМания", username: "@cats_world", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=cats&backgroundColor=d1d4f9", online: true }, lastMessage: "Мурзик снова отличился 😂", time: "1ч", unread: 5 },
  { id: "m4", user: { name: "Сноуборд Дима", username: "@dimaRides", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=dima&backgroundColor=c0aede", online: false }, lastMessage: "Сезон открыт! Едем?", time: "вчера", unread: 0 },
];

export const HASHTAG_TRENDS = [
  { tag: "#fyp", count: "128М видео" },
  { tag: "#танцы", count: "45М видео" },
  { tag: "#кулинария", count: "38М видео" },
  { tag: "#спорт", count: "29М видео" },
  { tag: "#животные", count: "67М видео" },
  { tag: "#музыка", count: "92М видео" },
];
