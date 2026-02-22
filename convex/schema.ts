import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },

  handler: async (ctx, args) => {
    // 🔍 check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    // if already exists → don't insert again
    if (existingUser) {
      return existingUser._id;
    }

    // else → create new user
    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
    });
  },
});