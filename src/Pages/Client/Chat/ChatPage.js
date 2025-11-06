// src/pages/Chat/ChatPage.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import UserLayout from "../../../components/UserLayout";

export default function ChatPage() {
  // ✅ STATIC URLs
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const token = localStorage.getItem("token");

  // ✅ Logged-in user ID
  const meId = localStorage.getItem("id");

  // ✅ FIXED SUPER ADMIN ID
  const superAdminId = "6905d8d7bcb853ba392fd458";

  const [peerName, setPeerName] = useState("Super Admin");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [socket, setSocket] = useState(null);
  const msgBoxRef = useRef(null);

  // ✅ Connect socket
  useEffect(() => {
    const s = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // ✅ Join room
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Load chat history (Only YOU ↔ SUPER ADMIN)
  useEffect(() => {
    if (!meId) return;

    axios
      .get(`${apiUrl}chat/${meId}/${superAdminId}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [meId]);

  // ✅ Receive messages
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === meId && msg.receiverId === superAdminId) ||
        (msg.senderId === superAdminId && msg.receiverId === meId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, meId]);

  // ✅ Auto Scroll
  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Send Message (Always to SUPER ADMIN)
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: meId,
      receiverId: superAdminId,
      message: text,
    });

    setText("");
  };

  return (
    <UserLayout ac1="active">
      <div
        style={{
          display: "flex",
          height: "90vh",
          border: "1px solid #ddd",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* ✅ Left Section (Fixed Super Admin) */}
        <div
          style={{
            width: "260px",
            borderRight: "1px solid #ddd",
            padding: "10px",
            background: "#f7f7f7",
          }}
        >
          <h4>Super Admin</h4>
          <div
            style={{
              padding: "10px",
              background: "#e6f7ff",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}
          >
            {peerName}
          </div>
        </div>

        {/* ✅ CHAT WINDOW */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              background: "#fafafa",
            }}
          >
            <b>Chat with:</b> {peerName}
          </div>

          {/* Chat Messages */}
          <div
            ref={msgBoxRef}
            style={{
              flex: 1,
              padding: "10px",
              overflowY: "auto",
              background: "#fff",
            }}
          >
            {messages.map((m, i) => {
              const isMine = m.senderId === meId;
              return (
                <div
                  key={i}
                  style={{
                    textAlign: isMine ? "right" : "left",
                    margin: "8px 0",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 10px",
                      borderRadius: "10px",
                      background: isMine ? "#DCF8C6" : "#f1f1f1",
                    }}
                  >
                    {m.message}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              borderTop: "1px solid #ddd",
              background: "#fafafa",
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type message..."
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 14px",
                marginLeft: "8px",
                background: "#111",
                color: "#fff",
                borderRadius: "6px",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
