import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// update typing status
export const setTyping = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("typing")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isTyping: args.isTyping,
      });
      return;
    }

    await ctx.db.insert("typing", args);
  },
});

// get typing users for a conversation
export const getTyping = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    const typingUsers = await ctx.db
      .query("typing")
      .filter((q) =>
        q.and(
          q.eq(q.field("conversationId"), args.conversationId),
          q.eq(q.field("isTyping"), true)
        )
      )
      .collect();

    const results = [];

    for (const t of typingUsers) {
      const user = await ctx.db.get(t.userId);

      results.push({
        _id: t._id,
        userId: t.userId,
        name: user?.name || "User",
      });
    }

    return results;
  },
});