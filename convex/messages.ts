import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// send message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    sender: v.id("users"), // in a real app, we'd get this from ctx.auth
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      sender: args.sender,
      body: args.body,
      createdAt: Date.now(),
    });
  },
});

// get messages
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