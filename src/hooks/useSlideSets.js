import { useState, useCallback, useEffect } from 'react';
import { DEFAULT_SLIDE_TRANSITION, normalizeSlideTransition } from '../utils/slideTransitions';

const createMediaItem = (type, assetId) => ({
  id: `${type}:${assetId}`,
  type,
  assetId,
});

const normalizeMediaItems = (slideSet) => {
  if (Array.isArray(slideSet?.mediaItems)) {
    return slideSet.mediaItems
      .map((item) => {
        if (!item || !item.type || !item.assetId) {
          return null;
        }

        return {
          id: item.id || `${item.type}:${item.assetId}`,
          type: item.type,
          assetId: item.assetId,
        };
      })
      .filter(Boolean);
  }

  if (Array.isArray(slideSet?.imageIds)) {
    return slideSet.imageIds.map((imageId) => createMediaItem('image', imageId));
  }

  return [];
};

const normalizeSlideSet = (slideSet) => {
  const mediaItems = normalizeMediaItems(slideSet);

  return {
    id: slideSet?.id || `set_${Date.now()}`,
    name: slideSet?.name?.trim() || 'Untitled Set',
    mediaItems,
    imageIds: mediaItems.filter((item) => item.type === 'image').map((item) => item.assetId),
    intervalSec: Math.max(1, Math.min(60, parseInt(slideSet?.intervalSec, 10) || 5)),
    transition: normalizeSlideTransition(slideSet?.transition),
  };
};

const mapSlideSets = (slideSets, transform) => slideSets.map((slideSet) => normalizeSlideSet(transform(normalizeSlideSet(slideSet))));

/**
 * Hook to manage background media slide sets.
 * A slide set is an ordered collection of image and video items that plays as a slideshow.
 *
 * Data shape:
 *   slideSets: Array<{ id, name, mediaItems: Array<{ id, type, assetId }>, imageIds: string[], intervalSec: number, transition: string }>
 *   activeSlideSetId: string | null   -- which set is selected for playback
 */
const useSlideSets = () => {
  const [slideSets, setSlideSets] = useState(() => {
    try {
      const stored = localStorage.getItem('slideSets');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.map(normalizeSlideSet) : [];
    } catch {
      return [];
    }
  });

  const [activeSlideSetId, setActiveSlideSetIdState] = useState(() => {
    try {
      return localStorage.getItem('activeSlideSetId') || null;
    } catch {
      return null;
    }
  });

  // Persist slideSets whenever they change
  useEffect(() => {
    localStorage.setItem('slideSets', JSON.stringify(slideSets));
  }, [slideSets]);

  // Persist active slide set ID
  useEffect(() => {
    if (activeSlideSetId) {
      localStorage.setItem('activeSlideSetId', activeSlideSetId);
    } else {
      localStorage.removeItem('activeSlideSetId');
    }
  }, [activeSlideSetId]);

  /** Create a new empty slide set, returns the new id */
  const createSlideSet = useCallback((name) => {
    const id = `set_${Date.now()}`;
    const newSet = normalizeSlideSet({
      id,
      name: name.trim() || 'Untitled Set',
      mediaItems: [],
      intervalSec: 5,
      transition: DEFAULT_SLIDE_TRANSITION,
    });
    setSlideSets(prev => [...prev, newSet]);
    return id;
  }, []);

  /** Delete a slide set by id */
  const deleteSlideSet = useCallback((id) => {
    setSlideSets(prev => prev.filter(s => s.id !== id));
    setActiveSlideSetIdState(prev => (prev === id ? null : prev));
  }, []);

  /** Rename a slide set */
  const renameSlideSet = useCallback((id, name) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => (s.id === id ? { ...s, name: name.trim() || s.name } : s))
    );
  }, []);

  /** Set the interval (in seconds) for a slide set */
  const setSlideInterval = useCallback((id, intervalSec) => {
    const sec = Math.max(1, Math.min(60, parseInt(intervalSec, 10) || 5));
    setSlideSets(prev =>
      mapSlideSets(prev, s => (s.id === id ? { ...s, intervalSec: sec } : s))
    );
  }, []);

  /** Set transition style for a slide set */
  const setSlideTransition = useCallback((id, transition) => {
    const normalizedTransition = normalizeSlideTransition(transition);
    setSlideSets(prev =>
      mapSlideSets(prev, s => (s.id === id ? { ...s, transition: normalizedTransition } : s))
    );
  }, []);

  /** Add an image ID to a slide set (no duplicates) */
  const addImageToSet = useCallback((setId, imageId) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => {
        if (s.id !== setId) return s;
        if (s.mediaItems.some((item) => item.type === 'image' && item.assetId === imageId)) return s;
        return { ...s, mediaItems: [...s.mediaItems, createMediaItem('image', imageId)] };
      })
    );
  }, []);

  /** Add a video ID to a slide set (no duplicates) */
  const addVideoToSet = useCallback((setId, videoId) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => {
        if (s.id !== setId) return s;
        if (s.mediaItems.some((item) => item.type === 'video' && item.assetId === videoId)) return s;
        return { ...s, mediaItems: [...s.mediaItems, createMediaItem('video', videoId)] };
      })
    );
  }, []);

  /** Remove an image ID from a slide set */
  const removeImageFromSet = useCallback((setId, imageId) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => (
        s.id !== setId
          ? s
          : { ...s, mediaItems: s.mediaItems.filter((item) => !(item.type === 'image' && item.assetId === imageId)) }
      ))
    );
  }, []);

  /** Remove a media item from a slide set */
  const removeMediaItemFromSet = useCallback((setId, mediaItemId) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => (
        s.id !== setId ? s : { ...s, mediaItems: s.mediaItems.filter((item) => item.id !== mediaItemId) }
      ))
    );
  }, []);

  /** Reorder media items within a slide set */
  const reorderMediaItems = useCallback((setId, fromIndex, toIndex) => {
    setSlideSets(prev =>
      mapSlideSets(prev, s => {
        if (s.id !== setId) return s;
        const items = [...s.mediaItems];
        const [moved] = items.splice(fromIndex, 1);
        if (!moved) {
          return s;
        }
        items.splice(toIndex, 0, moved);
        return { ...s, mediaItems: items };
      })
    );
  }, []);

  /** Activate a slide set for background playback (null = disable slideshow) */
  const setActiveSlideSetId = useCallback((id) => {
    setActiveSlideSetIdState(id);
  }, []);

  /** Get the active slide set object or null */
  const getActiveSlideSet = useCallback(() => {
    if (!activeSlideSetId) return null;
    return slideSets.find(s => s.id === activeSlideSetId) || null;
  }, [activeSlideSetId, slideSets]);

  return {
    slideSets,
    activeSlideSetId,
    createSlideSet,
    deleteSlideSet,
    renameSlideSet,
    setSlideInterval,
    setSlideTransition,
    addImageToSet,
    addVideoToSet,
    removeImageFromSet,
    removeMediaItemFromSet,
    reorderMediaItems,
    setActiveSlideSetId,
    getActiveSlideSet,
  };
};

export default useSlideSets;
