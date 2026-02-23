"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useCallback, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

import UserList from "@/Components/UserList";
import ChatBox from "@/Components/Chatbot";   // 👈 add this

export default function Home() {
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const { user, isLoaded } = useUser();
  const storeUser = useMutation(api.users.store);

const syncUser = useCallback(async () => {
  if (!user) return;

  console.log("Storing user:", user.id, user.fullName); // 👈 ADD THIS LINE

  try {
    await storeUser({
      clerkId: user.id,
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
    });
  } catch (err) {
    console.error("Error storing user:", err);
  }
}, [user, storeUser]);
  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [isLoaded, user, syncUser]);

  return (
    <div className="h-screen flex">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 border-r p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Users</p>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-3 py-1 bg-blue-500 text-white rounded">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>

        {/* pass setter to UserList */}
        <UserList onSelectConversation={setConversationId} />
      </div>

      {/* RIGHT CHAT AREA */}
      <div className="flex-1">
        {conversationId ? (
          <ChatBox conversationId={conversationId} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}