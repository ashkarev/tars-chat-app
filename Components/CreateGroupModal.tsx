"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Avatar } from "./UI";

export default function CreateGroupModal({
    onClose,
    onGroupCreated,
}: {
    onClose: () => void;
    onGroupCreated: (id: Id<"conversations">) => void;
}) {
    const [name, setName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const users = useQuery(api.users.getAllUsers);
    const currentUser = useQuery(api.users.getCurrentUser);
    const createGroup = useMutation(api.conversations.createGroup);

    if (!users || !currentUser) return null;

    const handleToggleUser = (userId: Id<"users">) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleCreate = async () => {
        if (!name.trim() || selectedUsers.length < 1) return;

        const convoId = await createGroup({
            name,
            members: [...selectedUsers, currentUser._id],
            admin: currentUser._id,
        });

        onGroupCreated(convoId);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div
                className="bg-white rounded-4xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100/50"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 bg-blue-400 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div>
                        <h2 className="text-xl font-bold text-black tracking-tight">New Group</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SaaS community space</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center bg-white text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all active:scale-90 border border-slate-100"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Group Name</label>
                        <input
                            type="text"
                            placeholder="Engineering, Design, etc..."
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3.5 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-medium placeholder:text-slate-300 shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Invite Members</label>
                        <div className="max-h-60 overflow-y-auto bg-slate-50 border border-slate-100 rounded-3xl p-2 space-y-1">
                            {users
                                .filter((u) => u._id !== currentUser._id)
                                .map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => handleToggleUser(user._id)}
                                        className={`w-full p-3 rounded-xl flex items-center justify-between transition-all duration-200 ${selectedUsers.includes(user._id)
                                            ? "bg-white shadow-sm ring-1 ring-indigo-100"
                                            : "hover:bg-white/60 text-slate-600"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar src={user.imageUrl} name={user.name} size="sm" />
                                            <span className={`text-sm font-semibold truncate ${selectedUsers.includes(user._id) ? "text-indigo-600" : "text-slate-700"}`}>{user.name || user.email}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedUsers.includes(user._id) ? "bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100" : "border-slate-200"
                                            }`}>
                                            {selectedUsers.includes(user._id) && <span className="text-white font-bold text-[10px]">✓</span>}
                                        </div>
                                    </button>
                                ))}
                            {users.filter(u => u._id !== currentUser._id).length === 0 && (
                                <p className="p-6 text-center text-xs text-slate-400 font-medium italic">No other users to invite</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-2">
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || selectedUsers.length < 1}
                        className="w-full py-4 bg-linear-to-r from-indigo-600 to-violet-600 hover:saturate-150 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-300 text-white font-semibold rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>Launch Group</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
