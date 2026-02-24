import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * 🔹 Get all conversations for logged in user
 */
export const getUserConversations = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // get all conversations
    const conversations = await ctx.db.query("conversations").collect();

    // filter only conversations where current user is a member
    const userConvos = conversations.filter((c) =>
      (c.members ?? []).some((m) => m.toString() === args.userId.toString())
    );

    const results = [];

    let totalUnreadCount = 0;

    for (const convo of userConvos) {
      // find other user in that conversation
      const otherUserId = (convo.members ?? []).find(
        (m) => m.toString() !== args.userId.toString()
      );

      const otherUser = otherUserId
        ? await ctx.db.get(otherUserId)
        : null;

      // get last message (🟠 Temporary lax query)
      const allMessages = await ctx.db.query("messages").collect();
      const convoMessages = allMessages
        .filter((m) => m.conversationId === convo._id)
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

      const lastMessage = convoMessages[0] ?? null;

      // 🔥 unread count (🟠 Temporary lax query)
      const unreadCount = convoMessages.filter((m) => {
        return (
          m.sender !== args.userId &&
          (!m.seenBy || !m.seenBy.includes(args.userId))
        );
      }).length;

      totalUnreadCount += unreadCount;

      results.push({
        ...convo,
        otherUser,
        lastMessage,
        unreadCount,
      });
    }

    return {
      conversations: results,
      totalUnreadCount,
    };
  },
});

/**
 * 🔹 Get a single conversation with other user info
 */
export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const convo = await ctx.db.get(args.conversationId);
    if (!convo) return null;

    const otherUserId = (convo.members ?? []).find(
      (m) => m.toString() !== args.userId.toString()
    );

    const otherUser = otherUserId
      ? await ctx.db.get(otherUserId)
      : null;

    return {
      ...convo,
      otherUser,
    };
  },
});


/**
 * 🔹 Create or get existing conversation
 */
export const createOrGetConversation = mutation({
  args: {
    user1: v.id("users"),
    user2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // check if conversation already exists
    const existing = await ctx.db.query("conversations").collect();

    const found = existing.find(
      (c) =>
        (c.members ?? []).includes(args.user1) &&
        (c.members ?? []).includes(args.user2)
    );

    if (found) {
      return found._id;
    }

    // else create new conversation
    const newConvo = await ctx.db.insert("conversations", {
      members: [args.user1, args.user2],
    });

    return newConvo;
  },
});

/**
 * 🔹 Create a group conversation
 */
export const createGroup = mutation({
  args: {
    members: v.array(v.id("users")),
    name: v.string(),
    admin: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      members: args.members,
      name: args.name,
      isGroup: true,
      admin: args.admin,
    });
  },
});
