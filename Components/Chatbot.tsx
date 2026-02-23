"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChatBox({
  conversationId,
}: {
  conversationId: Id<"conversations">;
}) {
  // 🔵 messages
  const messages = useQuery(api.messages.getMessages, { conversationId });

  // 🔵 current logged in convex user (NO clerkId needed)
 const currentUser = useQuery(api.users.getCurrentUser);

  // 🔵 typing
  const typingUsers = useQuery(api.typing.getTyping, { conversationId });

  // 🔵 mutations
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);

  const [text, setText] = useState("");

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

    setText("");
  };

  return (
    <div className="h-full flex flex-col">
      {/* messages area */}
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
              {m.body}
            </div>
          );
        })}
      </div>

      {/* typing indicator */}
      {typingUsers &&
        typingUsers
          .filter((t) => t.userId !== currentUser._id)
          .map((t) => (
            <p key={t._id} className="text-sm text-gray-500 px-4 pb-2">
              Typing...
            </p>
          ))}

      {/* input box */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 outline-none"
          value={text}
          placeholder="Type message..."
          onChange={async (e) => {
            setText(e.target.value);

            // typing true
            await setTyping({
              conversationId,
              userId: currentUser._id,
              isTyping: true,
            });

            // auto stop typing after 2 sec
            setTimeout(() => {
              setTyping({
                conversationId,
                userId: currentUser._id,
                isTyping: false,
              });
            }, 2000);
          }}
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