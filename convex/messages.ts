import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🔵 send message
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

      // 👇 important fix
      readBy: [args.sender],
    });
  },
});

// 🔵 get messages
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

// 🔥 mark messages as read (SAFE for old data)
export const markAsRead = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    for (const m of messages) {
      const readBy = m.readBy ?? []; // 👈 SAFE fallback

      if (
        m.sender.toString() !== args.userId.toString() &&
        !readBy.includes(args.userId)
      ) {
        await ctx.db.patch(m._id, {
          readBy: [...readBy, args.userId],
        });
      }
    }
  },
});