import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

//  store user from clerk
export const store = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // check if already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      // update name/email if changed
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
      });
      return existing._id;
    }

    // insert new user
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
    });
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // 👇 THIS LINE is where ctx.auth.getUserIdentity is used
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) =>
        q.eq("clerkId", identity.subject)
      )
      .unique();
  },
});
//  get all users except current

export const getAllUsers = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

//  update presence
export const updatePresence = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { lastSeen: Date.now() });
  },
});