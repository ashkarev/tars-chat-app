"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-800">Create Group</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Group Name</label>
                        <input
                            type="text"
                            placeholder="Enter group name..."
                            className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Members</label>
                        <div className="max-h-60 overflow-y-auto border rounded-xl divide-y">
                            {users
                                .filter((u) => u._id !== currentUser._id)
                                .map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => handleToggleUser(user._id)}
                                        className={`p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors ${selectedUsers.includes(user._id) ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                                {user.name?.[0] || user.email[0].toUpperCase()}
                                            </div>
                                            <span className="text-sm font-medium">{user.name || user.email}</span>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedUsers.includes(user._id) ? "bg-blue-500 border-blue-500 shadow-sm" : "border-gray-300"
                                            }`}>
                                            {selectedUsers.includes(user._id) && <span className="text-white text-[10px]">✓</span>}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name.trim() || selectedUsers.length < 1}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}
