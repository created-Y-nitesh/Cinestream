import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../api/config';
import { VideoItem, WatchHistoryItem } from '../types';

interface WatchHistoryContextType {
  history: WatchHistoryItem[];
  recordProgress: (video: VideoItem, progressSeconds: number, totalSeconds: number, episodeId?: string, seasonNumber?: number, episodeNumber?: number) => void;
  removeHistoryItem: (videoId: string) => void;
  clearHistory: () => void;
}

const WatchHistoryContext = createContext<WatchHistoryContextType | undefined>(undefined);

export const WatchHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCH_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    // Provide initial starter continue watching sample for instant visual richness
    return [
      {
        videoId: 'vid-scifi-01',
        videoTitle: 'Chronicles of the Void: Episode VI',
        thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
        timestamp: Date.now() - 3600000,
        progressSeconds: 1680,
        totalSeconds: 3120,
        durationFormatted: '52m',
        episodeId: 'ep-scifi-01-01',
        seasonNumber: 1,
        episodeNumber: 1,
      },
      {
        videoId: 'vid-cyber-02',
        videoTitle: 'Neon Horizon: Tokyo 2088',
        thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
        timestamp: Date.now() - 86400000,
        progressSeconds: 3400,
        totalSeconds: 8040,
        durationFormatted: '2h 14m',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCH_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save watch history', e);
    }
  }, [history]);

  const recordProgress = (
    video: VideoItem,
    progressSeconds: number,
    totalSeconds: number,
    episodeId?: string,
    seasonNumber?: number,
    episodeNumber?: number
  ) => {
    if (!totalSeconds || totalSeconds <= 0) return;

    setHistory(prev => {
      const filtered = prev.filter(h => h.videoId !== video.id);
      const newItem: WatchHistoryItem = {
        videoId: video.id,
        videoTitle: video.title,
        thumbnail: video.thumbnail,
        timestamp: Date.now(),
        progressSeconds: Math.floor(progressSeconds),
        totalSeconds: Math.floor(totalSeconds),
        durationFormatted: video.duration,
        episodeId,
        seasonNumber,
        episodeNumber,
      };
      return [newItem, ...filtered].slice(0, 12);
    });
  };

  const removeHistoryItem = (videoId: string) => {
    setHistory(prev => prev.filter(h => h.videoId !== videoId));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <WatchHistoryContext.Provider
      value={{
        history,
        recordProgress,
        removeHistoryItem,
        clearHistory,
      }}
    >
      {children}
    </WatchHistoryContext.Provider>
  );
};

export function useWatchHistory(): WatchHistoryContextType {
  const context = useContext(WatchHistoryContext);
  if (!context) {
    throw new Error('useWatchHistory must be used within a WatchHistoryProvider');
  }
  return context;
}
