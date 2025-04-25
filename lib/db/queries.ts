import 'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt, gte, inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import {
  user,
  chat,
  type User,
  document,
  type Suggestion,
  suggestion,
  message,
  vote,
  type DBMessage,
  knowledgeSource,
  knowledgeChunk,
  knowledgeRelation,
  type KnowledgeSource,
  type KnowledgeChunk,
  type KnowledgeRelation
} from './schema';
import { ArtifactKind } from '@/components/artifact';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string, role: 'user' | 'admin' | 'superuser' = 'user') {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ 
      email, 
      password: hash,
      role,
      status: 'pending', // Set default status to pending for self-registration
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

/**
 * Create a user with active status (for admin-created users)
 */
export async function createActiveUser(email: string, password: string, role: 'user' | 'admin' | 'superuser' = 'user') {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ 
      email, 
      password: hash,
      role,
      status: 'active', // Admin-created users are active by default
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Failed to create active user in database');
    throw error;
  }
}

export async function getAllUsers(): Promise<Array<User>> {
  try {
    return await db.select().from(user);
  } catch (error) {
    console.error('Failed to get all users from database');
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const [selectedUser] = await db.select().from(user).where(eq(user.id, id));
    return selectedUser;
  } catch (error) {
    console.error('Failed to get user by id from database');
    throw error;
  }
}

export async function updateUser({
  id,
  role,
  status,
}: {
  id: string;
  role?: 'user' | 'admin' | 'superuser';
  status?: 'active' | 'inactive' | 'pending';
}) {
  try {
    const updates: any = {};
    if (role) updates.role = role;
    if (status) updates.status = status;
    
    return await db.update(user).set(updates).where(eq(user.id, id));
  } catch (error) {
    console.error('Failed to update user in database');
    throw error;
  }
}

export async function updateUserLastActive({
  id,
}: {
  id: string;
}) {
  try {
    return await db.update(user).set({ lastActive: new Date() }).where(eq(user.id, id));
  } catch (error) {
    console.error('Failed to update user last active time in database');
    throw error;
  }
}

export async function saveChat({
  id,
  userId,
  title,
  type = 'general',
}: {
  id: string;
  userId: string;
  title: string;
  type?: 'general' | 'query' | 'capture';
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      type,
    });
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));

    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function saveMessages({
  messages,
}: {
  messages: Array<DBMessage>;
}) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error('Failed to save messages in database', error);
    throw error;
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === 'up' })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === 'up',
    });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db.insert(document).values({
      id,
      title,
      kind,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (error) {
    console.error('Failed to get message by id from database');
    throw error;
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp)),
      );

    const messageIds = messagesToDelete.map((message) => message.id);

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds)),
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds)),
        );
    }
  } catch (error) {
    console.error(
      'Failed to delete messages by id after timestamp from database',
    );
    throw error;
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: 'private' | 'public';
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}

export async function getChatsByUserIdAndType({ 
  id, 
  type 
}: { 
  id: string; 
  type: 'general' | 'query' | 'capture' 
}) {
  try {
    return await db
      .select()
      .from(chat)
      .where(and(eq(chat.userId, id), eq(chat.type, type)))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user and type from database');
    throw error;
  }
}

// Knowledge Base Queries

export async function createKnowledgeSource({
  title,
  description,
  sourceType,
  sourceId,
  userId,
  metadata,
}: {
  title: string;
  description?: string;
  sourceType: 'chat' | 'document' | 'image' | 'video' | 'webpage' | 'api';
  sourceId?: string;
  userId: string;
  metadata?: any;
}) {
  try {
    const now = new Date();
    const [result] = await db.insert(knowledgeSource).values({
      title,
      description,
      sourceType,
      sourceId,
      userId,
      metadata,
      createdAt: now,
      updatedAt: now,
    }).returning();
    
    return result;
  } catch (error) {
    console.error('Failed to create knowledge source in database');
    throw error;
  }
}

