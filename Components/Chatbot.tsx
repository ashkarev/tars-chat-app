"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar, IconButton } from "./UI";
import Image from "next/image";

export default function ChatBox({
  conversationId,
  onBack,
}: {
  conversationId: Id<"conversations">;
  onBack?: () => void;
}) {
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const typingUsers = useQuery(api.typing.getTyping, { conversationId });
  const conversation = useQuery(
    api.conversations.getConversation,
    currentUser ? { conversationId, userId: currentUser._id } : "skip",
  );

  const sendMessage = useMutation(api.messages.send);
  const updateMessage = useMutation(api.messages.update);
  const deleteMessage = useMutation(api.messages.remove);
  const setTyping = useMutation(api.typing.setTyping);
  const markSeen = useMutation(api.messages.markAsSeen);
  const generateUploadUrl = useMutation(api.upload.generateUploadUrl);
  const leaveGroup = useMutation(api.conversations.leaveGroup);

  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ _id: Id<"messages">; body: string } | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  //  notification sound
  useEffect(() => {
    if (messages && messages.length > 0 && currentUser) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && (lastMsg as unknown as { sender: Id<"users"> }).sender !== currentUser._id) {
        const audio = new Audio(
          "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
        );
        audio.play().catch(() => { });
      }
    }
  }, [messages, currentUser, currentUser?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currentUser && conversationId) {
      markSeen({ conversationId, userId: currentUser._id });
    }
  }, [conversationId, currentUser, markSeen]);

  if (
    messages === undefined ||
    currentUser === undefined ||
    conversation === undefined
  ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
        <div className="h-4 bg-slate-100 rounded w-24" />
      </div>
    );
  }

  if (currentUser === null || conversation === null) {
    return (
      <p className="p-12 text-center text-slate-400 font-medium">
        Chat not found
      </p>
    );
  }

  const otherUser = conversation?.otherUser;
  const isOnline =
    !conversation.isGroup &&
    otherUser?.lastSeen &&
    Date.now() - otherUser.lastSeen < 60000;

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
    await setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: false,
    });
    setText("");
  };

  const handleLeaveGroup = async () => {
    if (confirm("Are you sure you want to leave this group?")) {
      await leaveGroup({ conversationId });
      if (onBack) onBack();
    }
  };

  const handleImageSend = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const postUrl = await generateUploadUrl();
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = await result.json();
    await sendMessage({
      conversationId,
      sender: currentUser._id,
      body: file.name,
      imageStorageId: storageId,
    });
  };

  const handleDelete = async (messageId: Id<"messages">) => {
    if (confirm("Delete this message?")) {
      await deleteMessage({ messageId, userId: currentUser._id });
    }
  };

  const handleTyping = async (value: string) => {
    setText(value);
    await setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: true,
    });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping({ conversationId, userId: currentUser._id, isTyping: false });
    }, 1500);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredMessages = (messages as any[]).filter((m) =>
    m.body.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTyping = (typingUsers as any[])?.filter(
    (t) => t.userId !== currentUser._id && t.isTyping,
  );

  return (
    <div className="h-full flex flex-col bg-[#F8FAFC] relative overflow-hidden">
      {/*  Premium SaaS Header */}
      <header className="px-8 py-5 bg-white/70 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          {/* Back Button for Mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}

          <Avatar
            src={conversation.isGroup ? "" : otherUser?.imageUrl}
            name={
              conversation.isGroup
                ? conversation.name
                : otherUser?.name || otherUser?.email
            }
            status={isOnline ? "online" : undefined}
            size="md"
          />
          <div>
            <h2 className="text-base font-semibold text-slate-900 leading-tight">
              {conversation.isGroup
                ? conversation.name
                : otherUser?.name || otherUser?.email || "User"}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isOnline && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              )}
              <p className="text-[11px] font-medium text-slate-400">
                {conversation.isGroup
                  ? `${conversation.members?.length} members`
                  : isOnline
                    ? "Online now"
                    : otherUser?.lastSeen
                      ? `Last active ${new Date(otherUser.lastSeen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                      : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group/search hidden lg:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-indigo-500 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="filter"
              className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[13px] w-32 focus:w-48 transition-all outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <IconButton title="Info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </IconButton>
          {conversation.isGroup && (
            <button
              onClick={handleLeaveGroup}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl transition-colors ml-1 border border-red-100/50 hover:shadow-sm"
              title="Leave Group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave
            </button>
          )}
        </div>
      </header>

      {/*  Messages Area */}
      <div className="flex-1  overflow-y-auto px-8 py-10 space-y-8 scroll-smooth no-scrollbar">
        <div className="flex flex-col gap-8">
          {filteredMessages.map((m, idx) => {
            const isMe = (m as { sender: Id<"users"> }).sender === currentUser._id;
            const time = new Date(m._creationTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const prevMsg = filteredMessages[idx - 1] as { sender: string; _creationTime: number } | undefined;
            const isSequential =
              prevMsg &&
              prevMsg.sender === m.sender &&
              m._creationTime - prevMsg._creationTime < 60000;

            return (
              <div
                key={m._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"} ${isSequential ? "-mt-6" : ""} animate-in fade-in slide-in-from-bottom-2 duration-500`}
              >
                <div
                  className={`max-w-[75%] group relative flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  {/* Sender Name for Groups */}
                  {conversation.isGroup && !isMe && !isSequential && (
                    <span className="text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase tracking-widest">
                      {m.senderName || "Member"}
                    </span>
                  )}

                  {/* Reply Context */}
                  {m.repliedToMsg && (
                    <div
                      className={`text-[10px] px-3 py-2 -mb-2 rounded-t-xl opacity-60 border-l-2 bg-slate-100/50 backdrop-blur-sm mx-1 ${isMe ? "border-indigo-400" : "border-slate-300"}`}
                    >
                      {m.repliedToMsg.body}
                    </div>
                  )}

                  <div
                    className={`relative px-4 py-3 rounded-2xl shadow-xs transition-all duration-300 ${isMe
                      ? "b bg-indigo-500  text-white rounded-tr-none hover:shadow-lg hover:shadow-indigo-200/50"
                      : "bg-[#F1F5F9] text-slate-900 rounded-tl-none hover:bg-slate-200/50"
                      }`}
                  >
                    {/* Image Render */}
                    {m.imageUrl && (
                      <div
                        className="mb-2 rounded-xl overflow-hidden cursor-pointer group/img shadow-sm border border-black/5 relative w-64 h-48"
                        onClick={() => window.open(m.imageUrl, "_blank")}
                      >
                        <Image
                          src={m.imageUrl}
                          alt="Uploaded"
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    )}

                    <div className="text-[14px] font-medium leading-relaxed">
                      {m.body}
                    </div>

                    <div
                      className={`flex items-center gap-2 mt-1.5 opacity-60 tabular-nums ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {m.isEdited && (
                        <span className="text-[8px] font-black uppercase tracking-widest">
                          (ed)
                        </span>
                      )}
                      <span className="text-[9px] font-bold">{time}</span>
                      {isMe && (
                        <span
                          className={`text-[10px] font-black ${m.seenBy?.length > 1 ? "text-emerald-300" : "text-white/50"}`}
                        >
                          {m.seenBy?.length > 1 ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>

                    {/* Quick Reactions / Hover Actions Menu */}
                    <div
                      className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1 z-30 ${isMe ? "right-full mr-3" : "left-full ml-3"} translate-y-2 group-hover:translate-y-0 duration-300`}
                    >
                      <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-1 flex items-center gap-0.5">
                        <button
                          onClick={() => setReplyingTo(m)}
                          className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                          title="Reply"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                        {isMe && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(m._id);
                                setText(m.body);
                              }}
                              className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(m._id)}
                              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5  "
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/*  Bottom Input Area (Floating) */}
      <footer className="p-6 bg-transparent z-20">
        <div className="max-w-[800px] mx-auto relative">
          {/* Reply/Edit Previews */}
          {replyingTo && (
            <div className="mb-3 p-3 bg-white border border-slate-100 rounded-2xl flex justify-between items-center group/reply animate-in slide-in-from-bottom-4 duration-300 shadow-sm border-l-4 border-l-indigo-500">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-0.5">
                  Replying to
                </span>
                <p className="text-xs text-slate-500 truncate italic font-medium">
                  &quot;{replyingTo.body}&quot;
                </p>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] shadow-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Typing Indicators */}
          {allTyping && allTyping.length > 0 && (
            <div className="absolute -top-6 left-6 flex items-center gap-2 animate-in fade-in slide-in-from-left duration-300">
              <div className="flex gap-1 items-center bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100">
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" />
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {allTyping[0].userName.split(" ")[0]} typing
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 items-end bg-white p-2.5 rounded-4xl border border-slate-100 shadow-lg shadow-slate-200/40 group focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all duration-300 px-4">
            <div className="flex items-center gap-1 mb-1">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSend}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${showEmojiPicker ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50 hover:text-indigo-500"}`}
              >
                <span className="text-xl grayscale hover:grayscale-0 transition-all">
                  😊
                </span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-indigo-500 rounded-full transition-colors"
              >
                <span className="text-lg grayscale hover:grayscale-0 transition-all">
                  🖼️
                </span>
              </button>
            </div>

            <textarea
              className="flex-1 bg-transparent border-none rounded-2xl px-2 py-3 text-[14px] focus:ring-0 outline-none min-h-[44px] max-h-40 transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="Type message..."
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
              className={`w-11 h-11 rounded-full transition-all flex items-center justify-center active:scale-90 shadow-lg ${!text.trim()
                ? "bg-slate-50 text-slate-300 border border-slate-100"
                : "bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-200 hover:saturate-150"
                }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transform rotate-45 -translate-x-0.5 translate-y-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-28 left-10 bg-white border border-slate-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-4 grid grid-cols-6 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 ring-1 ring-slate-900/5 backdrop-blur-3xl">
            {[
              "😀",
              "😂",
              "🥰",
              "👍",
              "🔥",
              "🙏",
              "❤️",
              "✨",
              "🎉",
              "😎",
              "🤔",
              "🙌",
              "💯",
              "🚀",
              "⚡",
              "✅",
              "🪄",
              "👀",
            ].map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  setText(text + emoji);
                  setShowEmojiPicker(false);
                }}
                className="text-2xl hover:bg-slate-50 p-2 rounded-xl transition-all active:scale-90 grayscale-0 hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </footer>
    </div>
  );
}
