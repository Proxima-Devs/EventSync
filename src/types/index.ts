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
