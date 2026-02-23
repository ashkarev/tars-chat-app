import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    members: v.array(v.id("users")),
  }),


  messages: defineTable({
    conversationId: v.id("conversations"),
    sender: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_conversation", ["conversationId"]),
});