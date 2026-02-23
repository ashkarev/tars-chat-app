import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🔵 create or get conversation
export const createOrGetConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // ❌ prevent self chat
    if (args.user1.toString() === args.user2.toString()) {
      throw new Error("Cannot create conversation with yourself");
    }

    const conversations = await ctx.db.query("conversations").take(50);

    const existing = conversations.find((c) =>
      c.members.some((m) => m.toString() === args.user1.toString()) &&
      c.members.some((m) => m.toString() === args.user2.toString())
    );

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("conversations", {
      members: [args.user1, args.user2],
    });
  },
});


// 🟢 get conversations with other user + last message + unread count
export const getUserConversations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query("conversations").collect();

    const userConvos = conversations.filter((c) =>
      c.members.some((m) => m.toString() === args.userId.toString())
    );

    const results = [];

    for (const convo of userConvos) {
      // 👉 find the other user
      const otherUserId = convo.members.find(
        (m) => m.toString() !== args.userId.toString()
      );

      const otherUser = otherUserId
        ? await ctx.db.get(otherUserId)
        : null;

      // 👉 get all messages of this conversation
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", convo._id)
        )
        .collect();

      // 👉 last message
      const lastMessage =
        messages.length > 0 ? messages[messages.length - 1] : null;

      // 🔥 FIXED unread logic (uses readBy)
      const unreadCount = messages.filter(
        (m) =>
          m.sender.toString() !== args.userId.toString() &&
         !(m.readBy ?? []).includes(args.userId)
      ).length;

      results.push({
        _id: convo._id,
        otherUser,
        lastMessage,
        unreadCount,
      });
    }

    return results;
  },
});