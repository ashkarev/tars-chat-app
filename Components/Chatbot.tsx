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
  const messages = useQuery(api.messages.getMessages, { conversationId });
  const currentUser = useQuery(api.users.getCurrentUser);
  const sendMessage = useMutation(api.messages.send);

  const [text, setText] = useState("");

  // ⏳ loading
  if (messages === undefined || currentUser === undefined) {
    return <p className="p-4">Loading messages...</p>;
  }

  // ❌ no user found
  if (currentUser === null) {
    return <p className="p-4 text-red-500">User not found</p>;
  }

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
              {m.body}
            </div>
          );
        })}
      </div>

      {/* input */}
      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 outline-none"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type message..."
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