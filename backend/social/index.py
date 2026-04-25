"""
Социальные функции: лайки, комментарии, подписки, сообщения.
action: like | unlike | get_likes | add_comment | get_comments | follow | unfollow | get_followers | send_message | get_messages | get_chats
"""
import os, json, psycopg2

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
    cur.execute(f"SELECT id, username, display_name, avatar_url FROM {SCHEMA}.users WHERE session_token = %s", (token,))
    return cur.fetchone()

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

    # ===== ЛАЙКИ =====
    if action in ("like", "unlike"):
        video_id = body.get("video_id", "")
        if not video_id:
            return err("video_id обязателен")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]

        if action == "like":
            try:
                cur.execute(f"INSERT INTO {SCHEMA}.likes (user_id, video_id) VALUES (%s, %s)", (uid, video_id))
                cur.execute(f"UPDATE {SCHEMA}.videos SET likes_count = likes_count + 1 WHERE id = %s", (video_id,))
                cur.execute(f"UPDATE {SCHEMA}.users SET likes_count = likes_count + 1 WHERE id = (SELECT user_id FROM {SCHEMA}.videos WHERE id = %s)", (video_id,))
                conn.commit()
                liked = True
            except psycopg2.errors.UniqueViolation:
                conn.rollback()
                liked = True
        else:
            cur.execute(f"DELETE FROM {SCHEMA}.likes WHERE user_id = %s AND video_id = %s", (uid, video_id))
            if cur.rowcount > 0:
                cur.execute(f"UPDATE {SCHEMA}.videos SET likes_count = GREATEST(0, likes_count - 1) WHERE id = %s", (video_id,))
                cur.execute(f"UPDATE {SCHEMA}.users SET likes_count = GREATEST(0, likes_count - 1) WHERE id = (SELECT user_id FROM {SCHEMA}.videos WHERE id = %s)", (video_id,))
            conn.commit()
            liked = False

        cur.execute(f"SELECT likes_count FROM {SCHEMA}.videos WHERE id = %s", (video_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        return ok({"liked": liked, "likes_count": row[0] if row else 0})

    # ===== КОММЕНТАРИИ =====
    if action == "add_comment":
        video_id = body.get("video_id", "")
        text = (body.get("text") or "").strip()
        if not video_id or not text:
            return err("video_id и text обязательны")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]

        cur.execute(
            f"INSERT INTO {SCHEMA}.comments (user_id, video_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (uid, video_id, text)
        )
        cid, created_at = cur.fetchone()
        cur.execute(f"UPDATE {SCHEMA}.videos SET comments_count = comments_count + 1 WHERE id = %s", (video_id,))
        conn.commit(); cur.close(); conn.close()

        return ok({
            "comment": {
                "id": str(cid),
                "text": text,
                "created_at": str(created_at),
                "likes_count": 0,
                "user": {"id": str(user[0]), "username": user[1], "display_name": user[2], "avatar_url": user[3] or ""},
            }
        }, 201)

    if action == "get_comments":
        video_id = body.get("video_id", "")
        if not video_id:
            return err("video_id обязателен")
        offset = int(body.get("offset", 0))
        conn = get_conn(); cur = conn.cursor()
        cur.execute(
            f"SELECT c.id, c.text, c.likes_count, c.created_at, u.id, u.username, u.display_name, u.avatar_url "
            f"FROM {SCHEMA}.comments c JOIN {SCHEMA}.users u ON u.id = c.user_id "
            f"WHERE c.video_id = %s ORDER BY c.created_at DESC LIMIT 30 OFFSET %s",
            (video_id, offset)
        )
        rows = cur.fetchall(); cur.close(); conn.close()
        comments = [{
            "id": str(r[0]), "text": r[1], "likes_count": r[2], "created_at": str(r[3]),
            "user": {"id": str(r[4]), "username": r[5], "display_name": r[6], "avatar_url": r[7] or ""},
        } for r in rows]
        return ok({"comments": comments})

    # ===== ПОДПИСКИ =====
    if action in ("follow", "unfollow"):
        target_id = body.get("user_id", "")
        if not target_id:
            return err("user_id обязателен")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]
        if str(uid) == target_id:
            cur.close(); conn.close()
            return err("Нельзя подписаться на себя")

        if action == "follow":
            try:
                cur.execute(f"INSERT INTO {SCHEMA}.follows (follower_id, following_id) VALUES (%s, %s)", (uid, target_id))
                cur.execute(f"UPDATE {SCHEMA}.users SET followers_count = followers_count + 1 WHERE id = %s", (target_id,))
                cur.execute(f"UPDATE {SCHEMA}.users SET following_count = following_count + 1 WHERE id = %s", (uid,))
                conn.commit()
                following = True
            except psycopg2.errors.UniqueViolation:
                conn.rollback()
                following = True
        else:
            cur.execute(f"DELETE FROM {SCHEMA}.follows WHERE follower_id = %s AND following_id = %s", (uid, target_id))
            if cur.rowcount > 0:
                cur.execute(f"UPDATE {SCHEMA}.users SET followers_count = GREATEST(0, followers_count - 1) WHERE id = %s", (target_id,))
                cur.execute(f"UPDATE {SCHEMA}.users SET following_count = GREATEST(0, following_count - 1) WHERE id = %s", (uid,))
            conn.commit()
            following = False

        cur.execute(f"SELECT followers_count FROM {SCHEMA}.users WHERE id = %s", (target_id,))
        row = cur.fetchone()
        cur.close(); conn.close()
        return ok({"following": following, "followers_count": row[0] if row else 0})

    if action == "is_following":
        target_id = body.get("user_id", "")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user or not target_id:
            cur.close(); conn.close()
            return ok({"following": False})
        cur.execute(f"SELECT 1 FROM {SCHEMA}.follows WHERE follower_id = %s AND following_id = %s", (user[0], target_id))
        following = cur.fetchone() is not None
        cur.close(); conn.close()
        return ok({"following": following})

    # ===== СООБЩЕНИЯ =====
    if action == "send_message":
        receiver_id = body.get("receiver_id", "")
        text = (body.get("text") or "").strip()
        if not receiver_id or not text:
            return err("receiver_id и text обязательны")
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]
        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (sender_id, receiver_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (uid, receiver_id, text)
        )
        mid, created_at = cur.fetchone()
        conn.commit(); cur.close(); conn.close()
        return ok({"message": {"id": str(mid), "text": text, "created_at": str(created_at), "sender_id": str(uid)}}, 201)

    if action == "get_messages":
        other_id = body.get("user_id", "")
        if not other_id:
            return err("user_id обязателен")
        offset = int(body.get("offset", 0))
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]
        cur.execute(
            f"SELECT m.id, m.sender_id, m.receiver_id, m.text, m.is_read, m.created_at "
            f"FROM {SCHEMA}.messages m "
            f"WHERE (m.sender_id = %s AND m.receiver_id = %s) OR (m.sender_id = %s AND m.receiver_id = %s) "
            f"ORDER BY m.created_at ASC LIMIT 50 OFFSET %s",
            (uid, other_id, other_id, uid, offset)
        )
        rows = cur.fetchall()
        cur.execute(f"UPDATE {SCHEMA}.messages SET is_read = TRUE WHERE receiver_id = %s AND sender_id = %s AND is_read = FALSE", (uid, other_id))
        conn.commit(); cur.close(); conn.close()
        msgs = [{"id": str(r[0]), "sender_id": str(r[1]), "receiver_id": str(r[2]), "text": r[3], "is_read": r[4], "created_at": str(r[5])} for r in rows]
        return ok({"messages": msgs})

    if action == "get_chats":
        conn = get_conn(); cur = conn.cursor()
        user = get_user(token, cur)
        if not user:
            cur.close(); conn.close()
            return err("Не авторизован", 401)
        uid = user[0]
        cur.execute(f"""
            SELECT DISTINCT ON (other_id)
                other_id,
                other_username, other_display_name, other_avatar,
                last_text, last_time, unread_count
            FROM (
                SELECT
                    CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END AS other_id,
                    u.username AS other_username,
                    u.display_name AS other_display_name,
                    u.avatar_url AS other_avatar,
                    m.text AS last_text,
                    m.created_at AS last_time,
                    COUNT(CASE WHEN m.receiver_id = %s AND NOT m.is_read THEN 1 END) OVER (PARTITION BY CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END) AS unread_count
                FROM {SCHEMA}.messages m
                JOIN {SCHEMA}.users u ON u.id = CASE WHEN m.sender_id = %s THEN m.receiver_id ELSE m.sender_id END
                WHERE m.sender_id = %s OR m.receiver_id = %s
                ORDER BY m.created_at DESC
            ) sub
            ORDER BY other_id, last_time DESC
        """, (uid, uid, uid, uid, uid, uid))
        rows = cur.fetchall()
        cur.close(); conn.close()
        chats = [{
            "user_id": str(r[0]), "username": r[1], "display_name": r[2],
            "avatar_url": r[3] or "", "last_message": r[4],
            "last_time": str(r[5]), "unread_count": int(r[6] or 0)
        } for r in rows]
        return ok({"chats": chats})

    # ===== ПРОФИЛЬ ДРУГОГО ПОЛЬЗОВАТЕЛЯ =====
    if action == "get_user":
        username = body.get("username", "")
        user_id = body.get("user_id", "")
        conn = get_conn(); cur = conn.cursor()
        me = get_user(token, cur)
        if username:
            cur.execute(f"SELECT id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, is_verified FROM {SCHEMA}.users WHERE username = %s", (username,))
        else:
            cur.execute(f"SELECT id, username, display_name, bio, avatar_url, followers_count, following_count, likes_count, is_verified FROM {SCHEMA}.users WHERE id = %s", (user_id,))
        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return err("Пользователь не найден", 404)
        is_following = False
        if me:
            cur.execute(f"SELECT 1 FROM {SCHEMA}.follows WHERE follower_id = %s AND following_id = %s", (me[0], row[0]))
            is_following = cur.fetchone() is not None
        cur.close(); conn.close()
        return ok({"user": {
            "id": str(row[0]), "username": row[1], "display_name": row[2],
            "bio": row[3] or "", "avatar_url": row[4] or "",
            "followers_count": row[5], "following_count": row[6], "likes_count": row[7], "is_verified": row[8],
            "is_following": is_following,
        }})

    return err("Неизвестный action", 400)
