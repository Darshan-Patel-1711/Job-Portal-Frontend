// src/pages/Chat/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Layout from "../../../components/Layout";

export default function ChatPage() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const meId = localStorage.getItem("id");

  const [users, setUsers] = useState([]);
  const [peer, setPeer] = useState(null);   // selected user object
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);

  const msgBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Socket connect
  useEffect(() => {
    const s = io(socketUrl, { transports: ["websocket", "polling"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ✅ Join Room
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Fetch Users
  useEffect(() => {
    axios
      .get(`${apiUrl}user/get`, { headers: { Authorization: token } })
      .then((res) => setUsers(res.data))
      .catch(() => {});
  }, []);

  // ✅ Load Chat History when user selects
  useEffect(() => {
    if (!peer) return;

    axios
      .get(`${apiUrl}chat/${meId}/${peer._id}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [peer]);

  // ✅ Receive Message + Typing
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === meId && msg.receiverId === peer?._id) ||
        (msg.senderId === peer?._id && msg.receiverId === meId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("typing", (id) => {
      if (peer && id === peer._id) setTyping(true);
    });

    socket.on("stopTyping", (id) => {
      if (peer && id === peer._id) setTyping(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, peer]);

  // ✅ Auto Scroll
  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Send message
  const sendMessage = () => {
    if (!text.trim() || !peer) return;

    socket.emit("sendMessage", {
      senderId: meId,
      receiverId: peer._id,
      message: text,
    });

    socket.emit("stopTyping", meId);
    setText("");
  };

  // ✅ Typing handler
  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", meId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", meId);
    }, 700);
  };

  // ✅ Date Helpers
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
    <>
      <div style={{ display: "flex", height: "90vh" }}>
        
        {/* ✅ Users List */}
        <div style={{ width: "260px", borderRight: "1px solid #ddd" }}>
          <h4 className="p-2 bg-light m-0">Users</h4>
          {users.map((u) => (
            <div
              key={u._id}
              onClick={() => setPeer(u)}
              className="p-2"
              style={{
                cursor: "pointer",
                background: peer?._id === u._id ? "#e6f7ff" : "white",
                borderBottom: "1px solid #eee",
              }}
            >
              {u.firstName} {u.lastName}
            </div>
          ))}
        </div>

        {/* ✅ Chat Window */}
        <div style={{ flex: 1 }}>
          <div className="card direct-chat direct-chat-primary" style={{ height: "100%" }}>
            
            {/* ✅ Header */}
            <div className="card-header">
              <h3 className="card-title">
                {peer ? `Chat with ${peer.firstName}` : "Select user"}
              </h3>
            </div>

            {/* ✅ Chat Messages */}
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

                      <div className={`direct-chat-msg ${isMine ? "right" : ""}`}>
                        <img
                          src={
                            isMine
                              ? peer?.profileImage
                              : peer?.profileImage || "/user.png"
                          }
                          className="direct-chat-img"
                          alt=""
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

                {/* Typing */}
                {typing && (
                  <div className="typing-indicator">
                    {peer?.firstName} is typing…
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Input */}
            {peer && (
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}
