"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Id } from "@/convex/_generated/dataModel";

export default function ConversationLists({
  onSelectConversation,
}: {
  onSelectConversation: (id: Id<"conversations">) => void;
}) {
  const { user, isLoaded } = useUser();

  // 🔥 get current logged in convex user
const currentUser = useQuery(api.users.getCurrentUser);
  // 🔥 get conversations only after currentUser loaded
  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  // ⏳ loading state
 if (!currentUser || conversations === undefined){
    return <p className="p-4">Loading chats...</p>;
  }

  // ❌ no chats yet
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No conversations yet. Start chatting with someone.
      </div>
    );
  }
console.log("CURRENT USER", currentUser);
  return (
    <div className="p-4 border-r h-full overflow-y-auto">
      <h2 className="font-semibold mb-3">Chats</h2>

      {conversations.map((c) => (
        <div
          key={c._id}
          onClick={() => onSelectConversation(c._id)}
          className="p-3 border-b cursor-pointer hover:bg-gray-100 rounded flex justify-between items-center"
        >
          <div>
            <p className="font-medium">
              {c.otherUser?.name || c.otherUser?.email || "Unknown User"}
            </p>

            <p className="text-sm text-gray-500 truncate w-[180px]">
              {c.lastMessage ? c.lastMessage.body : "No messages yet"}
            </p>
          </div>

          {/* 🔵 unread badge */}
          {c.unreadCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {c.unreadCount}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}