"use client";

import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";

export default function Sidebar() {
    useUser();

    return (
        <div className="w-20 bg-white flex flex-col items-center py-8 justify-between border-r border-slate-100 shadow-[2px_0_12px_rgba(0,0,0,0.02)] z-30">
            <div className="flex flex-col items-center gap-10">
                {/* Logo */}
                <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 transform rotate-3 hover:rotate-0 transition-all duration-500 cursor-pointer group">
                    <span className="text-white font-black text-xl italic tracking-tighter group-hover:scale-110 transition-transform">T</span>
                </div>

                {/* Nav Placeholder Icons */}
                <div className="flex flex-col gap-6">
                    {["💬", "👥", "⚙️"].map((icon, i) => (
                        <button
                            key={i}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 hover:bg-blue-100 hover:shadow-sm group relative ${i === 0 ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-300"}`}
                        >
                            <span className={`text-lg grayscale group-hover:grayscale-0 transition-all duration-300 ${i === 0 ? "grayscale-0" : ""}`}>{icon}</span>
                            {i === 0 && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col items-center gap-6">
                <SignOutButton>
                    <button className="text-slate-300 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all active:scale-95" title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                </SignOutButton>

                <div className="p-1 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                    <UserButton />
                </div>
            </div>
        </div>
    );
}
