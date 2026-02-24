import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🔵 send message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    body: v.string(),
    replyTo: v.optional(v.id("messages")),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) throw new Error("Conversation not found");

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: args.sender,
      body: args.body,
      replyTo: args.replyTo,
      imageStorageId: args.imageStorageId,
      createdAt: Date.now(),

      // ✔ initial state
      deliveredTo: [args.sender],
      seenBy: [args.sender],
    });
  },
});

// 🔵 edit message
export const update = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.sender !== args.userId) {
      throw new Error("Unauthorized or message not found");
    }

    await ctx.db.patch(args.messageId, {
      body: args.body,
      isEdited: true,
    });
  },
});

// 🔵 delete message
export const remove = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get(args.messageId);
    if (!msg || msg.sender !== args.userId) {
      throw new Error("Unauthorized or message not found");
    }

    await ctx.db.delete(args.messageId);
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
    const messages = allMessages.filter(
      (m) => m.conversationId === args.conversationId
    );

    const results = [];
    for (const msg of messages) {
      let repliedToMsg = null;
      if (msg.replyTo) {
        repliedToMsg = await ctx.db.get(msg.replyTo);
      }

      let imageUrl = null;
      if (msg.imageStorageId) {
        imageUrl = await ctx.storage.getUrl(msg.imageStorageId);
      }

      results.push({
        ...msg,
        repliedToMsg,
        imageUrl,
      });
    }
    return results;
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