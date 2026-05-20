import { useState, useCallback, useEffect } from 'react';

/**
 * Hook to manage background image slide sets.
 * A slide set is a named collection of image IDs that plays as a slideshow.
 *
 * Data shape:
 *   slideSets: Array<{ id, name, imageIds: string[], intervalSec: number, transition: 'fade'|'instant' }>
 *   activeSlideSetId: string | null   -- which set is selected for playback
 */
const useSlideSets = () => {
  const [slideSets, setSlideSets] = useState(() => {
    try {
      const stored = localStorage.getItem('slideSets');
      return stored ? JSON.parse(stored) : [];
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
    const newSet = { id, name: name.trim() || 'Untitled Set', imageIds: [], intervalSec: 5, transition: 'fade' };
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
      prev.map(s => (s.id === id ? { ...s, name: name.trim() || s.name } : s))
    );
  }, []);

  /** Set the interval (in seconds) for a slide set */
  const setSlideInterval = useCallback((id, intervalSec) => {
    const sec = Math.max(1, Math.min(60, parseInt(intervalSec, 10) || 5));
    setSlideSets(prev =>
      prev.map(s => (s.id === id ? { ...s, intervalSec: sec } : s))
    );
  }, []);

  /** Set transition style for a slide set */
  const setSlideTransition = useCallback((id, transition) => {
    setSlideSets(prev =>
      prev.map(s => (s.id === id ? { ...s, transition } : s))
    );
  }, []);

  /** Add an image ID to a slide set (no duplicates) */
  const addImageToSet = useCallback((setId, imageId) => {
    setSlideSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;
        if (s.imageIds.includes(imageId)) return s;
        return { ...s, imageIds: [...s.imageIds, imageId] };
      })
    );
  }, []);

  /** Remove an image ID from a slide set */
  const removeImageFromSet = useCallback((setId, imageId) => {
    setSlideSets(prev =>
      prev.map(s =>
        s.id !== setId ? s : { ...s, imageIds: s.imageIds.filter(id => id !== imageId) }
      )
    );
  }, []);

  /** Reorder images within a slide set */
  const reorderImages = useCallback((setId, fromIndex, toIndex) => {
    setSlideSets(prev =>
      prev.map(s => {
        if (s.id !== setId) return s;
        const ids = [...s.imageIds];
        const [moved] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, moved);
        return { ...s, imageIds: ids };
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
    removeImageFromSet,
    reorderImages,
    setActiveSlideSetId,
    getActiveSlideSet,
  };
};

export default useSlideSets;
