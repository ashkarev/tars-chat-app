import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // get all conversations
    const conversations = await ctx.db.query("conversations").collect();

    // check if conversation already exists
    const existing = conversations.find((c) =>
      c.members.includes(args.user1) &&
      c.members.includes(args.user2)
    );

    if (existing) {
      return existing._id;
    }

    // else create new
    return await ctx.db.insert("conversations", {
      members: [args.user1, args.user2],
    });
  },
});