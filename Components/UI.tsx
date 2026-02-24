"use client";

import React from "react";

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
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base"
    };

    return (
        <div className={`relative shrink-0 ${sizeClasses[size]}`}>
            <div className="w-full h-full rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border border-slate-100 transition-all group-hover:shadow-sm">
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span className="font-bold text-blue-500 uppercase">
                        {(name || "U")[0]}
                    </span>
                )}
            </div>
            {status === "online" && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
            )}
        </div>
    );
}

export function Badge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm min-w-[20px] text-center">
            {count}
        </span>
    );
}

export function IconButton({
    children,
    onClick,
    active,
    variant = "ghost"
}: {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    variant?: "ghost" | "solid";
}) {
    const variants = {
        ghost: `hover:bg-slate-100 text-slate-500 hover:text-slate-900`,
        solid: `bg-blue-600 text-white hover:bg-blue-700 shadow-sm`
    };

    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-xl transition-all duration-200 active:scale-95 ${variants[variant]} ${active ? "bg-slate-100 text-slate-900" : ""}`}
        >
            {children}
        </button>
    );
}
