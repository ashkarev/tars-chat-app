"use client";

import React from "react";
import Image from "next/image";

export function Avatar({
    src,
    name,
    size = "md",
    status
}: {
    src?: string;
    name?: string;
    size?: "sm" | "md" | "lg";
    status?: "online" | "offline";
}) {
    const sizeClasses = {
        sm: "w-8 h-8 text-[10px]",
        md: "w-11 h-11 text-xs",
        lg: "w-14 h-14 text-sm"
    };

    return (
        <div className={`relative shrink-0 ${sizeClasses[size]} animate-in fade-in zoom-in duration-300`}>
            <div className="w-full h-full rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden border border-indigo-100/50 transition-all hover:scale-105 group-hover:shadow-md">
                {src ? (
                    <Image src={src} alt={name ?? "avatar"} fill className="object-cover" />
                ) : (
                    <span className="font-bold text-indigo-500 uppercase">
                        {(name || "U")[0]}
                    </span>
                )}
            </div>
            {status === "online" && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm ring-2 ring-emerald-500/10" />
            )}
        </div>
    );
}

export function Badge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="bg-linear-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shadow-indigo-200 min-w-[20px] text-center animate-in zoom-in duration-300">
            {count > 99 ? "99+" : count}
        </span>
    );
}

export function IconButton({
    children,
    onClick,
    active,
    variant = "ghost",
    title
}: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    variant?: "ghost" | "solid";
    title?: string;
}) {
    const variants = {
        ghost: `hover:bg-slate-100 text-slate-400 hover:text-indigo-600`,
        solid: `bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:saturate-150 shadow-md shadow-indigo-100`
    };

    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-2.5 rounded-2xl transition-all duration-200 active:scale-90 ${variants[variant]} ${active ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "border border-transparent"}`}
        >
            {children}
        </button>
    );
}
