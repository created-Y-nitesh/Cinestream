/**
 * Sheet ki kachchi rows ko frontend ke VideoItem / Season / CategoryItem shape me
 * badalta hai (src/types/index.ts se exactly match karta hai).
 *
 * Column names flexible hain — normalizeKey() case, space aur underscore hata deta hai,
 * aur neeche har field ke liye kai aliases diye gaye hain.
 */

import { config } from './config.js';
import {
  driveEmbedUrl,
  driveThumbnailUrl,
  extractDriveFileId,
  youtubeEmbedUrl,
} from './drive.js';

/** Row me diye gaye aliases me se pehla non-empty value uthata hai. */
function pick(row, ...aliases) {
  for (const alias of aliases) {
    const value = row[alias];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function toList(value) {
  if (!value) return [];
  return String(value)
    .split(/[,|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBool(value) {
  const normalized = String(value || '').trim().toLowerCase();
  return ['true', 'yes', 'y', '1', 'haan', 'ha'].includes(normalized);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(String(value || '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Row publish ki gayi hai ya nahi (status / published / active column). */
export function isPublished(row) {
  if (!config.respectPublishedColumn) return true;

  const status = pick(row, 'status', 'published', 'active', 'live', 'visible');
  if (!status) return true; // column hi nahi hai => sab published maano

  const normalized = status.toLowerCase();
  if (['false', 'no', 'n', '0', 'draft', 'hidden', 'inactive', 'archived'].includes(normalized)) {
    return false;
  }
  return true;
}

/**
 * Ek row ke saare possible video source columns dekh kar
 * { sourceType, embedUrl, videoUrl, driveFileId } resolve karta hai.
 */
function resolveSource(row) {
  const driveRaw = pick(
    row,
    'drivelink', 'driveurl', 'drive', 'googledrive', 'googledrivelink',
    'driveid', 'drivefileid', 'fileid', 'link', 'url', 'videolink',
  );
  const explicitEmbed = pick(row, 'embedurl', 'embed', 'iframe', 'iframeurl');
  const explicitVideo = pick(row, 'videourl', 'directurl', 'mp4', 'mp4url', 'hls', 'streamurl');
  const declaredType = pick(row, 'sourcetype', 'source', 'player', 'playertype').toLowerCase();

  const driveFileId =
    extractDriveFileId(driveRaw) ||
    extractDriveFileId(explicitEmbed) ||
    extractDriveFileId(explicitVideo);

  const youtube = youtubeEmbedUrl(driveRaw) || youtubeEmbedUrl(explicitEmbed);

  // 1) YouTube link
  if (youtube) {
    return { sourceType: 'youtube', embedUrl: youtube, videoUrl: '', driveFileId: '' };
  }

  // 2) Google Drive (default aur main use-case)
  if (driveFileId) {
    return {
      sourceType: declaredType === 'html5' ? 'html5' : 'google_drive',
      embedUrl: explicitEmbed && !extractDriveFileId(explicitEmbed) ? explicitEmbed : driveEmbedUrl(driveFileId),
      // Sirf tab jab sheet me alag mp4/hls diya ho. Drive ka uc?export=download link
      // bade files par HTML5 <video> me chalta hi nahi (virus-scan page + CORS).
      videoUrl: explicitVideo,
      driveFileId,
    };
  }

  // 3) Koi aur iframe embed
  if (explicitEmbed) {
    return { sourceType: declaredType || 'embed', embedUrl: explicitEmbed, videoUrl: explicitVideo, driveFileId: '' };
  }

  // 4) Direct mp4 / hls
  if (explicitVideo) {
    return { sourceType: declaredType || 'html5', embedUrl: '', videoUrl: explicitVideo, driveFileId: '' };
  }

  return { sourceType: declaredType || 'custom', embedUrl: '', videoUrl: '', driveFileId: '' };
}

/** Videos sheet ki ek row -> VideoItem */
export function rowToVideo(row, index) {
  const title = pick(row, 'title', 'name', 'moviename', 'videotitle');
  if (!title) return null;

  const id = pick(row, 'id', 'videoid', 'slug', 'code') || slugify(title) || `video-${index + 1}`;
  const { sourceType, embedUrl, videoUrl, driveFileId } = resolveSource(row);

  const thumbnail =
    pick(row, 'thumbnail', 'poster', 'thumb', 'image', 'posterurl', 'thumbnailurl', 'imageurl') ||
    driveThumbnailUrl(driveFileId, 800);

  const backdrop =
    pick(row, 'backdrop', 'banner', 'cover', 'backdropurl', 'bannerurl', 'coverurl') ||
    driveThumbnailUrl(driveFileId, 1600) ||
    thumbnail;

  const type = pick(row, 'type', 'contenttype', 'kind').toLowerCase() === 'series' ? 'series' : 'movie';
  const ratingRaw = pick(row, 'rating', 'imdb', 'imdbrating', 'score');

  return {
    id,
    title,
    description:
      pick(row, 'description', 'overview', 'plot', 'synopsis', 'story') ||
      `${title} — ab CineStream par stream karein.`,
    thumbnail,
    backdrop,
    video_url: videoUrl || undefined,
    embed_url: embedUrl || undefined,
    source_type: sourceType,
    type,
    genre: toList(pick(row, 'genre', 'genres', 'category', 'categories')),
    year: toNumber(pick(row, 'year', 'releaseyear', 'releasedate'), new Date().getFullYear()),
    duration: pick(row, 'duration', 'runtime', 'length') || (type === 'series' ? 'Multiple Episodes' : 'N/A'),
    language: pick(row, 'language', 'lang', 'audio') || undefined,
    quality: pick(row, 'quality', 'resolution', 'print') || undefined,
    rating: ratingRaw ? toNumber(ratingRaw) : undefined,
    cast: toList(pick(row, 'cast', 'actors', 'starring')),
    director: pick(row, 'director', 'directedby') || undefined,
    featured: toBool(pick(row, 'featured', 'hero', 'isfeatured')),
    trending: toBool(pick(row, 'trending', 'popular', 'istrending')),
    tags: toList(pick(row, 'tags', 'keywords', 'labels')),
    drive_file_id: driveFileId || undefined,
    // internal — response bhejne se pehle hata diya jata hai
    _addedAt: pick(row, 'addedon', 'addedat', 'createdat', 'date', 'timestamp', 'updatedat'),
    _order: index,
  };
}

/** Episodes sheet ki ek row -> Episode (+ kis series ki hai) */
export function rowToEpisode(row, index) {
  const seriesId = pick(row, 'seriesid', 'videoid', 'parentid', 'showid', 'series', 'parent');
  if (!seriesId) return null;

  const seasonNumber = toNumber(pick(row, 'season', 'seasonnumber', 'seasonno'), 1) || 1;
  const episodeNumber = toNumber(pick(row, 'episode', 'episodenumber', 'episodeno', 'ep'), index + 1) || index + 1;

  const { sourceType, embedUrl, videoUrl, driveFileId } = resolveSource(row);
  const title = pick(row, 'title', 'episodetitle', 'name') || `Episode ${episodeNumber}`;

  return {
    seriesId,
    seasonTitle: pick(row, 'seasontitle', 'seasonname'),
    episode: {
      id: pick(row, 'id', 'episodeid') || `${seriesId}-s${seasonNumber}e${episodeNumber}`,
      episodeNumber,
      seasonNumber,
      title,
      description: pick(row, 'description', 'overview', 'plot', 'synopsis') || `${title} — Season ${seasonNumber}`,
      duration: pick(row, 'duration', 'runtime', 'length') || 'N/A',
      thumbnail: pick(row, 'thumbnail', 'poster', 'image', 'thumb') || driveThumbnailUrl(driveFileId, 640) || undefined,
      video_url: videoUrl || undefined,
      embed_url: embedUrl || undefined,
      source_type: sourceType,
      releasedAt: pick(row, 'releasedat', 'airdate', 'releasedate') || undefined,
    },
  };
}

/** Episodes ko unke series ke andar seasons[] me pirota hai. */
export function attachEpisodes(videos, episodeEntries) {
  const bySeriesId = new Map();

  episodeEntries.forEach((entry) => {
    if (!entry) return;
    if (!bySeriesId.has(entry.seriesId)) bySeriesId.set(entry.seriesId, []);
    bySeriesId.get(entry.seriesId).push(entry);
  });

  return videos.map((video) => {
    const entries = bySeriesId.get(video.id);
    if (!entries || entries.length === 0) return video;

    const seasonMap = new Map();
    entries.forEach(({ episode, seasonTitle }) => {
      const key = episode.seasonNumber;
      if (!seasonMap.has(key)) {
        seasonMap.set(key, { seasonNumber: key, title: seasonTitle || `Season ${key}`, episodes: [] });
      }
      if (seasonTitle) seasonMap.get(key).title = seasonTitle;
      seasonMap.get(key).episodes.push(episode);
    });

    const seasons = Array.from(seasonMap.values())
      .sort((a, b) => a.seasonNumber - b.seasonNumber)
      .map((season) => ({
        ...season,
        episodes: season.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
      }));

    const totalEpisodes = seasons.reduce((sum, season) => sum + season.episodes.length, 0);
    const firstEpisode = seasons[0] && seasons[0].episodes[0];

    // Series row par khud ka koi source/poster na ho to pehle episode se le lo,
    // taki card blank na dikhe aur "Play" seedha S1E1 chala de.
    const placeholderDurations = ['', 'N/A', 'Multiple Episodes'];

    return {
      ...video,
      type: 'series',
      seasons,
      thumbnail: video.thumbnail || (firstEpisode && firstEpisode.thumbnail) || '',
      backdrop: video.backdrop || video.thumbnail || (firstEpisode && firstEpisode.thumbnail) || '',
      embed_url: video.embed_url || (firstEpisode && firstEpisode.embed_url) || undefined,
      video_url: video.video_url || (firstEpisode && firstEpisode.video_url) || undefined,
      source_type:
        video.source_type && video.source_type !== 'custom'
          ? video.source_type
          : (firstEpisode && firstEpisode.source_type) || video.source_type,
      duration: placeholderDurations.includes(video.duration) ? `${totalEpisodes} Episodes` : video.duration,
    };
  });
}

/** Categories sheet ki ek row -> CategoryItem */
export function rowToCategory(row, index) {
  const name = pick(row, 'name', 'category', 'title', 'genre');
  if (!name) return null;

  return {
    id: pick(row, 'id', 'categoryid') || `cat-${slugify(name)}`,
    name,
    slug: pick(row, 'slug') || slugify(name),
    iconName: pick(row, 'icon', 'iconname') || 'Film',
    count: toNumber(pick(row, 'count', 'total'), 0),
    backdrop: pick(row, 'backdrop', 'image', 'banner', 'cover') || '',
    description: pick(row, 'description', 'about') || `${name} collection`,
    _order: index,
  };
}

const ICON_BY_GENRE = {
  action: 'Flame',
  adventure: 'Compass',
  animation: 'Sparkles',
  anime: 'Sparkles',
  biography: 'User',
  bollywood: 'Clapperboard',
  comedy: 'Laugh',
  crime: 'Fingerprint',
  documentary: 'Globe',
  drama: 'HeartHandshake',
  family: 'Users',
  fantasy: 'Wand2',
  history: 'Landmark',
  hollywood: 'Clapperboard',
  horror: 'Ghost',
  music: 'Music',
  mystery: 'Eye',
  romance: 'Heart',
  'sci-fi': 'Rocket',
  scifi: 'Rocket',
  sport: 'Trophy',
  sports: 'Trophy',
  thriller: 'Eye',
  war: 'Swords',
  western: 'Mountain',
};

/** Categories sheet na ho to genres se apne aap categories bana deta hai. */
export function deriveCategories(videos) {
  const buckets = new Map();

  videos.forEach((video) => {
    (video.genre || []).forEach((genre) => {
      const slug = slugify(genre);
      if (!slug) return;
      if (!buckets.has(slug)) {
        buckets.set(slug, { name: genre, slug, count: 0, backdrop: '' });
      }
      const bucket = buckets.get(slug);
      bucket.count += 1;
      if (!bucket.backdrop) bucket.backdrop = video.backdrop || video.thumbnail || '';
    });
  });

  return Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .map((bucket) => ({
      id: `cat-${bucket.slug}`,
      name: bucket.name,
      slug: bucket.slug,
      iconName: ICON_BY_GENRE[bucket.slug] || ICON_BY_GENRE[bucket.name.toLowerCase()] || 'Film',
      count: bucket.count,
      backdrop: bucket.backdrop,
      description: `${bucket.count} ${bucket.count === 1 ? 'title' : 'titles'} in ${bucket.name}`,
    }));
}

/** Response bhejne se pehle internal fields (_order, _addedAt) hata deta hai. */
export function stripInternal(item) {
  if (!item || typeof item !== 'object') return item;
  const clean = {};
  Object.keys(item).forEach((key) => {
    if (!key.startsWith('_')) clean[key] = item[key];
  });
  return clean;
}
