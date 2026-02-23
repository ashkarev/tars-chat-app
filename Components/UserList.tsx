"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function UserList() {
  const users = useQuery(api.users.getAllUsers);

  if (!users) return <p>Loading...</p>;
  if (users.length === 0) return <p>No other users yet</p>;

  return (
    <div className="border p-4">
      <h3 className="font-semibold mb-2">Users</h3>

      {users.map((user) => (
        <div key={user._id} className="p-2 border-b">
          {user.name}
        </div>
      ))}
    </div>
  );
}