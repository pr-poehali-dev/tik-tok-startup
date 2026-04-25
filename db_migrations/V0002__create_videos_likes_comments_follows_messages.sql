CREATE TABLE t_p17416507_tik_tok_startup.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    hashtags TEXT[] DEFAULT '{}',
    video_url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    music_title VARCHAR(200) DEFAULT 'Оригинальный звук',
    privacy VARCHAR(20) DEFAULT 'all',
    allow_comments BOOLEAN DEFAULT TRUE,
    allow_downloads BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p17416507_tik_tok_startup.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    video_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.videos(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

CREATE TABLE t_p17416507_tik_tok_startup.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    video_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.videos(id),
    text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p17416507_tik_tok_startup.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    following_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

CREATE TABLE t_p17416507_tik_tok_startup.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    receiver_id UUID NOT NULL REFERENCES t_p17416507_tik_tok_startup.users(id),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
