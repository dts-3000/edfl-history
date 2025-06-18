// Club types
export interface Club {
  id: string
  name: string
  slug: string
  location: string
  description: string
  founded?: number
  colors?: string[]
  homeGround?: string
  website?: string
  logoUrl?: string
  createdAt?: Date
  updatedAt?: Date
}

// Club records types
export interface Premiership {
  id: string
  year: number
  grade: string
  coach?: string
  captain?: string
  opponent?: string
  score?: string
  venue?: string
  notes?: string
}

export interface BestAndFairest {
  id: string
  year: number
  player: string
  votes: number
  grade: string
  notes?: string
}

export interface Article {
  id: string
  year: number
  title: string
  content?: string
  author?: string
  source?: string
  date?: string
  images?: ArticleImage[]
  tags?: string[]
}

export interface ArticleImage {
  id: string
  url: string
  caption?: string
  filename: string
}

// New club history types
export interface ClubHistorySection {
  id: string
  title: string
  content: string
  images?: ArticleImage[]
  order: number
  type: "general" | "founding" | "achievements" | "facilities" | "community"
}

export interface VFLAFLPlayer {
  id: string
  name: string
  position: string
  vflAflClub: string
  years: string
  games?: number
  goals?: number
  achievements?: string
  notes?: string
  imageUrl?: string
}

export interface ClubRecordHolder {
  id: string
  category: "most-games" | "most-goals" | "most-points" | "most-wins-coach" | "longest-serving" | "other"
  recordType: string
  playerName: string
  value: number
  unit: string
  years?: string
  grade?: string
  notes?: string
}

export interface BestPlayer {
  id: string
  name: string
  position: string
  era: string
  achievements: string[]
  description: string
  stats?: {
    games?: number
    goals?: number
    bestAndFairest?: number
  }
  imageUrl?: string
  inducted?: boolean
  inductionYear?: number
}

// Timeline event types
export interface TimelineEvent {
  id: string
  year: number
  type: "premiership" | "bestAndFairest" | "article" | "milestone"
  title: string
  description?: string
  data: Premiership | BestAndFairest | Article | any
}
