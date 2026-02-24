"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useCallback, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

import ChatBox from "@/Components/Chatbot";
import ConversationLists from "@/Components/ConversationLists";
import CreateGroupModal from "@/Components/CreateGroupModal";
import Sidebar from "@/Components/Sidebar";

export default function Home() {
  const [conversationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);

  const { user, isLoaded } = useUser();
  const storeUser = useMutation(api.users.store);
  const currentUser = useQuery(api.users.getCurrentUser);
  const updatePresence = useMutation(api.users.updatePresence);
  const markAsSeen = useMutation(api.messages.markAsSeen);

  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Sync presence
  useEffect(() => {
    if (!currentUser) return;
    updatePresence({ userId: currentUser._id });
    const interval = setInterval(() => {
      updatePresence({ userId: currentUser._id });
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser, updatePresence]);

  // Sync user to convex
  useEffect(() => {
    const run = async () => {
      if (!isLoaded || !user) return;
      await storeUser({
        clerkId: user.id,
        name: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
      });
    };
    run();
  }, [isLoaded, user, storeUser]);

  const handleSelectConversation = async (id: Id<"conversations">) => {
    setConversationId(id);
    if (currentUser) {
      await markAsSeen({
        conversationId: id,
        userId: currentUser._id,
      });
    }
  };

  return (
    <main className="h-screen w-full flex overflow-hidden">
      <SignedOut>
        {/* LANDING PAGE UI */}
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {/* Left Side: Branding */}
          <div className="md:w-1/2 h-1/2 md:h-full bg-gradient-to-tr from-blue-700 via-blue-600 to-blue-400 p-12 flex flex-col justify-center text-white relative overflow-hidden">
            <div className="absolute top-20 -left-10 w-60 h-60 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 -right-10 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl" />

            <div className="max-w-md relative z-10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-8 transform -rotate-3 transition-transform hover:rotate-0">
                <span className="text-blue-600 font-black text-3xl italic tracking-tighter">T</span>
              </div>
              <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
                TARS
              </h1>
              <p className="text-xl font-medium text-blue-100 mb-2">
                Real-time messaging made simple.
              </p>
              <p className="text-blue-200/80 leading-relaxed max-w-sm">
                Connect with anyone, anywhere. Instant communication with advanced group features, media sharing, and real-time presence.
              </p>
            </div>
          </div>

          {/* Right Side: Auth Card */}
          <div className="md:w-1/2 h-1/2 md:h-full bg-slate-50 flex items-center justify-center p-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-blue-200/50 w-full max-w-sm border border-slate-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-sm text-slate-500">Please sign in to continue to TARS</p>
              </div>

              <SignInButton mode="modal">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] mb-4">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="w-full bg-white hover:bg-slate-50 text-blue-600 font-bold py-4 rounded-2xl border-2 border-slate-100 transition-all active:scale-[0.98]">
                  Create Account
                </button>
              </SignUpButton>

              <p className="text-center mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Student Project • 2026
              </p>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* MAIN APP UI (3 columns) */}
        <Sidebar aria-label="Main Navigation" />

        {/* Column 2: Chat List Panel */}
        <div className="w-[380px] h-full flex flex-col bg-white border-r border-slate-100 shadow-sm relative group">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Messages</h2>
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="w-10 h-10 flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                title="Create Group"
              >
                <span className="text-xl font-bold">+</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <ConversationLists onSelectConversation={handleSelectConversation} />
          </div>

          {isCreatingGroup && (
            <CreateGroupModal
              onClose={() => setIsCreatingGroup(false)}
              onGroupCreated={(id) => {
                handleSelectConversation(id);
                setIsCreatingGroup(false);
              }}
            />
          )}
        </div>

        {/* Column 3: Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-slate-50">
          {conversationId ? (
            <ChatBox conversationId={conversationId} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mb-8 rotate-3">
                <span className="text-6xl animate-bounce">💬</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Select a conversation</h3>
              <p className="text-slate-500 max-w-[280px]">
                Choose a chat from the left to start messaging. Your chats are encrypted and private.
              </p>
            </div>
          )}
        </div>
      </SignedIn>
    </main>
  );
}