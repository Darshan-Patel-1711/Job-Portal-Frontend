// src/pages/Chat/ChatPage.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function ChatPage({ closeModal }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const meId = localStorage.getItem("id");

  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [superAdminId, setSuperAdminId] = useState("");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);

  const [typing, setTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const [isOnline, setIsOnline] = useState(false); // ✅ ONLINE STATUS

  const msgBoxRef = useRef(null);

  // ✅ Connect Socket
  useEffect(() => {
    const s = io(socketUrl, { transports: ["websocket", "polling"] });
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // ✅ Fetch Profile (Admin + User)
  useEffect(() => {
    axios
      .get(`${apiUrl}admin/chatditails`, {
        headers: { authorization: localStorage.getItem("token") },
      })
      .then((res) => {
        setAdmin(res.data.admin);
        setUser(res.data.User);
        setSuperAdminId(res.data.admin._id);
      })
      .catch(() => {});
  }, []);

  // ✅ Load chat history
  useEffect(() => {
    if (!meId || !superAdminId) return;

    axios
      .get(`${apiUrl}chat/${meId}/${superAdminId}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [meId, superAdminId]);

  // ✅ Join socket room
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Socket Listeners (messages + typing + online)
  useEffect(() => {
    if (!socket) return;

    // ✅ Receive new message
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // ✅ Someone typing
    socket.on("typing", (id) => {
      if (id === superAdminId) setTyping(true);
    });

    socket.on("stopTyping", (id) => {
      if (id === superAdminId) setTyping(false);
    });

    // ✅ ONLINE
    socket.on("userOnline", (id) => {
      if (id === superAdminId) setIsOnline(true);
    });

    // ✅ OFFLINE
    socket.on("userOffline", (id) => {
      if (id === superAdminId) setIsOnline(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket, superAdminId]);

  // ✅ Auto Scroll
  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // ✅ Send Message
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      senderId: meId,
      receiverId: superAdminId,
      message: text,
    });

    socket.emit("stopTyping", meId);
    setText("");
  };

  // ✅ Typing Handler
  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    socket.emit("typing", meId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", meId);
    }, 700);
  };

  // ✅ Helpers
  const getStamp = (m) => m?.createdAt || m?.timestamp || Date.now();
  const fmtDate = (ts) =>
    new Date(ts).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        <div className="modal-body p-0">
          <div className="card direct-chat direct-chat-primary">
            {/* ✅ Header */}
            <div className="card-header d-flex align-items-center justify-content-between">
              <h3 className="card-title">
                Chat with {admin ? admin.firstName : "Admin"}{" "}
                <span style={{ marginLeft: 10, fontSize: 14 }}>
                  {isOnline ? (
                    <span style={{ color: "green" }}>● Online</span>
                  ) : (
                    <span style={{ color: "red" }}>● Offline</span>
                  )}
                </span>
              </h3>
              <div className="card-tools">
                <button className="btn btn-tool" onClick={closeModal}>
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            {/* ✅ Messages */}
            <div className="card-body">
              <div className="direct-chat-messages" ref={msgBoxRef}>
                {messages.map((m, i) => {
                  const isMine = m.senderId === meId;
                  const curTs = getStamp(m);
                  const prev = messages[i - 1];

                  const needDate =
                    i === 0 ||
                    new Date(getStamp(prev)).toDateString() !==
                      new Date(curTs).toDateString();

                  return (
                    <React.Fragment key={i}>
                      {needDate && (
                        <div className="date-divider">
                          <div className="line" />
                          <span className="label">{fmtDate(curTs)}</span>
                          <div className="line" />
                        </div>
                      )}

                      <div
                        className={`direct-chat-msg ${isMine ? "right" : ""}`}
                      >
                        <img
                          src={
                            isMine ? user?.profileImage : admin?.profileImage
                          }
                          className="direct-chat-img"
                          alt="user"
                        />

                        <div className="direct-chat-text msg-with-time">
                          {m.message}

                          <span
                            className={`msg-time ${
                              isMine ? "right-corner" : "left-corner"
                            }`}
                          >
                            {fmtTime(curTs)}
                          </span>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}

                {/* ✅ Typing Indicator */}
                {typing && (
                  <div className="typing-indicator">
                    {admin?.firstName || "Admin"} is typing…
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Footer Input */}
            <div className="card-footer">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Type Message ..."
                  className="form-control direct-chat-input"
                  value={text}
                  onChange={handleTyping}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <span className="input-group-append">
                  <button className="btn btn-primary" onClick={sendMessage}>
                    Send
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
