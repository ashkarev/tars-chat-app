import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createOrGetConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
handler: async (ctx, args) => {
  // get only limited conversations (safe)
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
}
});