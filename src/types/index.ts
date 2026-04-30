export interface SpeakerLinks {
  twitter?: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

export interface EventPayload {
  id: string;
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

export type ApiError = {
  error: string;
  details?: unknown;
};

export type PaginationMeta = {
  total: number;
  page: number;
  perPage: number;
};

