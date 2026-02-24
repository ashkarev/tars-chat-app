import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // 🔵 typing indicator
  typing: defineTable({
    conversationId: v.id("conversations"),
    userId: v.id("users"),
    isTyping: v.boolean(),
  })
    .index("by_conversation", ["conversationId"])
    .index("by_conversation_user", ["conversationId", "userId"]),

  // 🔵 users
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    lastSeen: v.optional(v.number()),
  }).index("by_clerkId", ["clerkId"]),

  // 🔵 conversations
  conversations: defineTable({
    members: v.optional(v.array(v.id("users"))),
    name: v.optional(v.string()),
    isGroup: v.optional(v.boolean()),
    admin: v.optional(v.id("users")),
  }),

  // 🔵 messages (✔✔ delivered + seen system)
  messages: defineTable(v.any()),

});