export type VideoSourceType = 'google_drive' | 'html5' | 'embed' | 'youtube' | 'custom';

export type VideoContentType = 'movie' | 'series';

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  video_url?: string;
  embed_url?: string;
  source_type?: VideoSourceType;
  releasedAt?: string;
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  backdrop: string;
  video_url?: string;
  embed_url?: string;
  source_type: VideoSourceType;
  type: VideoContentType;
  genre: string[];
  year: number;
  duration: string;
  language?: string;
  quality?: '4K Ultra HD' | '1080p Full HD' | '720p HD' | 'HDR' | string;
  rating?: number; // e.g. 8.7 / 10
  cast?: string[];
  director?: string;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  seasons?: Season[];
  // Google Drive specific metadata if provided by backend
  drive_file_id?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  count: number;
  backdrop: string;
  description: string;
}

export interface WatchHistoryItem {
  videoId: string;
  videoTitle: string;
  thumbnail: string;
  timestamp: number;
  progressSeconds: number;
  totalSeconds: number;
  durationFormatted: string;
  episodeId?: string;
  seasonNumber?: number;
  episodeNumber?: number;
}

export type ThemeMode = 'dark' | 'light' | 'system';

export interface FilterOptions {
  search?: string;
  genre?: string;
  year?: number | string;
  quality?: string;
  language?: string;
  sortBy?: 'popular' | 'rating' | 'newest' | 'title';
  type?: 'all' | 'movie' | 'series';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  total?: number;
  page?: number;
  per_page?: number;
}
