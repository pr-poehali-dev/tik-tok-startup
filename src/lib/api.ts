import { getToken } from "./auth";

const VIDEOS_URL = "https://functions.poehali.dev/ad076832-f061-4346-9bbd-0078bb28e717";
const SOCIAL_URL = "https://functions.poehali.dev/1faac2ff-d1a8-4b3f-95b1-ccf319a2794a";

export interface VideoUser {
  id: string; username: string; display_name: string; avatar_url: string; is_verified: boolean;
}

export interface Video {
  id: string; user_id: string; title: string; description: string; hashtags: string[];
  video_url: string; thumbnail_url: string; duration: number;
  views_count: number; likes_count: number; comments_count: number; shares_count: number;
  music_title: string; privacy: string; created_at: string;
  user: VideoUser; is_liked: boolean;
}

export interface Comment {
  id: string; text: string; likes_count: number; created_at: string;
  user: { id: string; username: string; display_name: string; avatar_url: string };
}

export interface Chat {
  user_id: string; username: string; display_name: string; avatar_url: string;
  last_message: string; last_time: string; unread_count: number;
}

export interface Message {
  id: string; sender_id: string; receiver_id: string; text: string; is_read: boolean; created_at: string;
}

async function callVideos(body: object) {
  const token = getToken();
  const res = await fetch(VIDEOS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-Session-Token": token } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

async function callSocial(body: object) {
  const token = getToken();
  const res = await fetch(SOCIAL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-Session-Token": token } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ошибка сервера");
  return data;
}

// Videos
export const getFeed = (offset = 0): Promise<{ videos: Video[] }> =>
  callVideos({ action: "feed", offset, limit: 10 });

export const getTrending = (): Promise<{ videos: Video[] }> =>
  callVideos({ action: "trending" });

export const searchContent = (q: string): Promise<{ videos: Video[]; users: unknown[] }> =>
  callVideos({ action: "search", q });

export const getUserVideos = (user_id: string, offset = 0): Promise<{ videos: Video[] }> =>
  callVideos({ action: "user_videos", user_id, offset });

export const viewVideo = (video_id: string): Promise<void> =>
  callVideos({ action: "view", video_id });

export const uploadVideo = (params: {
  title: string; description: string; hashtags: string[];
  music_title: string; privacy: string;
  allow_comments: boolean; allow_downloads: boolean;
  video_data?: string; thumbnail_data?: string;
}): Promise<{ id: string; video_url: string; thumbnail_url: string }> =>
  callVideos({ action: "upload", ...params });

// Likes
export const likeVideo = (video_id: string): Promise<{ liked: boolean; likes_count: number }> =>
  callSocial({ action: "like", video_id });

export const unlikeVideo = (video_id: string): Promise<{ liked: boolean; likes_count: number }> =>
  callSocial({ action: "unlike", video_id });

// Comments
export const getComments = (video_id: string, offset = 0): Promise<{ comments: Comment[] }> =>
  callSocial({ action: "get_comments", video_id, offset });

export const addComment = (video_id: string, text: string): Promise<{ comment: Comment }> =>
  callSocial({ action: "add_comment", video_id, text });

// Follows
export const followUser = (user_id: string): Promise<{ following: boolean; followers_count: number }> =>
  callSocial({ action: "follow", user_id });

export const unfollowUser = (user_id: string): Promise<{ following: boolean; followers_count: number }> =>
  callSocial({ action: "unfollow", user_id });

// Messages
export const getChats = (): Promise<{ chats: Chat[] }> =>
  callSocial({ action: "get_chats" });

export const getMessages = (user_id: string, offset = 0): Promise<{ messages: Message[] }> =>
  callSocial({ action: "get_messages", user_id, offset });

export const sendMessage = (receiver_id: string, text: string): Promise<{ message: Message }> =>
  callSocial({ action: "send_message", receiver_id, text });

// User profile
export const getUserProfile = (username?: string, user_id?: string) =>
  callSocial({ action: "get_user", username, user_id });
