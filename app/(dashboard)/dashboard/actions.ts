'use server';

import { db } from '@/lib/db';
import { chat, user, knowledgeSource } from '@/lib/db/schema';
import { count, eq, desc } from 'drizzle-orm';

export async function getDashboardStats() {
  try {
    const totalChats = await db.select({ count: count() }).from(chat);
    const totalUsers = await db.select({ count: count() }).from(user);
    const knowledgeBaseItems = await db
      .select({ count: count() })
      .from(knowledgeSource)
      .where(eq(knowledgeSource.status, 'approved'));
    const pendingReviewItems = await db
      .select({ count: count() })
      .from(knowledgeSource)
      .where(eq(knowledgeSource.status, 'pending'));

    return {
      totalChats: Number(totalChats[0]?.count || 0),
      totalUsers: Number(totalUsers[0]?.count || 0),
      knowledgeBaseItems: Number(knowledgeBaseItems[0]?.count || 0),
      pendingReviewItems: Number(pendingReviewItems[0]?.count || 0),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default values in case of error
    return {
      totalChats: 0,
      totalUsers: 0,
      knowledgeBaseItems: 0,
      pendingReviewItems: 0,
    };
  }
}

export async function getRecentKnowledgeItems(limit = 4) {
  try {
    return await db
      .select({
        id: knowledgeSource.id,
        title: knowledgeSource.title,
        createdAt: knowledgeSource.createdAt,
        sourceType: knowledgeSource.sourceType,
      })
      .from(knowledgeSource)
      .where(eq(knowledgeSource.status, 'approved'))
      .orderBy(desc(knowledgeSource.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Error fetching recent knowledge items:', error);
    return [];
  }
}

export async function getRecentChats(limit = 4) {
  try {
    return await db
      .select({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        type: chat.type,
      })
      .from(chat)
      .orderBy(desc(chat.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('Error fetching recent chats:', error);
    return [];
  }
}

// Formatting utilities moved to utils.ts
