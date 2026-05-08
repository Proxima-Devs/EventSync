export interface User {
  id:            string
  name:          string
  email:         string
  emailVerified: boolean
  image:         string | null
  role:          "USER" | "ADMIN"
  banned:        boolean | null
  banReason:     string | null
  banExpires:    string | null
  createdAt:     string
  updatedAt:     string
}

export interface Event {
  id:          string
  title:       string
  description: string | null
  slug:        string
  startDate:   string
  endDate:     string
  location:    string | null
  coverImage:  string | null
  createdAt:   string
  updatedAt:   string
  sessions:    EventSession[]
}

export interface EventSession {
  id:          string
  title:       string
  description: string | null
  startTime:   string
  endTime:     string
  capacity:    number | null
  eventId:     string
  roomId:      string | null
  room:        Room | null
  speakers:    SessionSpeaker[]
  questions:   Question[]
  createdAt:   string
  updatedAt:   string
}

export interface Room {
  id:        string
  name:      string
  createdAt: string
}

export interface SpeakerLinks {
  twitter?:  string
  linkedin?: string
  website?:  string
  github?:   string
}

export interface Speaker {
  id:        string
  fullName:  string
  photo:     string | null
  bio:       string | null
  links:     SpeakerLinks | null
  createdAt: string
  updatedAt: string
}

export interface SessionSpeaker {
  sessionId: string
  speakerId: string
  speaker:   Speaker
}

export interface Question {
  id:         string
  content:    string
  authorName: string | null
  upvotes:    number
  isHidden:   boolean
  sessionId:  string
  createdAt:  string
}