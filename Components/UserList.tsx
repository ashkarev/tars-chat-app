"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";   // ✅ added

export default function UserList({
  onSelectConversation,
}: {
  onSelectConversation: (id: Id<"conversations">) => void;
}) {
  const [search, setSearch] = useState("");

  // 🔥 get clerk user
  const { user } = useUser();

  // queries
  const users = useQuery(api.users.getAllUsers);

  // 🔥 pass clerkId to Convex
  const currentUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip"
  );

  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  // loading
  if (users === undefined || currentUser === undefined) {
    return <p className="p-4">Loading...</p>;
  }

  // filter users
  const filteredUsers = users.filter((u) =>
    (u.name || u.email || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleUserClick = async (otherUserId: Id<"users">) => {
    console.log("USER CLICKED");
    console.log("CURRENT USER =", currentUser);

    if (!currentUser) return;

    const convoId = await createConversation({
      user1: currentUser._id,
      user2: otherUserId,
    });

    console.log("SUCCESS convoId =", convoId);

    onSelectConversation(convoId);
  };

  return (
    <div className="border p-4 h-full overflow-y-auto">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-3 w-full rounded"
      />

      <h3 className="font-semibold mb-2">Users</h3>

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