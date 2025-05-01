import { useState, FormEvent } from 'react';
import { SpotifyClient, SpotifySearchResponse } from '../../../spotify-utils/src';

interface SpotifySearchProps {
  spotifyClient: SpotifyClient;
}

export function SpotifySearch({ spotifyClient }: SpotifySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'album' | 'artist' | 'playlist' | 'track'>('track');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifySearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError(null);
      
      const results = await spotifyClient.search.search({
        q: searchQuery,
        type: searchType,
        limit: 10
      });
      
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const renderResults = () => {
    if (!searchResults) return null;
    
    const items = searchResults[`${searchType}s`]?.items || [];
    
    if (items.length === 0) {
      return <p>No results found</p>;
    }
    
    return (
      <div className="search-results">
        <h3>Search Results</h3>
        <ul>
          {items.map((item: any, index: number) => (
            <li key={item.id || index}>
              {searchType === 'track' && (
                <>
                  <strong>{item.name}</strong> by {item.artists?.[0]?.name}
                  {item.album && <span> on {item.album.name}</span>}
                </>
              )}
              
              {searchType === 'artist' && (
                <>
                  <strong>{item.name}</strong>
                  {item.genres && item.genres.length > 0 && (
                    <span> ({item.genres.join(', ')})</span>
                  )}
                </>
              )}
              
              {searchType === 'album' && (
                <>
                  <strong>{item.name}</strong> by {item.artists?.[0]?.name}
                  {item.release_date && <span> ({item.release_date.split('-')[0]})</span>}
                </>
              )}
              
              {searchType === 'playlist' && (
                <>
                  <strong>{item.name}</strong> by {item.owner?.display_name}
                  {item.tracks && <span> ({item.tracks.total} tracks)</span>}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="spotify-search">
      <h2>Spotify Search</h2>
      
      {error && (
        <div className="error">
          <p>Error: {error}</p>
        </div>
      )}
      
      <form onSubmit={handleSearch}>
        <div className="search-controls">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for music..."
            disabled={isSearching}
          />
          
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as any)}
            disabled={isSearching}
          >
            <option value="track">Tracks</option>
            <option value="artist">Artists</option>
            <option value="album">Albums</option>
            <option value="playlist">Playlists</option>
          </select>
          
          <button type="submit" disabled={isSearching || !searchQuery.trim()}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {renderResults()}
    </div>
  );
} 