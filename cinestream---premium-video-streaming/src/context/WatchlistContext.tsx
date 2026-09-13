import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../api/config';
import { VideoItem } from '../types';
import { useToast } from './ToastContext';

interface WatchlistContextType {
  watchlist: VideoItem[];
  addToWatchlist: (video: VideoItem) => void;
  removeFromWatchlist: (videoId: string) => void;
  toggleWatchlist: (video: VideoItem) => void;
  isInWatchlist: (videoId: string) => boolean;
  clearWatchlist: () => void;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const isInWatchlist = (videoId: string): boolean => {
    return watchlist.some(v => v.id === videoId);
  };

  const addToWatchlist = (video: VideoItem) => {
    if (!isInWatchlist(video.id)) {
      setWatchlist(prev => [video, ...prev]);
      showToast(`Added "${video.title}" to your Watchlist`, 'success');
    }
  };

  const removeFromWatchlist = (videoId: string) => {
    const item = watchlist.find(v => v.id === videoId);
    setWatchlist(prev => prev.filter(v => v.id !== videoId));
    if (item) {
      showToast(`Removed "${item.title}" from Watchlist`, 'info');
    }
  };

  const toggleWatchlist = (video: VideoItem) => {
    if (isInWatchlist(video.id)) {
      removeFromWatchlist(video.id);
    } else {
      addToWatchlist(video);
    }
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    showToast('Watchlist cleared', 'info');
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        clearWatchlist,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export function useWatchlist(): WatchlistContextType {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
