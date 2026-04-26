import sqlite3
import os

DB_PATH = os.getenv("DB_PATH", "mentormind_dsa.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def create_tables():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS students (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            role        TEXT NOT NULL,
            content     TEXT NOT NULL,
            topic       TEXT,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        -- Tracks which DSA topics the student has struggled with most
        CREATE TABLE IF NOT EXISTS topic_stats (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            topic       TEXT NOT NULL,
            count       INTEGER DEFAULT 1,
            last_seen   DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(student_id, topic),
            FOREIGN KEY (student_id) REFERENCES students(id)
        );

        -- Stores LeetCode problems the student has discussed (optional enrichment)
        CREATE TABLE IF NOT EXISTS problem_sessions (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id  INTEGER NOT NULL,
            problem     TEXT NOT NULL,
            topic       TEXT,
            solved      INTEGER DEFAULT 0,   -- 0 = in progress, 1 = solved with hints
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id)
        );
    """)

    conn.commit()
    conn.close()


def get_or_create_student(name: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, created_at FROM students WHERE name = ?", (name,))
    row = cursor.fetchone()

    if row:
        student = dict(row)
        student["is_new"] = False
    else:
        cursor.execute("INSERT INTO students (name) VALUES (?)", (name,))
        conn.commit()
        student = {"id": cursor.lastrowid, "name": name, "is_new": True}

    conn.close()
    return student


def save_message(student_id: int, role: str, content: str, topic: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (student_id, role, content, topic) VALUES (?, ?, ?, ?)",
        (student_id, role, content, topic),
    )
    conn.commit()
    conn.close()


def upsert_topic_stat(student_id: int, topic: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO topic_stats (student_id, topic, count, last_seen)
        VALUES (?, ?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(student_id, topic)
        DO UPDATE SET count = count + 1, last_seen = CURRENT_TIMESTAMP
        """,
        (student_id, topic),
    )
    conn.commit()
    conn.close()


def get_topic_stats(student_id: int) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT topic, count FROM topic_stats WHERE student_id = ? ORDER BY count DESC",
        (student_id,),
    )
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def get_message_history(student_id: int, limit: int = 50) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT role, content, topic, created_at FROM messages "
        "WHERE student_id = ? ORDER BY id DESC LIMIT ?",
        (student_id, limit),
    )
    rows = [dict(r) for r in reversed(cursor.fetchall())]
    conn.close()
    return rows


def delete_student_messages(student_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE student_id = ?", (student_id,))
    cursor.execute("DELETE FROM topic_stats WHERE student_id = ?", (student_id,))
    cursor.execute("DELETE FROM problem_sessions WHERE student_id = ?", (student_id,))
    conn.commit()
    conn.close()


def log_problem_session(student_id: int, problem: str, topic: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO problem_sessions (student_id, problem, topic) VALUES (?, ?, ?)",
        (student_id, problem, topic),
    )
    conn.commit()
    conn.close()


def mark_problem_solved(session_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE problem_sessions SET solved = 1 WHERE id = ?",
        (session_id,),
    )
    conn.commit()
    conn.close()