"""
Аутентификация пользователей: регистрация, вход, получение профиля, выход.
action передаётся в теле запроса: register | login | me | logout
"""
import os
import json
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p17416507_tik_tok_startup")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def ok(data: dict, status: int = 200) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def err(msg: str, status: int = 400) -> dict:
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    action = body.get("action", "")

    # ---------- Регистрация ----------
    if action == "register":
        username = (body.get("username") or "").strip().lower()
        email = (body.get("email") or "").strip().lower()
        password = body.get("password") or ""
        display_name = (body.get("display_name") or username).strip()

        if not username or not email or not password:
            return err("Заполните все обязательные поля")
        if len(username) < 3:
            return err("Имя пользователя — минимум 3 символа")
        if len(password) < 6:
            return err("Пароль — минимум 6 символов")
        if "@" not in email:
            return err("Некорректный email")

        pw_hash = hash_password(password)
        token = secrets.token_hex(32)

        conn = get_conn()
        cur = conn.cursor()
        try:
            cur.execute(
                f"INSERT INTO {SCHEMA}.users (username, email, password_hash, display_name, session_token) "
                f"VALUES (%s, %s, %s, %s, %s) RETURNING id, username, display_name, email, bio, avatar_url, followers_count, following_count, likes_count, is_verified",
                (username, email, pw_hash, display_name, token)
            )
            row = cur.fetchone()
            conn.commit()
        except psycopg2.errors.UniqueViolation as e:
            conn.rollback()
            cur.close()
            conn.close()
            if "username" in str(e):
                return err("Это имя пользователя уже занято")
            return err("Этот email уже зарегистрирован")
        except Exception as e:
            conn.rollback()
            cur.close()
            conn.close()
            return err(f"Ошибка БД: {str(e)}", 500)

        cur.close()
        conn.close()

        return ok({
            "token": token,
            "user": {
                "id": str(row[0]),
                "username": row[1],
                "display_name": row[2],
                "email": row[3],
                "bio": row[4],
                "avatar_url": row[5],
                "followers_count": row[6],
                "following_count": row[7],
                "likes_count": row[8],
                "is_verified": row[9],
            }
        }, 201)

    # ---------- Вход ----------
    if action == "login":
        login = (body.get("login") or "").strip().lower()
        password = body.get("password") or ""

        if not login or not password:
            return err("Введите логин и пароль")

        pw_hash = hash_password(password)
        token = secrets.token_hex(32)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id FROM {SCHEMA}.users WHERE (email = %s OR username = %s) AND password_hash = %s",
            (login, login, pw_hash)
        )
        row = cur.fetchone()
        if not row:
            cur.close()
            conn.close()
            return err("Неверный логин или пароль", 401)

        user_id = row[0]
        cur.execute(
            f"UPDATE {SCHEMA}.users SET session_token = %s WHERE id = %s "
            f"RETURNING id, username, display_name, email, bio, avatar_url, followers_count, following_count, likes_count, is_verified",
            (token, user_id)
        )
        u = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()

        return ok({
            "token": token,
            "user": {
                "id": str(u[0]),
                "username": u[1],
                "display_name": u[2],
                "email": u[3],
                "bio": u[4],
                "avatar_url": u[5],
                "followers_count": u[6],
                "following_count": u[7],
                "likes_count": u[8],
                "is_verified": u[9],
            }
        })

    # ---------- Профиль ----------
    if action == "me":
        token = (event.get("headers") or {}).get("X-Session-Token") or \
                (event.get("headers") or {}).get("x-session-token") or \
                body.get("token")
        if not token:
            return err("Не авторизован", 401)

        conn = get_conn()
        cur = conn.cursor()
        cur.execute(
            f"SELECT id, username, display_name, email, bio, avatar_url, followers_count, following_count, likes_count, is_verified "
            f"FROM {SCHEMA}.users WHERE session_token = %s",
            (token,)
        )
        u = cur.fetchone()
        cur.close()
        conn.close()

        if not u:
            return err("Не авторизован", 401)

        return ok({
            "user": {
                "id": str(u[0]),
                "username": u[1],
                "display_name": u[2],
                "email": u[3],
                "bio": u[4],
                "avatar_url": u[5],
                "followers_count": u[6],
                "following_count": u[7],
                "likes_count": u[8],
                "is_verified": u[9],
            }
        })

    # ---------- Выход ----------
    if action == "logout":
        token = (event.get("headers") or {}).get("X-Session-Token") or \
                (event.get("headers") or {}).get("x-session-token") or \
                body.get("token")
        if token:
            conn = get_conn()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL WHERE session_token = %s", (token,))
            conn.commit()
            cur.close()
            conn.close()
        return ok({"ok": True})

    return err("Неизвестный action. Используйте: register, login, me, logout", 400)
