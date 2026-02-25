"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { Avatar, Badge } from "./UI";

type Conversation = {
  _id: Id<"conversations">;
  isGroup: boolean;
  name?: string;
  members?: unknown[];
  otherUser?: { name?: string; email?: string; imageUrl?: string; lastSeen?: number };
  lastMessage?: { _creationTime: number; body: string; sender: Id<"users"> };
  unreadCount: number;
};

export default function ConversationLists({
  onSelectConversation,
  selectedId,
}: {
  onSelectConversation: (id: Id<"conversations">) => void;
  selectedId?: Id<"conversations"> | null;
}) {
  const [search, setSearch] = useState("");

  const currentUser = useQuery(api.users.getCurrentUser);
  const data = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const conversations = data?.conversations;

  if (!currentUser || data === undefined) {
    return (
      <div className="flex flex-col gap-4 p-6 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 items-center animate-pulse">
            <div className="w-11 h-11 bg-slate-50 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-slate-50 rounded w-1/3" />
              <div className="h-2.5 bg-slate-50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const filtered = (conversations as Conversation[] | undefined)?.filter((c) => {
    const name = c.isGroup ? c.name : (c.otherUser?.name || c.otherUser?.email || "User");
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="h-full flex flex-col">
      {/* Search Input (Minimal SaaS) */}
      <div className="px-6 pb-6 pt-2">
        <div className="relative group/search">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1">
        {!filtered || filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-2xl grayscale opacity-50">
              🔍
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No results</p>
          </div>
        ) : (
          filtered.map((c: Conversation) => {
            const isOnline = !c.isGroup && c.otherUser?.lastSeen && (Date.now() - c.otherUser.lastSeen < 60000);
            const time = c.lastMessage ? new Date(c.lastMessage._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
            const isSelected = selectedId === c._id;

            return (
              <button
                key={c._id}
                onClick={() => onSelectConversation(c._id)}
                className={`w-full p-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 group relative border border-transparent ${isSelected
                  ? "bg-linear-to-r from-indigo-50/80 to-indigo-50 shadow-sm border-indigo-100/50"
                  : "hover:bg-slate-50/80 hover:shadow-sm"
                  }`}
              >
                <Avatar
                  src={c.isGroup ? "" : c.otherUser?.imageUrl}
                  name={c.isGroup ? c.name : (c.otherUser?.name || c.otherUser?.email)}
                  status={isOnline ? "online" : undefined}
                  size="md"
                />

                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className={`text-sm font-semibold truncate transition-colors ${isSelected ? "text-indigo-950" : "text-slate-900"}`}>
                      {c.isGroup ? c.name : (c.otherUser?.name || c.otherUser?.email || "User")}
                    </h3>
                    {time && <span className="text-[10px] font-bold text-slate-400 opacity-60 shrink-0 ml-2 uppercase tabular-nums">{time}</span>}
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <p className={`truncate mr-2 font-medium ${isSelected ? "text-indigo-600/70" : "text-slate-500"}`}>
                      {c.lastMessage ? (
                        <span className="flex items-center gap-1">
                          {c.lastMessage.sender === currentUser._id && (
                            <span className="text-indigo-500 font-black">✓</span>
                          )}
                          {c.lastMessage.body}
                        </span>
                      ) : "Start chatting"}
                    </p>
                    <Badge count={c.unreadCount} />
                  </div>
                </div>

                {/* Selection Notch */}
                {isSelected && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full animate-in slide-in-from-left duration-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
