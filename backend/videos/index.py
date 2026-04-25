"""
Управление видео: лента, загрузка на S3, удаление, просмотры, поиск.
action: feed | upload | delete | view | search | user_videos | trending
"""
import os, json, base64, uuid, boto3, psycopg2
from datetime import datetime

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p17416507_tik_tok_startup")
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def ok(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}

def err(msg, status=400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}

def get_user(token, cur):
    if not token:
        return None
    cur.execute(f"SELECT id, username, display_name, avatar_url, is_verified FROM {SCHEMA}.users WHERE session_token = %s", (token,))
    return cur.fetchone()

def video_row_to_dict(row, liked=False):
    return {
        "id": str(row[0]), "user_id": str(row[1]),
        "title": row[2], "description": row[3], "hashtags": row[4] or [],
        "video_url": row[5], "thumbnail_url": row[6], "duration": row[7],
        "views_count": row[8], "likes_count": row[9], "comments_count": row[10],
        "shares_count": row[11], "music_title": row[12], "privacy": row[13],
        "created_at": str(row[14]),
        "user": {"id": str(row[15]), "username": row[16], "display_name": row[17], "avatar_url": row[18] or "", "is_verified": row[19]},
        "is_liked": liked,
    }

VIDEO_SELECT = f"""
    SELECT v.id, v.user_id, v.title, v.description, v.hashtags,
           v.video_url, v.thumbnail_url, v.duration,
           v.views_count, v.likes_count, v.comments_count, v.shares_count,
           v.music_title, v.privacy, v.created_at,
           u.id, u.username, u.display_name, u.avatar_url, u.is_verified
    FROM {SCHEMA}.videos v
    JOIN {SCHEMA}.users u ON u.id = v.user_id
"""

def handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action", "")
    token = (event.get("headers") or {}).get("X-Session-Token") or \
            (event.get("headers") or {}).get("x-session-token") or body.get("token", "")

    # -------- ЛЕНТА (рекомендации) --------
    if action == "feed":
        offset = int(body.get("offset", 0))
        limit = min(int(body.get("limit", 10)), 20)
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        uid = user[0] if user else None

        cur.execute(VIDEO_SELECT + f" WHERE v.privacy = 'all' ORDER BY v.created_at DESC LIMIT %s OFFSET %s", (limit, offset))
        rows = cur.fetchall()

        liked_ids = set()
        if uid and rows:
            ids = [str(r[0]) for r in rows]
            placeholders = ",".join(["%s"] * len(ids))
            cur.execute(f"SELECT video_id FROM {SCHEMA}.likes WHERE user_id = %s AND video_id IN ({placeholders})", [uid] + ids)
            liked_ids = {str(r[0]) for r in cur.fetchall()}

        cur.close(); conn.close()
        return ok({"videos": [video_row_to_dict(r, str(r[0]) in liked_ids) for r in rows]})

    # -------- ЗАГРУЗКА ВИДЕО --------
    if action == "upload":
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]

        title = (body.get("title") or "").strip()
        description = body.get("description", "")
        hashtags = body.get("hashtags", [])
        music_title = body.get("music_title", "Оригинальный звук")
        privacy = body.get("privacy", "all")
        allow_comments = body.get("allow_comments", True)
        allow_downloads = body.get("allow_downloads", False)
        video_b64 = body.get("video_data", "")
        thumbnail_b64 = body.get("thumbnail_data", "")

        if not title:
            cur.close(); conn.close()
            return err("Укажите название видео")

        s3 = boto3.client("s3",
            endpoint_url="https://bucket.poehali.dev",
            aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"]
        )
        aws_key = os.environ["AWS_ACCESS_KEY_ID"]

        video_url = ""
        thumbnail_url = ""

        if video_b64:
            vid_data = base64.b64decode(video_b64)
            vid_key = f"videos/{uid}/{uuid.uuid4()}.mp4"
            s3.put_object(Bucket="files", Key=vid_key, Body=vid_data, ContentType="video/mp4")
            video_url = f"https://cdn.poehali.dev/projects/{aws_key}/files/{vid_key}"

        if thumbnail_b64:
            thumb_data = base64.b64decode(thumbnail_b64)
            thumb_key = f"thumbnails/{uid}/{uuid.uuid4()}.jpg"
            s3.put_object(Bucket="files", Key=thumb_key, Body=thumb_data, ContentType="image/jpeg")
            thumbnail_url = f"https://cdn.poehali.dev/projects/{aws_key}/files/{thumb_key}"

        if isinstance(hashtags, str):
            hashtags = [h.strip() for h in hashtags.replace(",", " ").split() if h.strip()]

        cur.execute(
            f"INSERT INTO {SCHEMA}.videos (user_id, title, description, hashtags, video_url, thumbnail_url, music_title, privacy, allow_comments, allow_downloads) "
            f"VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
            (uid, title, description, hashtags, video_url, thumbnail_url, music_title, privacy, allow_comments, allow_downloads)
        )
        vid_id = cur.fetchone()[0]
        conn.commit(); cur.close(); conn.close()
        return ok({"id": str(vid_id), "video_url": video_url, "thumbnail_url": thumbnail_url}, 201)

    # -------- ПРОСМОТР --------
    if action == "view":
        video_id = body.get("video_id", "")
        if not video_id:
            return err("video_id обязателен")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        uid = user[0] if user else None
        cur.execute(f"UPDATE {SCHEMA}.videos SET views_count = views_count + 1 WHERE id = %s", (video_id,))
        conn.commit(); cur.close(); conn.close()
        return ok({"ok": True})

    # -------- ПОИСК --------
    if action == "search":
        q = body.get("q", "").strip()
        if not q:
            return ok({"videos": [], "users": []})
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        uid = user[0] if user else None

        like_q = f"%{q}%"
        cur.execute(VIDEO_SELECT + f" WHERE v.privacy = 'all' AND (v.title ILIKE %s OR v.description ILIKE %s OR %s = ANY(v.hashtags)) ORDER BY v.views_count DESC LIMIT 20",
                    (like_q, like_q, q))
        rows = cur.fetchall()

        cur.execute(f"SELECT id, username, display_name, avatar_url, followers_count, is_verified FROM {SCHEMA}.users WHERE username ILIKE %s OR display_name ILIKE %s LIMIT 10",
                    (like_q, like_q))
        users = [{"id": str(r[0]), "username": r[1], "display_name": r[2], "avatar_url": r[3] or "", "followers_count": r[4], "is_verified": r[5]} for r in cur.fetchall()]

        liked_ids = set()
        if uid and rows:
            ids = [str(r[0]) for r in rows]
            placeholders = ",".join(["%s"] * len(ids))
            cur.execute(f"SELECT video_id FROM {SCHEMA}.likes WHERE user_id = %s AND video_id IN ({placeholders})", [uid] + ids)
            liked_ids = {str(r[0]) for r in cur.fetchall()}

        cur.close(); conn.close()
        return ok({"videos": [video_row_to_dict(r, str(r[0]) in liked_ids) for r in rows], "users": users})

    # -------- ВИДЕО ПОЛЬЗОВАТЕЛЯ --------
    if action == "user_videos":
        target_uid = body.get("user_id", "")
        offset = int(body.get("offset", 0))
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        uid = user[0] if user else None
        is_own = uid and str(uid) == target_uid
        privacy_filter = "" if is_own else "AND v.privacy = 'all'"
        cur.execute(VIDEO_SELECT + f" WHERE v.user_id = %s {privacy_filter} ORDER BY v.created_at DESC LIMIT 12 OFFSET %s", (target_uid, offset))
        rows = cur.fetchall()
        cur.close(); conn.close()
        return ok({"videos": [video_row_to_dict(r) for r in rows]})

    # -------- ТРЕНДЫ --------
    if action == "trending":
        conn = get_conn(); cur = conn.cursor()
        cur.execute(VIDEO_SELECT + f" WHERE v.privacy = 'all' AND v.created_at > NOW() - INTERVAL '7 days' ORDER BY v.likes_count + v.views_count / 10 DESC LIMIT 20")
        rows = cur.fetchall()
        cur.close(); conn.close()
        return ok({"videos": [video_row_to_dict(r) for r in rows]})

    return err("Неизвестный action", 400)
