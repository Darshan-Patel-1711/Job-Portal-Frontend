// src/components/LiveChat.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getSocket } from "../utils/socket";

// Helper to read API base from env or prop
const pickApiBase = (overrideBase) => {
  if (overrideBase) return overrideBase;
  // Vite style
  if (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE;
  }
  // CRA style
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }
  // fallback
  return "http://localhost:3000";
};

export default function LiveChat({
  meId,           // logged-in user's _id (string)
  peerId,         // whom you're chatting with (string)
  apiBase,        // optional override "http://192.168.1.11:3000"
  height = 360,   // px
  onNewMessage,   // optional callback(msg)
}) {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const scrollRef = useRef(null);
  const typingTimer = useRef(null);

  const BASE = pickApiBase(apiBase);
  const socket = getSocket(BASE);

  // Join + load history + socket listeners
  useEffect(() => {
    if (!meId || !peerId) return;

    socket.emit("join", { userId: meId });

    axios
      .get(`${BASE}/api/chat/${meId}/${peerId}`)
      .then((res) => setList(res.data || []))
      .catch(() => {});

    const onReceive = (msg) => {
      // Only push if this chat pair matches
      if (
        (msg.senderId === meId && msg.receiverId === peerId) ||
        (msg.senderId === peerId && msg.receiverId === meId)
      ) {
        setList((prev) => [...prev, msg]);
        onNewMessage && onNewMessage(msg);
      }
    };

    const onTyping = ({ from, isTyping }) => {
      if (from === peerId) setIsPeerTyping(isTyping);
    };

    socket.on("receiveMessage", onReceive);
    socket.on("typing", onTyping);

    // Mark incoming as read (optional best-effort)
    axios.post(`${BASE}/api/chat/read/${meId}/${peerId}`).catch(() => {});

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("typing", onTyping);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId, peerId, BASE]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [list, isPeerTyping]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    socket.emit(
      "sendMessage",
      { senderId: meId, receiverId: peerId, message: trimmed },
      // optional ack:
      () => {}
    );
    setText("");
    // mark read (optional)
    axios.post(`${BASE}/api/chat/read/${meId}/${peerId}`).catch(() => {});
  };

  const onChange = (e) => {
    setText(e.target.value);
    // typing signal
    socket.emit("typing", { to: peerId, from: meId, isTyping: true });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("typing", { to: peerId, from: meId, isTyping: false });
    }, 700);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.head}>
        <div style={styles.avatar}>{(peerId || "?").slice(0, 2).toUpperCase()}</div>
        <div style={{ lineHeight: "1.1" }}>
          <div style={styles.title}>Chat</div>
          <div style={styles.sub}>
            with <code>{peerId}</code>
          </div>
        </div>
      </div>

      <div ref={scrollRef} style={{ ...styles.list, height }}>
        {list.map((m) => {
          const mine = m.senderId === meId;
          return (
            <div key={m._id || m.createdAt || Math.random()} style={{ textAlign: mine ? "right" : "left", margin: "6px 0" }}>
              <div style={{ ...styles.bubble, background: mine ? "#DCF8C6" : "#eee" }}>
                <div style={styles.msg}>{m.message}</div>
                <div style={styles.time}>
                  {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}
                </div>
              </div>
            </div>
          );
        })}
        {isPeerTyping && <div style={styles.typing}>typing…</div>}
      </div>

      <div style={styles.inputRow}>
        <textarea
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          style={styles.input}
          rows={2}
        />
        <button onClick={send} style={styles.btn}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    width: 380,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    background: "#fff",
  },
  head: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    background: "#fafafa",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "#111827",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
  },
  title: { fontWeight: 700 },
  sub: { fontSize: 12, opacity: 0.7 },
  list: { overflow: "auto", padding: 10, background: "#fff" },
  bubble: {
    display: "inline-block",
    padding: "8px 10px",
    borderRadius: 10,
    maxWidth: "80%",
    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
  },
  msg: { whiteSpace: "pre-wrap" },
  time: { fontSize: 10, opacity: 0.6, marginTop: 4 },
  typing: { fontSize: 12, opacity: 0.7, marginTop: 6 },
  inputRow: { display: "flex", gap: 8, padding: 10, borderTop: "1px solid #f0f0f0" },
  input: {
    flex: 1,
    resize: "none",
    padding: 8,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    outline: "none",
  },
  btn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #111827",
    background: "#111827",
    color: "#fff",
    cursor: "pointer",
  },
};
