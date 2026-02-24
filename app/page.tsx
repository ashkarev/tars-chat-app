"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useCallback, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

import ChatBox from "@/Components/Chatbot";
import ConversationLists from "@/Components/ConversationLists";

export default function Home() {
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const { user, isLoaded } = useUser();

  // 🔵 store user
  const storeUser = useMutation(api.users.store);

  // 🔵 get current convex user
  const currentUser = useQuery(api.users.getCurrentUser);

  // 🔵 mark messages as seen
  const markAsSeen = useMutation(api.messages.markAsSeen);

  // 🔵 sync user to convex
  const syncUser = useCallback(async () => {
    if (!user) return;

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
    const run = async () => {
      if (!isLoaded || !user) return;

      await storeUser({
        clerkId: user.id,
        name: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
      });
    };

    run();
  }, [isLoaded, user, storeUser]);

  // 🔥 THIS IS THE FIX
  const handleSelectConversation = async (id: Id<"conversations">) => {
    setConversationId(id);

    // mark messages as seen
    if (currentUser) {
      await markAsSeen({
        conversationId: id,
        userId: currentUser._id,
      });
    }
  };

  return (
    <div className="h-screen flex">
      {/* LEFT SIDEBAR */}
      <div className="w-1/3 border-r p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold">Chats</p>

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

        {/* 🔥 IMPORTANT: use handleSelectConversation */}
        <ConversationLists
          onSelectConversation={handleSelectConversation}
        />
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