"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function UserList({
  onSelectConversation,
}: {
  onSelectConversation: (id: Id<"conversations">) => void;
}) {
  const [search, setSearch] = useState("");

  const users = useQuery(api.users.getAllUsers);
  const currentUser = useQuery(api.users.getCurrentUser);
  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  // ⏳ loading state
  if (!users || currentUser === undefined) return <p>Loading...</p>;

  // 🔍 filter users
  const filteredUsers = users.filter((u) =>
    (u.name || u.email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 👉 handle click user
  const handleUserClick = async (otherUserId: Id<"users">) => {
    if (!currentUser) return;

    try {
      const convoId = await createConversation({
        user1: currentUser._id,
        user2: otherUserId,
      });

      console.log("Conversation created/opened:", convoId);

      // ✅ send conversation id to parent (Home)
      onSelectConversation(convoId);
    } catch (err) {
      console.error("Error creating conversation:", err);
    }
  };

  return (
    <div className="border p-4 h-full overflow-y-auto">
      {/* 🔍 Search */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-3 w-full rounded"
      />

      <h3 className="font-semibold mb-2">Users</h3>

      {/* 👥 Users List */}
      {filteredUsers.length === 0 ? (
        <p className="text-gray-500">No users found</p>
      ) : (
        filteredUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => handleUserClick(user._id)}
            className="p-2 border-b cursor-pointer hover:bg-gray-100 rounded"
          >
            {user.name && user.name.trim() !== ""
              ? user.name
              : user.email}
          </div>
        ))
      )}
    </div>
  );
}