export async function getKnowledgeSourceById(id: string) {
  try {
    const [result] = await db.select().from(knowledgeSource).where(eq(knowledgeSource.id, id));
    return result;
  } catch (error) {
    console.error('Failed to get knowledge source by id from database');
    throw error;
  }
}

export async function getKnowledgeSourcesByStatus(status: 'pending' | 'approved' | 'rejected') {
  try {
    return await db
      .select()
      .from(knowledgeSource)
      .where(eq(knowledgeSource.status, status))
      .orderBy(desc(knowledgeSource.createdAt));
  } catch (error) {
    console.error('Failed to get knowledge sources by status from database');
    throw error;
  }
}

export async function updateKnowledgeSourceStatus({
  id,
  status,
  approvedBy,
}: {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}) {
  try {
    const updates: any = {
      status,
      updatedAt: new Date(),
    };
    
    if (status === 'approved' && approvedBy) {
      updates.approvedBy = approvedBy;
      updates.approvedAt = new Date();
    }
    
    return await db
      .update(knowledgeSource)
      .set(updates)
      .where(eq(knowledgeSource.id, id));
  } catch (error) {
    console.error('Failed to update knowledge source status in database');
    throw error;
  }
}

export async function createKnowledgeChunk({
  sourceId,
  content,
  embedding,
  metadata,
}: {
  sourceId: string;
  content: string;
  embedding?: any;
  metadata?: any;
}) {
  try {
    const [result] = await db.insert(knowledgeChunk).values({
      sourceId,
      content,
      embedding,
      metadata,
      createdAt: new Date(),
    }).returning();
    
    return result;
  } catch (error) {
    console.error('Failed to create knowledge chunk in database');
    throw error;
  }
}

export async function getKnowledgeChunksBySourceId(sourceId: string) {
  try {
    return await db
      .select()
      .from(knowledgeChunk)
      .where(eq(knowledgeChunk.sourceId, sourceId))
      .orderBy(asc(knowledgeChunk.createdAt));
  } catch (error) {
    console.error('Failed to get knowledge chunks by source id from database');
    throw error;
  }
}

export async function createKnowledgeRelation({
  sourceId,
  targetId,
  relationType,
  strength,
}: {
  sourceId: string;
  targetId: string;
  relationType: 'related' | 'part_of' | 'references' | 'contradicts' | 'supports';
  strength?: number;
}) {
  try {
    const [result] = await db.insert(knowledgeRelation).values({
      sourceId,
      targetId,
      relationType,
      strength: strength || 5,
      createdAt: new Date(),
    }).returning();
    
    return result;
  } catch (error) {
    console.error('Failed to create knowledge relation in database');
    throw error;
  }
}

export async function getKnowledgeRelationsBySourceId(sourceId: string) {
  try {
    return await db
      .select()
      .from(knowledgeRelation)
      .where(eq(knowledgeRelation.sourceId, sourceId))
      .orderBy(desc(knowledgeRelation.strength));
  } catch (error) {
    console.error('Failed to get knowledge relations by source id from database');
    throw error;
  }
}

export async function getKnowledgeRelationsByTargetId(targetId: string) {
  try {
    return await db
      .select()
      .from(knowledgeRelation)
      .where(eq(knowledgeRelation.targetId, targetId))
      .orderBy(desc(knowledgeRelation.strength));
  } catch (error) {
    console.error('Failed to get knowledge relations by target id from database');
    throw error;
  }
}

export async function deleteKnowledgeSource(id: string) {
  try {
    // First delete all chunks associated with this source
    await db
      .delete(knowledgeChunk)
      .where(eq(knowledgeChunk.sourceId, id));
    
    // Delete all relations where this source is either the source or target
    await db
      .delete(knowledgeRelation)
      .where(eq(knowledgeRelation.sourceId, id));
    
    await db
      .delete(knowledgeRelation)
      .where(eq(knowledgeRelation.targetId, id));
    
    // Finally delete the source itself
    return await db
      .delete(knowledgeSource)
      .where(eq(knowledgeSource.id, id));
  } catch (error) {
    console.error('Failed to delete knowledge source from database');
    throw error;
  }
}
