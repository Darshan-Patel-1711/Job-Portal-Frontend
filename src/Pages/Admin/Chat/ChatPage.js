// src/pages/Chat/ChatPage.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Layout from "../../../components/Layout";

export default function ChatPage() {
  // ✅ STATIC URLs
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const token = localStorage.getItem("token");

  // ✅ Logged-in user ID (localStorage → user object)
  const loggedUser = localStorage.getItem("id")
  
  const meId = localStorage.getItem("id");

  const [users, setUsers] = useState([]);
  const [peerId, setPeerId] = useState(null);
  const [peerName, setPeerName] = useState("");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [socket, setSocket] = useState(null);

  const msgBoxRef = useRef(null);

  // ✅ Setup socket connection (STATIC)
  useEffect(() => {
    const s = io(socketUrl, {
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // ✅ Join socket room with logged user ID
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Fetch users list
  useEffect(() => {
    axios
      .get(`${apiUrl}user/get`, {
        headers: { Authorization: token },
      })
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  // ✅ Load chat history when peer changes
  useEffect(() => {
    if (!peerId || !meId) return;

    axios
      .get(`${apiUrl}chat/${meId}/${peerId}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [peerId, meId]);

  // ✅ Receive messages from socket
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      // Only push messages for this chat pair
      if (
        (msg.senderId === meId && msg.receiverId === peerId) ||
        (msg.senderId === peerId && msg.receiverId === meId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [socket, peerId, meId]);

  // ✅ Auto scroll chat to bottom
  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Send message
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: meId,
      receiverId: peerId,
      message: text,
    });

    setText("");
  };

  return (
    <Layout ac1="active">
      <div
        style={{
          display: "flex",
          height: "90vh",
          border: "1px solid #ddd",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* ✅ Users List (Left Panel) */}
        <div
          style={{
            width: "260px",
            borderRight: "1px solid #ddd",
            overflowY: "auto",
          }}
        >
          <h4 style={{ padding: "10px", background: "#f7f7f7", margin: 0 }}>
            Users
          </h4>

          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => {
                setPeerId(u._id);
                setPeerName(`${u.firstName} ${u.lastName}`);
              }}
              style={{
                padding: "10px",
                cursor: "pointer",
                background: peerId === u._id ? "#e6f7ff" : "white",
                borderBottom: "1px solid #eee",
              }}
            >
              {u.firstName} {u.lastName}
            </div>
          ))}
        </div>

        {/* ✅ Chat Window (Right Panel) */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Chat Header */}
          <div
            style={{
              padding: "10px",
              borderBottom: "1px solid #ddd",
              background: "#fafafa",
            }}
          >
            <b>Chat with:</b> {peerName || "Select user"}
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

          {/* Chat Input */}
          {peerId && (
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
          )}
        </div>
      </div>
    </Layout>
  );
}
