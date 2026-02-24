import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// set typing status
export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("typing")
            .withIndex("by_conversation_user", (q) =>
                q.eq("conversationId", args.conversationId).eq("userId", args.userId)
            )
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { isTyping: args.isTyping });
        } else {
            await ctx.db.insert("typing", args);
        }
    },
});

// get typing users
export const getTyping = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const typing = await ctx.db
            .query("typing")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        const results = [];
        for (const t of typing) {
            const user = await ctx.db.get(t.userId);
            results.push({
                ...t,
                userName: user?.name || "Someone",
            });
        }
        return results;
    },
});
