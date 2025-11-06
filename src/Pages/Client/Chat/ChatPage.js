// src/pages/Chat/ChatPage.jsx

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";

export default function ChatPage({ closeModal }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const socketUrl = "http://localhost:3000";
  const meId = localStorage.getItem("id");
  const [peerName] = useState("Super Admin");
  const superAdminId = "6905d8d7bcb853ba392fd458";
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [socket, setSocket] = useState(null);
  const msgBoxRef = useRef(null);

  // ✅ Connect socket
  useEffect(() => {
    const s = io(socketUrl, { transports: ["websocket", "polling"] });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  // ✅ Join room
  useEffect(() => {
    if (socket && meId) {
      socket.emit("join", { userId: meId });
    }
  }, [socket, meId]);

  // ✅ Load chat history
  useEffect(() => {
    if (!meId) return;

    axios
      .get(`${apiUrl}chat/${meId}/${superAdminId}`)
      .then((res) => setMessages(res.data))
      .catch(() => {});
  }, [meId]);

  // ✅ Receive Socket Messages
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
    <div className="modal-dialog modal-xl">
      <div className="modal-content">
        {/* Header */}
        

        {/* Body */}
        <div className="modal-body p-0">
          <div className="card direct-chat direct-chat-primary">
            <div className="card-header">
              <h3 className="card-title">Direct Chat</h3>
              <div className="card-tools">
                <button  type="button" className="btn btn-tool" onClick={closeModal}> <i className="fas fa-times" /> </button>
              </div>
            </div>

            <div className="card-body">
              <div  className="direct-chat-messages"  ref={msgBoxRef} >
                {messages.map((m, i) => { const isMine = m.senderId === meId;
                  return (
                    <div key={i} className={`direct-chat-msg ${isMine ? "right" : ""}`}>
                      <img
                        src="https://cdn-icons-png.freepik.com/512/16800/16800177.png"
                        className="direct-chat-img"
                        alt="user"
                      />
                      <div className="direct-chat-text">
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-footer">
              <div className="input-group">
                <input
                  type="text"
                  name="message"
                  placeholder="Type Message ..."
                  className="form-control direct-chat-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <span className="input-group-append">
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={sendMessage}
                  >
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