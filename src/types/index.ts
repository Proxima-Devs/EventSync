export interface SpeakerLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface EventPayload {
  title: string;
  description?: string;
  slug?: string;
  startDate: string;
  endDate: string;
  location?: string;
  coverImage?: string;
}

export interface SessionPayload {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  capacity?: number;
  roomId?: string;
  speakerIds: string[];
}

export interface SpeakerPayload {
  fullName: string;
  photo?: string;
  bio?: string;
  links?: SpeakerLinks;
}

export interface RoomPayload {
  name: string;
}

export interface QuestionPayload {
  content: string;
  authorName?: string;
}

export interface CommentPayload {
  content: string;
  authorName?: string;
}

export type ApiError = {
  error: string;
  details?: unknown;
};

export type PaginationMeta = {
  total: number;
  page: number;
  perPage: number;
};


export interface Stats {
  totals: {
    events: number;
    sessions: number;
    speakers: number;
    rooms: number;
    questions: number;
  };
  live: { activeSessions: number };
  upcoming: { events: number };
  recentEvents: {
    id: string;
    slug: string;
    title: string;
    startDate: string;
    endDate: string;
    location?: string;
    _count: { sessions: number };
  }[];
  recentQuestions: {
    id: string;
    content: string;
    upvotes: number;
    session: {
      title: string;
      event: { title: string; slug: string };
    };
  }[];
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  location?: string | null;
  coverImage?: string | null;
  _count: { sessions: number };
  sessions: Session[];
}

export interface EventFormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  coverImage: string;
}


export type EventMeta = { 
  id: string; 
  title: string; 
  slug: string 
};

export interface Speaker {
  id: string;
  slug: string;
  fullName: string;
  photo?: string | null;
  bio?: string | null;
  links?: SpeakerLinks | null;
  sessions?: Session[];
}

export interface Room {
  id: string;
  name: string;
  slug: string
}

export interface Session {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  capacity?: number | null;
  isLive: boolean;
  room?: Room | null;
  speakers: Speaker[];
  _count: { questions: number };
}


export interface SessionFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: string;
  roomId: string;
  speakerIds: string[];
}

export type SessionFavorite = {
  id: string;
  slug: string;
  title: string;
  startTime: string;
  endTime: string;
  isLive: boolean;
  room?: { id: string; name: string } | null;
  speakers: { id: string; fullName: string }[];
  event: { slug: string; title: string };
};

export interface EventSession extends Session {
  eventId: string;
  event: { id: string; title: string; slug: string };
}

export interface Question {
  id: string;
  content: string;
  authorName?: string | null;
  upvotes: number;
  isHidden: boolean;
  sessionId: string;
  createdAt: string;
  replies?: QuestionReply[];
}

export interface QuestionReply {
  id: string;
  content: string;
  authorName?: string | null;
  createdAt: string;
}

