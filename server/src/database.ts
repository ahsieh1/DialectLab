
import { Pool } from 'pg'
import {
  Kysely,
  PostgresDialect,
  Generated,
  ColumnType,
} from 'kysely'
import * as dotenv from 'dotenv'

dotenv.config()

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  }),
})

export type Proficiency = 'beginner' | 'intermediate' | 'advanced' | 'master' | 'native';
export type RoomType = 'text' | 'voice';
export type RoleType = 'learner' | 'teacher';

// Database interface for types (we will expand this later)
export interface Database {
    users: UserTable // 001
    languages: LanguageTable // 002
    topics: TopicsTable // 003
    user_languages: UserLanguagesTable // 004
    communities: CommunitiesTable // 005
    community_memberships: CommunityMembershipsTable // 006
    discussion_rooms: DiscussionRoomsTable // 007
    chat_messages: ChatMessagesTable // 008
    practice_sessions: PracticeSessionsTable // 009
    session_participants: SessionParticipantsTable // 010
export interface UserTable {
  id: Generated<number>
  username: string
  email: string
  pass_hash: string
  created_at: ColumnType<Date, string | undefined, never>
  last_active_at: ColumnType<Date, string | undefined, string>
}

export interface ChatroomTable {
  id: Generated<number>
  language_code: string
  channel_id: string
  created_at: ColumnType<Date, string | undefined, never>
}

export interface MessageTable {
  id: Generated<number>
  room_id: number
  user_id: number
  content: string
  created_at: ColumnType<Date, string | undefined, never>
}

export interface Database {
  users: UserTable
  chatrooms: ChatroomTable
  messages: MessageTable
}

export interface LanguageTable {
    id: Generated<number>;
    name: string;
    iso_code: string;
}

export interface TopicsTable {
    id: Generated<number>;
    name: string;
}

export interface UserLanguagesTable {
    user_id: number;
    language_id: number;
    proficiency_level: Proficiency | null;
    role: RoleType;
}

export interface CommunitiesTable {
    id: Generated<number>
    language_id: number;
    name: string;
    description: string | null;
    created_at: ColumnType<Date, string | undefined, never>;
    target_proficiency: Proficiency | null;
}

export interface CommunityMembershipsTable {
    community_id: number;
    user_id: number;
    role: RoleType;
    joined_at: ColumnType<Date, string | undefined, never>;
}

export interface DiscussionRoomsTable {
    id: Generated<number>;
    community_id: number;
    name: string;
    topic_id: number | null;
    room_type: RoomType;
    required_proficiency: Proficiency | null;
}

export interface ChatMessagesTable {
    id: Generated<number>;
    room_id: number;
    sender_id: number;
    content: string;
    sent_at: ColumnType<Date, string | undefined, never>;
}

export interface PracticeSessionsTable {
    id: Generated<number>;
    room_id: number;
    host_id: number;
    title: string;
    topic_id: number | null;
    target_proficiency: Proficiency | null;
    started_at: ColumnType<Date, string | undefined, never>;
    ended_at: ColumnType<Date | null, string | null | undefined, string | null>;
}

export interface SessionParticipantsTable {
    session_id: number;
    user_id: number;
    joined_at: ColumnType<Date, string | undefined, never>;
    left_at: ColumnType<Date | null, string | null | undefined, string | null>;
}

export const db = new Kysely<Database>({
  dialect,
})
