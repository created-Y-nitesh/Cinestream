/**
 * Filtering / sorting / searching — frontend ke filterMockVideos() jaisa hi behaviour,
 * bas server par, taki mobile par kam data aur kam kaam ho.
 */

function lower(value) {
  return String(value || '').toLowerCase();
}

export function filterVideos(videos, options = {}) {
  let result = [...videos];

  if (options.type && options.type !== 'all') {
    result = result.filter((video) => video.type === options.type);
  }

  if (options.genre && lower(options.genre) !== 'all') {
    const needle = lower(options.genre);
    result = result.filter((video) =>
      (video.genre || []).some((genre) => lower(genre).includes(needle) || needle.includes(lower(genre))),
    );
  }

  if (options.year) {
    const year = Number(options.year);
    if (Number.isFinite(year)) {
      result = result.filter((video) => video.year === year);
    }
  }

  if (options.quality && options.quality !== 'all') {
    result = result.filter((video) => lower(video.quality).includes(lower(options.quality)));
  }

  if (options.language && options.language !== 'all') {
    result = result.filter((video) => lower(video.language).includes(lower(options.language)));
  }

  if (options.search && options.search.trim()) {
    const q = lower(options.search).trim();
    result = result.filter((video) =>
      lower(video.title).includes(q) ||
      lower(video.description).includes(q) ||
      (video.genre || []).some((genre) => lower(genre).includes(q)) ||
      (video.tags || []).some((tag) => lower(tag).includes(q)) ||
      (video.cast || []).some((person) => lower(person).includes(q)) ||
      lower(video.director).includes(q) ||
      lower(video.language).includes(q),
    );
  }

  return sortVideos(result, options.sortBy);
}

export function sortVideos(videos, sortBy) {
  const result = [...videos];

  switch (sortBy) {
    case 'rating':
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'newest':
      result.sort((a, b) => (b.year - a.year) || (a._order ?? 0) - (b._order ?? 0));
      break;
    case 'title':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'popular':
      result.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || (b.rating || 0) - (a.rating || 0));
      break;
    default:
      break; // sheet ka natural order
  }

  return result;
}

/** "Recently added" — sheet ka date column ho to wahi, warna last row = newest. */
export function sortByRecent(videos) {
  return [...videos].sort((a, b) => {
    const aTime = Date.parse(a._addedAt || '');
    const bTime = Date.parse(b._addedAt || '');
    const aValid = Number.isFinite(aTime);
    const bValid = Number.isFinite(bTime);

    if (aValid && bValid && aTime !== bTime) return bTime - aTime;
    if (aValid !== bValid) return aValid ? -1 : 1;

    return (b._order ?? 0) - (a._order ?? 0);
  });
}

/** Genre/tag overlap ke hisaab se milte-julte videos. */
export function relatedVideos(videos, target, limit = 8) {
  if (!target) return [];

  const genres = new Set((target.genre || []).map(lower));
  const tags = new Set((target.tags || []).map(lower));

  return videos
    .filter((video) => video.id !== target.id)
    .map((video) => {
      // Pehle sirf genre/tag overlap — isi se decide hota hai ki related hai ya nahi.
      let overlap = 0;
      (video.genre || []).forEach((genre) => {
        if (genres.has(lower(genre))) overlap += 3;
      });
      (video.tags || []).forEach((tag) => {
        if (tags.has(lower(tag))) overlap += 1;
      });

      // Type / language sirf tie-breaker bonus hain.
      let score = overlap;
      if (overlap > 0 && video.type === target.type) score += 1;
      if (overlap > 0 && video.language && video.language === target.language) score += 1;

      return { video, score, overlap };
    })
    .filter((entry) => entry.overlap > 0)
    .sort((a, b) => b.score - a.score || (b.video.rating || 0) - (a.video.rating || 0))
    .slice(0, limit)
    .map((entry) => entry.video);
}
