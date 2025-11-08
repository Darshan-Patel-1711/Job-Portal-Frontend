// src/pages/Chat/ChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function ChatPage({ closeModal }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const meId = localStorage.getItem("id");

  const [users, setUsers] = useState([]);            // ALL USERS LIST (live)
  const [peer, setPeer] = useState(null);            // selected chat partner
  const [messages, setMessages] = useState([]);      // chat messages
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);

  const msgBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // ✅ Connect Socket
  useEffect(() => {
    const s = io(socketUrl, { transports: ["websocket"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ✅ Join Socket room
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Listen to Live Users List (online, unseen, images)
  useEffect(() => {
    if (!socket) return;

    socket.on("usersList", (list) => {
      setUsers(list);
    });

    return () => socket.off("usersList");
  }, [socket]);

  // ✅ Load chat history on user click
  useEffect(() => {
    if (!peer) return;

    axios
      .get(`${apiUrl}chat/${meId}/${peer._id}`, {
        headers: { Authorization: token },
      })
      .then((res) => {
        setMessages(res.data);
        socket.emit("markSeen", { userId: meId, fromId: peer._id });
      })
      .catch(() => {});
  }, [peer, apiUrl, meId, token, socket]);

  // ✅ Receive Message + Typing events
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      if (
        (msg.senderId === meId && msg.receiverId === peer?._id) ||
        (msg.senderId === peer?._id && msg.receiverId === meId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }

      // mark seen if it's from peer
      if (msg.senderId === peer?._id) {
        socket.emit("markSeen", { userId: meId, fromId: peer._id });
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
  }, [socket, peer, meId]);

  // ✅ Auto scroll to bottom
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

    socket.emit("stopTyping", { senderId: meId, receiverId: peer._id });

    setText("");
  };

  // ✅ Typing handler
  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", { senderId: meId, receiverId: peer._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { senderId: meId, receiverId: peer._id });
    }, 800);
  };

  // ✅ Helpers
  const getStamp = (m) => m?.createdAt || m?.timestamp || Date.now();
  const fmtDate = (ts) =>
    new Date(ts).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
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

            {/* Header */}
            <div className="card-header">
              <h3 className="card-title">
                {peer ? `${peer.firstName} ${peer.lastName}` : "Messages"}
              </h3>
              <div className="card-tools">
                <button className="btn btn-tool" onClick={closeModal}>
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            <div className="d-flex">
              
              {/* ✅ LEFT USER LIST */}
              <div style={{ width: "260px", borderRight: "1px solid #ddd" }}>
                <h4 className="p-2 bg-light m-0">Users</h4>

                {users.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => setPeer(u)}
                    className="p-2 d-flex align-items-center gap-2"
                    style={{
                      cursor: "pointer",
                      background: peer?._id === u._id ? "#e7f5ff" : "white",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {/* ✅ User Image */}
                    <img
                      src={
                        u.profileImage ||
                        "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                      }
                      width={38}
                      height={38}
                      className="img-circle img-bordered-sm"
                      alt=""
                    />

                    <div className="flex-grow-1">
                      <div>
                        {u.firstName} {u.lastName}
                      </div>

                      {/* ✅ Online / Offline */}
                      <small>
                        {u.online ? (
                          <span style={{ color: "green" }}>● Online</span>
                        ) : (
                          <span style={{ color: "gray" }}>● Offline</span>
                        )}
                      </small>
                    </div>

                    {/* ✅ Unseen Badge */}
                    {u.unseen > 0 && (
                      <span
                        style={{
                          background: "#007bff",
                          color: "white",
                          borderRadius: "50%",
                          padding: "4px 8px",
                          fontSize: "12px",
                        }}
                      >
                        {u.unseen}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* ✅ CHAT WINDOW */}
              <div style={{ flex: 1 }}>
                <div
                  className="card direct-chat direct-chat-primary"
                  style={{ height: "100%" }}
                >
                  <div className="card-header">
                    <h3 className="card-title">
                      {peer ? `Chat with ${peer.firstName}` : "Select user"}
                    </h3>
                  </div>

                  {/* ✅ Messages */}
                  <div className="card-body">
                    <div className="direct-chat-messages" ref={msgBoxRef}>
                      {messages.map((m, i) => {
                        const isMine = String(m.senderId) === String(meId);
                        const ts = getStamp(m);
                        const prev = messages[i - 1];

                        const needDate =
                          i === 0 ||
                          new Date(getStamp(prev)).toDateString() !==
                            new Date(ts).toDateString();

                        return (
                          <React.Fragment key={i}>
                            {needDate && (
                              <div className="date-divider">
                                <span>{fmtDate(ts)}</span>
                              </div>
                            )}

                            <div
                              className={`direct-chat-msg ${
                                isMine ? "right" : ""
                              }`}
                            >
                              <img
                                src={
                                  peer?.profileImage ||
                                  "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
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
                                  {fmtTime(ts)}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}

                      {/* ✅ Typing indicator */}
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
                          placeholder="Type Message..."
                          className="form-control"
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
          </div>
        </div>
      </div>
    </div>
  );
}
