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
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: args.sender,
      body: args.body,
      createdAt: Date.now(),

      // ✔ initial state
      deliveredTo: [args.sender],
      seenBy: [args.sender],
    });
  },
});

// 🔵 get messages
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  handler: async (ctx, args) => {
    // 🟠 Temporary lax query without index
    const allMessages = await ctx.db.query("messages").collect();
    return allMessages.filter((m) => m.conversationId === args.conversationId);
  },
});

// 🔵 mark messages as seen
export const markAsSeen = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. query ALL messages in the conversation (🟠 Temporary lax query)
    const allMessages = await ctx.db.query("messages").collect();
    const messages = allMessages.filter(
      (m) => m.conversationId === args.conversationId
    );

    for (const msg of messages) {
      const deliveredTo = msg.deliveredTo ?? [];
      const seenBy = msg.seenBy ?? [];

      const needsDelivered = !deliveredTo.includes(args.userId);
      const needsSeen = !seenBy.includes(args.userId);

      if (needsDelivered || needsSeen) {
        await ctx.db.patch(msg._id, {
          ...(needsDelivered && {
            deliveredTo: [...deliveredTo, args.userId],
          }),
          ...(needsSeen && {
            seenBy: [...seenBy, args.userId],
          }),
        });
      }
    }
  },
});