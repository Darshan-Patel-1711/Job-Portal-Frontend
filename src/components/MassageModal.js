import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { HiStatusOnline, HiStatusOffline } from "react-icons/hi";

export default function MassageModal({ closeModal }) {
  // GLOBAL
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const role = localStorage.getItem("role");
  const meId = localStorage.getItem("id");
  const token = localStorage.getItem("token");
  const myProfileImage = localStorage.getItem("profileImage");

  const [socket, setSocket] = useState(null);

  // ADMIN STATE
  const [users, setUsers] = useState([]);
  const [peer, setPeer] = useState(null);

  // USER STATE
  const [admin, setAdmin] = useState(null);
  const [user, setUser] = useState(null);
  const [superAdminId, setSuperAdminId] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  // COMMON STATE
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const msgBoxRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  //----------------------------
  // ✅ CONNECT SOCKET
  //----------------------------
  useEffect(() => {
    const s = io(socketUrl, { transports: ["websocket"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  //----------------------------
  // ✅ JOIN SOCKET ROOM
  //----------------------------
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  //----------------------------
  // ✅ USER MODE: Fetch admin + user profile
  //----------------------------
  useEffect(() => {
    if (role !== "user") return;

    setLoading(true);
    setError(null);

    // TRY MULTIPLE POSSIBLE ENDPOINTS
    const endpoints = [
      `${apiUrl}admin/chatdetails`,  // Fixed typo
      `${apiUrl}admin/chatditails`,  // Original (with typo)
      `${apiUrl}api/admin/chatdetails`,
      `${apiUrl}api/admin/chatditails`,
    ];

    const tryEndpoints = async () => {
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          const res = await axios.get(endpoint, {
            headers: { authorization: token },
          });
          
          console.log("Success! Response:", res.data);
          setAdmin(res.data.admin);
          setUser(res.data.User || res.data.user);
          setSuperAdminId(res.data.admin._id);
          setLoading(false);
          return; // Success, exit
        } catch (err) {
          console.error(`Failed: ${endpoint}`, err.message);
          // Continue to next endpoint
        }
      }
      
      // All endpoints failed
      setError("Unable to connect to admin. Please check your connection.");
      setLoading(false);
    };

    tryEndpoints();
  }, [role, apiUrl, token]);

  //----------------------------
  // ✅ ADMIN MODE: Users list
  //----------------------------
  useEffect(() => {
    if (role !== "admin" || !socket) return;

    socket.on("usersList", (list) => setUsers(list));

    return () => socket.off("usersList");
  }, [socket, role]);

  //----------------------------
  // ✅ LOAD CHAT HISTORY
  //----------------------------
  useEffect(() => {
    let withId = null;

    if (role === "admin" && peer) withId = peer._id;
    if (role === "user" && superAdminId) withId = superAdminId;

    if (!withId) return;

    setLoading(true);
    setError(null);

    // TRY MULTIPLE POSSIBLE ENDPOINTS
    const endpoints = [
      `${apiUrl}chat/${meId}/${withId}`,
      `${apiUrl}api/chat/${meId}/${withId}`,
      `${apiUrl}messages/${meId}/${withId}`,
      `${apiUrl}api/messages/${meId}/${withId}`,
    ];

    const tryEndpoints = async () => {
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying chat endpoint: ${endpoint}`);
          const res = await axios.get(endpoint, {
            headers: { authorization: token },
          });
          
          console.log("Chat history loaded:", res.data);
          setMessages(res.data);
          setLoading(false);
          return; // Success, exit
        } catch (err) {
          console.error(`Failed: ${endpoint}`, err.message);
          // Continue to next endpoint
        }
      }
      
      // All endpoints failed - but this might be ok (no messages yet)
      console.warn("Could not load chat history. Starting fresh.");
      setMessages([]);
      setLoading(false);
    };

    tryEndpoints();
  }, [peer, superAdminId, role, apiUrl, meId, token]);

  //----------------------------
  // ✅ SOCKET EVENTS (receive message, typing, online)
  //----------------------------
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (id) => {
      if (role === "admin" && peer && id === peer._id) setTyping(true);
      if (role === "user" && id === superAdminId) setTyping(true);
    });

    socket.on("stopTyping", (id) => {
      if (role === "admin" && peer && id === peer._id) setTyping(false);
      if (role === "user" && id === superAdminId) setTyping(false);
    });

    socket.on("userOnline", (id) => {
      if (role === "user" && id === superAdminId) setIsOnline(true);
    });

    socket.on("userOffline", (id) => {
      if (role === "user" && id === superAdminId) setIsOnline(false);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("userOnline");
      socket.off("userOffline");
    };
  }, [socket, role, peer, superAdminId]);

  //----------------------------
  // ✅ SEND MESSAGE
  //----------------------------
  const sendMessage = () => {
    if (!text.trim()) return;

    const receiverId =
      role === "admin"
        ? peer?._id
        : superAdminId;

    if (!receiverId) {
      setError("No recipient selected");
      return;
    }

    socket.emit("sendMessage", {
      senderId: meId,
      receiverId,
      message: text,
    });

    socket.emit("stopTyping", meId);

    setText("");
  };

  //----------------------------
  // ✅ HANDLE TYPING
  //----------------------------
  const handleTyping = (e) => {
    setText(e.target.value);
    
    if (socket) {
      socket.emit("typing", meId);

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", meId);
      }, 700);
    }
  };

  //----------------------------
  // ✅ AUTO SCROLL
  //----------------------------
  useEffect(() => {
    if (msgBoxRef.current) {
      msgBoxRef.current.scrollTop = msgBoxRef.current.scrollHeight;
    }
  }, [messages, typing]);

  //----------------------------
  // ✅ HELPERS
  //----------------------------
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

  //----------------------------
  // ✅ UI STARTS HERE
  //----------------------------

  return (
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        <div className="modal-body p-0">
          <div className="card direct-chat direct-chat-primary">

            {/* HEADER */}
            <div className="card-header">
              <h3 className="card-title">

                {role === "user" ? (
                  <>
                    {isOnline ? (
                      <HiStatusOnline size={25} color="green" />
                    ) : (
                      <HiStatusOffline size={25} color="red" />
                    )}  
                    Chat with {admin?.firstName || "Admin"}
                  </>
                ) : (
                  <>
                    {peer ? `Chat with ${peer.firstName}` : "Messages"}
                  </>
                )}

              </h3>

              <div className="card-tools">
                <button className="btn btn-tool" onClick={closeModal}>
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="alert alert-warning m-3" role="alert">
                <i className="fas fa-exclamation-triangle"></i> {error}
              </div>
            )}

            <div className="d-flex">

              {/* ---------------- ADMIN USER LIST ---------------- */}
              {role === "admin" && (
                <div style={{ width: "260px", borderRight: "1px solid #ddd" }}>
                  <h4 className="p-2 bg-light m-0">Users</h4>

                  {users.length === 0 && (
                    <div className="p-3 text-center text-muted">
                      <small>No users online</small>
                    </div>
                  )}

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
                        <div>{u.firstName} {u.lastName}</div>
                        <small>
                          {u.online ? (
                            <span style={{ color: "green" }}>● Online</span>
                          ) : (
                            <span style={{ color: "gray" }}>● Offline</span>
                          )}
                        </small>
                      </div>

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
              )}

              {/* ---------------- CHAT BOX ---------------- */}
              <div style={{ flex: 1 }}>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center p-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="direct-chat-messages" ref={msgBoxRef}>

                      {messages.length === 0 && !typing && (
                        <div className="text-center text-muted p-5">
                          <i className="far fa-comments fa-3x mb-3"></i>
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      )}

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

                            <div className={`direct-chat-msg ${isMine ? "right" : ""}`}>
                              <img
                                src={
                                  isMine
                                    ? myProfileImage || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                                    : role === "admin"
                                    ? peer?.profileImage || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                                    : admin?.profileImage || "https://cdn-icons-png.flaticon.com/512/3177/3177440.png"
                                }
                                className="direct-chat-img"
                                alt=""
                              />

                              <div className="direct-chat-text msg-with-time">
                                {m.message}
                                <span className={`msg-time ${isMine ? "right-corner" : "left-corner"}`}>
                                  {fmtTime(ts)}
                                </span>
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}

                      {typing && (
                        <div className="typing-indicator">
                          {role === "admin" ? peer?.firstName : admin?.firstName} is typing…
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* FOOTER */}
                {(role === "user" || peer) && (
                  <div className="card-footer">
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Type Message..."
                        className="form-control"
                        value={text}
                        onChange={handleTyping}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        disabled={loading}
                      />
                      <span className="input-group-append">
                        <button 
                          className="btn btn-primary" 
                          onClick={sendMessage}
                          disabled={loading || !text.trim()}
                        >
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
  );
}