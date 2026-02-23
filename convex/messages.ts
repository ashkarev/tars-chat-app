import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ✅ send message (FIXED — removed auth check)
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: args.sender,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

// ✅ get messages (same as before)
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});