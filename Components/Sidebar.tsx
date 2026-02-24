"use client";

import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { IconButton } from "./UI";

export default function Sidebar() {
    const { user } = useUser();

    return (
        <div className="w-20 bg-slate-900 flex flex-col items-center py-6 justify-between border-r border-slate-800">
            <div className="flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-300">
                    <span className="text-white font-black text-xl italic tracking-tighter">T</span>
                </div>

                {/* Navigation Items (Placeholders for UX feel) */}
                <div className="flex flex-col gap-4 text-slate-500">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white shadow-inner">
                        <span>💬</span>
                    </div>
                    {/* Future icons like settings, contacts etc can go here */}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <SignOutButton>
                    <button className="text-slate-500 hover:text-red-400 p-2 transition-colors" title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </SignOutButton>

                <div className="border-t border-slate-800 pt-6">
                    <UserButton
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-10 h-10 rounded-2xl border-2 border-slate-700 hover:border-blue-500 transition-all"
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
