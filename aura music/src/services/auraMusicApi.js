const API_BASE_URL = 'https://akdev-jiosaavnapi.netlify.app/api/search/songs';

/**
 * Decode HTML entities like " to plain text
 */
const decodeHTML = (html) => {
  const parser = new DOMParser();
  const decoded = parser.parseFromString(html, 'text/html');
  return decoded.body.textContent;
};

/**
 * Search for tracks using the AuraMusic API
 * @param {string} query - Search query
 * @returns {Promise<Object>} Search response
 */
export const searchTracks = async (query) => {
  if (!query.trim()) {
    return { data: { results: [], total: 0 } };
  }

  try {
    const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(query)}&limit=50`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      tracks: {
        items: data.data.results.map(song => ({
          id: song.id,
          name: decodeHTML(song.name),
          artists: [{ name: song?.artists?.primary?.[0]?.name || 'Unknown Artist' }],
          album: {
            name: decodeHTML(song.album?.name || 'Unknown Album'),
            images: [
              { url: song.image?.[2]?.url }
            ]
          },
          duration_ms: song.duration * 1000,
          preview_url: song.downloadUrl?.pop()?.url,
          year: song.year,
          external_urls: {
            auramusic: song.url
          }
        })),
        total: data.data.total
      }
    };
  } catch (error) {
    console.error('Error searching tracks:', error);
    throw error;
  }
};

/**
 * Get search suggestions (same API, but for autocomplete)
 * Returns formatted suggestions for search bar dropdown
 * @param {string} query - Search query
 * @returns {Promise<Object>} Suggestions response
 */
export const getSuggestions = async (query) => {
  if (!query.trim() || query.length < 2) {
    return { suggestions: [] };
  }

  try {
    const response = await fetch(`${API_BASE_URL}?query=${encodeURIComponent(query)}&limit=10`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      suggestions: data.data.results.slice(0, 8).map(song => ({
        id: song.id,
        name: decodeHTML(song.name),
        type: 'song',
        artist: song?.artists?.primary?.[0]?.name || 'Unknown Artist',
        image: song.image?.[2]?.url,
      }))
    };
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return { suggestions: [] };
  }
};
