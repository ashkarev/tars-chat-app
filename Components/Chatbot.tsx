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
  const setTyping = useMutation(api.typing.setTyping);
  const markSeen = useMutation(api.messages.markAsSeen);

  const [text, setText] = useState("");
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

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
  if (messages === undefined || currentUser === undefined) {
    return <p className="p-4">Loading messages...</p>;
  }

  // ❌ no user
  if (currentUser === null) {
    return <p className="p-4 text-red-500">User not found</p>;
  }

  // 🔵 send message
  const handleSend = async () => {
    if (!text.trim()) return;

    await sendMessage({
      conversationId,
      sender: currentUser._id,
      body: text,
    });

    // stop typing when message sent
    await setTyping({
      conversationId,
      userId: currentUser._id,
      isTyping: false,
    });

    setText("");
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

  return (
    <div className="h-full flex flex-col">
      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.length === 0 && (
          <p className="text-gray-400">No messages yet</p>
        )}

        {messages.map((m) => {
          const isMe = m.sender === currentUser._id;

          return (
            <div
              key={m._id}
              className={`max-w-[70%] px-3 py-2 rounded ${
                isMe
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200 text-black"
              }`}
            >
              <div>{m.body}</div>

              {/* ✔✔ status */}
              {isMe && (
                <p className="text-xs mt-1 text-right opacity-80">
                  {m.seenBy?.length > 1
                    ? "✔✔ Seen"
                    : m.deliveredTo?.length > 1
                    ? "✔✔ Delivered"
                    : "✔ Sent"}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* typing indicator */}
      {typingUsers &&
        typingUsers
          .filter((t) => t.userId !== currentUser._id && t.isTyping)
          .map((t) => (
            <p key={t._id} className="text-sm text-gray-500 px-4 pb-2">
              Someone is typing...
            </p>
          ))}

      {/* input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 outline-none"
          value={text}
          placeholder="Type message..."
          onChange={(e) => handleTyping(e.target.value)}
        />

        <button
          onClick={handleSend}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}