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
  const data = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const conversations = data?.conversations;

  // ⏳ loading state
  if (!currentUser || data === undefined) {
    return <p className="p-4">Loading chats...</p>;
  }

  // ❌ no chats yet
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-gray-500">
        No conversations yet. Start chatting with someone.
      </div>
    );
  }

  return (
    <div className="p-4 border-r h-full overflow-y-auto">
      <h2 className="font-semibold mb-3 text-gray-500 text-xs uppercase tracking-wider">All Messages</h2>

      {conversations.map((c: any) => {
        const isOnline = c.otherUser?.lastSeen && (Date.now() - c.otherUser.lastSeen < 60000);

        return (
          <div
            key={c._id}
            onClick={() => onSelectConversation(c._id)}
            className="p-3 border-b cursor-pointer hover:bg-gray-100 rounded flex justify-between items-center transition-all group"
          >
            <div className="flex gap-3 items-center relative">
              {/* 👤 User/Group Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-50 overflow-hidden shrink-0 relative flex items-center justify-center">
                {c.isGroup ? (
                  <span className="text-xl">👥</span>
                ) : c.otherUser?.imageUrl ? (
                  <img
                    src={c.otherUser.imageUrl}
                    alt={c.otherUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-blue-500 font-bold uppercase">
                    {(c.otherUser?.name || c.otherUser?.email || "U")[0]}
                  </div>
                )}
              </div>

              {/* 🟢 Online Status Dot (only for non-groups) */}
              {!c.isGroup && isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}

              <div className="overflow-hidden">
                <p className="font-medium truncate">
                  {c.isGroup ? c.name : (c.otherUser?.name?.trim() ? c.otherUser.name : (c.otherUser?.email || "User"))}
                </p>

                <p className="text-xs text-gray-500 truncate w-[180px]">
                  {c.lastMessage ? c.lastMessage.body : "No messages yet"}
                </p>
              </div>
            </div>

            {/* 🔵 unread badge */}
            {c.unreadCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full shrink-0 font-bold">
                {c.unreadCount}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}