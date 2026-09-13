import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Play, Clock, CheckCircle2 } from 'lucide-react';
import { Episode, Season } from '../../types';

interface EpisodeListProps {
  seasons: Season[];
  currentEpisodeId?: string;
  onSelectEpisode: (episode: Episode, season: Season) => void;
  watchedEpisodeIds?: string[];
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  seasons,
  currentEpisodeId,
  onSelectEpisode,
  watchedEpisodeIds = [],
}) => {
  const [expandedSeason, setExpandedSeason] = useState<number>(seasons[0]?.seasonNumber || 1);

  if (!seasons || seasons.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white dark:text-white light:text-neutral-900">
          Seasons &amp; Episodes
        </h3>
        <span className="text-xs text-neutral-400">
          {seasons.length} {seasons.length === 1 ? 'Season' : 'Seasons'} Available
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {seasons.map(season => {
          const isExpanded = expandedSeason === season.seasonNumber;

          return (
            <div
              key={season.seasonNumber}
              className="rounded-2xl glass overflow-hidden transition-all duration-200"
            >
              {/* Season Accordion Header */}
              <button
                onClick={() => setExpandedSeason(isExpanded ? -1 : season.seasonNumber)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-50 transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
                    {season.title || `Season ${season.seasonNumber}`}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 dark:bg-white/10 light:bg-neutral-200 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                    {season.episodes.length} Episodes
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                )}
              </button>

              {/* Episodes List in Accordion */}
              {isExpanded && (
                <div className="p-3 sm:p-4 pt-0 flex flex-col gap-2.5 divide-y divide-white/5 dark:divide-white/5 light:divide-black/5">
                  {season.episodes.map(ep => {
                    const isSelected = currentEpisodeId === ep.id;
                    const isWatched = watchedEpisodeIds.includes(ep.id);

                    return (
                      <div
                        key={ep.id}
                        onClick={() => onSelectEpisode(ep, season)}
                        className={`pt-3 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'glass-red text-white'
                            : 'hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-neutral-50'
                        }`}
                      >
                        {/* Thumbnail or Episode Number */}
                        <div className="relative w-full sm:w-36 aspect-video rounded-lg overflow-hidden shrink-0 bg-neutral-800">
                          {ep.thumbnail ? (
                            <img
                              src={ep.thumbnail}
                              alt={ep.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-neutral-500">
                              EP {ep.episodeNumber}
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 fill-white text-white" />
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-crimson-600 text-[10px] font-bold text-white uppercase">
                              Playing
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-crimson-400 uppercase tracking-wider">
                              EP {ep.episodeNumber}
                            </span>
                            <h4 className="text-sm font-semibold text-white dark:text-white light:text-neutral-900 truncate">
                              {ep.title}
                            </h4>
                            {isWatched && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
                            {ep.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {ep.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
