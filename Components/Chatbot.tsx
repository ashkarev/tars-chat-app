"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatBox({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  // 🔵 data
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const typingUsers = useQuery(api.typing.getTyping, { conversationId });

  // 🔵 mutations
  const sendMessage = useMutation(api.messages.send);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.remove);
  const setTyping = useMutation(api.typing.setTyping);
  const markSeen = useMutation(api.messages.markAsSeen);

  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const conversation = useQuery(api.conversations.getConversation,
    currentUser ? { conversationId, userId: currentUser._id } : "skip"
  );

  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔊 notification sound
  useEffect(() => {
    if (messages && messages.length > 0 && currentUser) {
      const lastMsg = messages[messages.length - 1];
      if ((lastMsg as any).sender !== currentUser._id) {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");
        audio.play().catch(() => { }); // catch silent errors
      }
    }
  }, [messages?.length, currentUser?._id]);

  // 📜 auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ mark seen when chat opens
  useEffect(() => {
    if (currentUser && conversationId) {
      markSeen({
        conversationId,
        userId: currentUser._id,
      });
    }
  }, [conversationId, currentUser]);

  // ⏳ loading
  if (messages === undefined || currentUser === undefined || conversation === undefined) {
    return <p className="p-4">Loading messages...</p>;
  }

  // ❌ no user or conversation
  if (currentUser === null || conversation === null) {
    return <p className="p-4 text-red-500">Chat not found</p>;
  }

  const otherUser = conversation?.otherUser;
  const isOnline = !conversation.isGroup && otherUser?.lastSeen && (Date.now() - otherUser.lastSeen < 60000);

  // 🔵 send/edit message
  const handleSend = async () => {
    if (!text.trim()) return;

    if (editingId) {
      await updateMessage({
        messageId: editingId,
        userId: currentUser._id,
        body: text,
      });
      setEditingId(null);
    } else {
      await sendMessage({
        conversationId,
        sender: currentUser._id,
        body: text,
        replyTo: replyingTo?._id,
      });
      setReplyingTo(null);
    }

    // stop typing when action done
    await setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: false,
    });

    setText("");
  };

  // 🔵 handle image upload
  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // get upload URL
    const postUrl = await generateUploadUrl();

    // post file
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();

    // send message with storageId
    await sendMessage({
      conversationId,
      sender: currentUser._id,
      body: file.name, // or "Sent an image"
      imageStorageId: storageId,
    });
  };

  // 🔵 handle delete
  const handleDelete = async (messageId: Id<"messages">) => {
    if (confirm("Delete this message?")) {
      await deleteMessage({ messageId, userId: currentUser._id });
    }
  };

  // 🔵 handle typing
  const handleTyping = async (value: string) => {
    setText(value);

    await setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: true,
    });

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(() => {
      setTyping({
        conversationId,
        userId: currentUser._id,
        isTyping: false,
      });
    }, 1500);
  };

  // 🔍 filter messages
  const filteredMessages = messages.filter((m: any) =>
    m.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allTyping = typingUsers?.filter((t: any) => t.userId !== currentUser._id && t.isTyping);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 🟢 Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 overflow-hidden relative flex items-center justify-center">
            {conversation.isGroup ? (
              <span className="text-xl">👥</span>
            ) : otherUser?.imageUrl ? (
              <img src={otherUser.imageUrl} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold uppercase transition-all">
                {(otherUser?.name || otherUser?.email || "U")[0]}
              </div>
            )}
            {!conversation.isGroup && isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <p className="font-semibold">{conversation.isGroup ? conversation.name : (otherUser?.name || otherUser?.email || "User")}</p>
            <p className="text-[10px] text-gray-500">
              {conversation.isGroup
                ? `${conversation.members?.length} members`
                : (isOnline ? "Online" : otherUser?.lastSeen ? `Last seen ${new Date(otherUser.lastSeen).toLocaleTimeString()}` : "Offline")}
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 Search Bar */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {filteredMessages.length === 0 && (
          <p className="text-gray-400 text-center">No messages found</p>
        )}

        {filteredMessages.map((m: any) => {
          const isMe = m.sender === currentUser._id;
          const time = new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={m._id}
              className={`max-w-[70%] group relative ${isMe ? "ml-auto" : "mr-auto"
                }`}
            >
              {/* Reply Preview */}
              {m.repliedToMsg && (
                <div
                  className={`text-[10px] p-2 mb-1 rounded-t-lg opacity-60 border-l-2 bg-gray-100 ${isMe ? "border-blue-400" : "border-gray-400"
                    }`}
                >
                  {m.repliedToMsg.body}
                </div>
              )}

              <div
                className={`px-4 py-2.5 rounded-2xl shadow-sm transition-all ${isMe
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                  }`}
              >
                {m.imageUrl && (
                  <img
                    src={m.imageUrl}
                    alt="Uploaded"
                    className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(m.imageUrl, "_blank")}
                  />
                )}
                <div className="text-sm leading-relaxed">{m.body}</div>
                <div className="flex items-center justify-end gap-1.5 mt-1.5">
                  {m.isEdited && (
                    <span className="text-[9px] opacity-60 mr-1 italic">
                      (edited)
                    </span>
                  )}
                  <p className="text-[10px] opacity-70 font-medium">{time}</p>
                  {isMe && (
                    <p className="text-[10px] opacity-90 font-bold shrink-0">
                      {m.seenBy?.length > 1 ? "✔✔ Seen" : "✔ Sent"}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions Button */}
              <div
                className={`absolute top-0 mt-1 hidden group-hover:flex items-center gap-1.5 ${isMe ? "right-full mr-3" : "left-full ml-3"
                  }`}
              >
                <button
                  onClick={() => setReplyingTo(m)}
                  className="p-1 px-2 rounded-lg bg-white border shadow-sm text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Reply
                </button>
                {isMe && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(m._id);
                        setText(m.body);
                      }}
                      className="p-1 px-2 rounded-lg bg-white border shadow-sm text-[10px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="p-1 px-2 rounded-lg bg-white border shadow-sm text-[10px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Del
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview in Input */}
      {replyingTo && (
        <div className="px-4 py-2 bg-slate-50 border-t border-blue-100 flex justify-between items-center animate-in slide-in-from-bottom-1 duration-200">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Replying to</span>
            <span className="text-xs text-slate-600 truncate max-w-md italic">"{replyingTo.body}"</span>
          </div>
          <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm text-xs">✕</button>
        </div>
      )}

      {/* Typing indicators */}
      {allTyping && allTyping.length > 0 && (
        <div className="px-4 py-1 text-[10px] text-slate-500 animate-pulse font-medium bg-white">
          {allTyping.map((t: any) => t.userName).join(", ")} {allTyping.length > 1 ? "are" : "is"} typing...
        </div>
      )}

      {/* input area */}
      <div className="p-4 bg-white border-t flex gap-3 items-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 left-4 bg-white border rounded-2xl shadow-xl p-3 grid grid-cols-6 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
            {["😀", "😂", "🥰", "👍", "🔥", "🙏", "❤️", "✨", "🎉", "😎", "🤔", "🙌"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText(text + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-xl hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <input
          type="file"
          hidden
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSend}
        />
        <div className="flex gap-1">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2.5 text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition-all"
            title="Add Emoji"
          >
            <span className="text-xl">😊</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Send Image"
          >
            <span className="text-xl">🖼️</span>
          </button>
        </div>

        <textarea
          className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[44px] max-h-32 transition-all resize-none shadow-sm"
          placeholder="Type a message..."
          rows={1}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
        >
          <span className="text-lg">➔</span>
        </button>
      </div>
    </div>
  );
}
