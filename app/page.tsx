"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useCallback } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const storeUser = useMutation(api.users.store);

  const syncUser = useCallback(async () => {
    if (!user) return;

    console.log("[Page] Clerk user detected:", user.id);
    console.log("[Page] Calling Convex mutation api.users.store...");

    try {
      const id = await storeUser({
        clerkId: user.id,
        name: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
      });
      console.log("[Page] User stored in Convex with id:", id);
    } catch (err) {
      console.error("[Page] Failed to store user in Convex:", err);
    }
  }, [user, storeUser]);

  useEffect(() => {
    if (isLoaded && user) {
      syncUser();
    }
  }, [isLoaded, user, syncUser]);

  return (
    <main className="flex h-screen items-center justify-center gap-4">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <div className="flex items-center gap-4">
          <p>Welcome to Tars Chat</p>
          <UserButton />
        </div>
      </SignedIn>
    </main>
  );
}