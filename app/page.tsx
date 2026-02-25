"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
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
        {/* PREMIUM AUTH LANDING PAGE */}
        <div className="flex-1 flex items-center justify-center p-6 bg-linear-to-br from-slate-50 via-slate-50 to-indigo-50/30">
          <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-16 h-16 bg-linear-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-100 mb-6 rotate-3">
                <span className="text-white font-black text-3xl italic tracking-tighter">T</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">TARS</h1>
              <p className="text-slate-500 font-medium mt-1">Modern messaging for individuals</p>
            </div>

            {/* Auth Card */}
            <div className="bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50">
              <div className="space-y-4">
                <SignInButton mode="modal">
                  <button className="w-full h-14 bg-linear-to-r from-indigo-600 to-violet-600 hover:saturate-150 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full h-14 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-2xl border border-slate-200 transition-all active:scale-[0.98]">
                    Create Account
                  </button>
                </SignUpButton>
              </div>

              <div className="mt-10 flex items-center gap-4 text-slate-300">
                <div className="h-px flex-1 bg-slate-100" />
                <span className="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">Production Ready</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
            </div>

            <p className="text-center mt-8 text-xs text-slate-400 font-medium italic">
              Experience the future of real-time communication.
            </p>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        {/* PREMIUM MAIN APP (3 columns) */}
        <div className="h-full flex w-full">
          {/* Column 1: Sidebar (Workspace) */}
          <div className={`${conversationId ? "hidden lg:flex" : "flex"}`}>
            <Sidebar aria-label="Main Navigation" />
          </div>

          {/* Column 2: Chat List Panel (300px) */}
          <div className={`${conversationId ? "hidden md:flex" : "flex"} w-full md:w-[300px] h-full flex-col bg-white border-r border-slate-100 relative group`}>
            <div className="p-6 pb-2 md:pb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900">Chats</h2>
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="w-9 h-9 flex items-center justify-center bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm active:scale-90"
                  title="New Conversation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <ConversationLists onSelectConversation={handleSelectConversation} selectedId={conversationId} />
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
          <div className={`${conversationId ? "flex" : "hidden md:flex"} flex-1 flex flex-col h-full bg-[#F8FAFC]`}>
            {conversationId ? (
              <ChatBox conversationId={conversationId} onBack={() => setConversationId(null)} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-10 rotate-3 transition-transform hover:rotate-0">
                  <span className="text-5xl text-sky-500 font-bold">Ready TO Start</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select a conversation</h3>
                <p className="text-slate-400 max-w-[260px] text-sm font-medium">
                  Pick a chat to start messaging or create a new group.
                </p>
              </div>
            )}
          </div>
        </div>
      </SignedIn>
    </main>
  );
}