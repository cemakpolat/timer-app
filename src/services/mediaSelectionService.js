const MEDIA_SELECTIONS_KEY = 'mediaSelections';
export const MEDIA_SELECTIONS_EVENT = 'media-selections-changed';

const EXPECTED_ASSET_TYPE_BY_KIND = {
  music: 'audio',
  video: 'video',
};

function normalizeSelectionKind(kind) {
  return Object.prototype.hasOwnProperty.call(EXPECTED_ASSET_TYPE_BY_KIND, kind)
    ? kind
    : null;
}

function normalizePositiveNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue >= 0 ? numericValue : null;
}

function createSelectionId(kind) {
  return `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSelectionDedupKey(item = {}) {
  return `${item.sourceId || 'direct'}::${item.assetId}`;
}

export function normalizeMediaSelection(item = {}, kind) {
  const normalizedKind = normalizeSelectionKind(kind);
  if (!normalizedKind || !item || typeof item !== 'object') {
    return null;
  }

  const assetId = item.assetId || item.id;
  if (!assetId) {
    return null;
  }

  const assetType = item.assetType || EXPECTED_ASSET_TYPE_BY_KIND[normalizedKind];
  if (assetType !== EXPECTED_ASSET_TYPE_BY_KIND[normalizedKind]) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    selectionId: item.selectionId || createSelectionId(normalizedKind),
    assetId: String(assetId),
    sourceId: item.sourceId ? String(item.sourceId) : null,
    sourceType: item.sourceType ? String(item.sourceType) : (item.provider ? String(item.provider) : null),
    assetType,
    name: item.name || item.title || 'Untitled media',
    mimeType: item.mimeType || null,
    relativePath: item.relativePath || item.path || null,
    posterUrl: item.posterUrl || null,
    duration: normalizePositiveNumber(item.duration),
    createdAt: item.createdAt || now,
    updatedAt: now,
  };
}

function emitSelectionsChanged(selections) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(MEDIA_SELECTIONS_EVENT, {
    detail: selections,
  }));
}

function getEmptySelections() {
  return {
    music: [],
    video: [],
  };
}

function normalizeSelections(items = [], kind) {
  const seenKeys = new Set();

  return items
    .map((item) => normalizeMediaSelection(item, kind))
    .filter((item) => {
      if (!item) {
        return false;
      }

      const dedupKey = getSelectionDedupKey(item);
      if (seenKeys.has(dedupKey)) {
        return false;
      }

      seenKeys.add(dedupKey);
      return true;
    });
}

function loadSelectionsState() {
  if (typeof window === 'undefined') {
    return getEmptySelections();
  }

  try {
    const stored = localStorage.getItem(MEDIA_SELECTIONS_KEY);
    if (!stored) {
      return getEmptySelections();
    }

    const parsed = JSON.parse(stored);
    return {
      music: normalizeSelections(Array.isArray(parsed?.music) ? parsed.music : [], 'music'),
      video: normalizeSelections(Array.isArray(parsed?.video) ? parsed.video : [], 'video'),
    };
  } catch (error) {
    console.error('Failed to load media selections:', error);
    return getEmptySelections();
  }
}

function saveSelectionsState(selections) {
  if (typeof window === 'undefined') {
    return selections;
  }

  localStorage.setItem(MEDIA_SELECTIONS_KEY, JSON.stringify(selections));
  emitSelectionsChanged(selections);
  return selections;
}

export function getMediaSelections(kind) {
  const normalizedKind = normalizeSelectionKind(kind);
  if (!normalizedKind) {
    return [];
  }

  return loadSelectionsState()[normalizedKind];
}

export function saveMediaSelections(kind, items = []) {
  const normalizedKind = normalizeSelectionKind(kind);
  if (!normalizedKind) {
    return [];
  }

  const nextSelections = loadSelectionsState();
  nextSelections[normalizedKind] = normalizeSelections(items, normalizedKind);
  saveSelectionsState(nextSelections);
  return nextSelections[normalizedKind];
}

export function addMediaSelection(kind, item) {
  return saveMediaSelections(kind, [...getMediaSelections(kind), item]);
}

export function removeMediaSelection(kind, selectionId) {
  return saveMediaSelections(kind, getMediaSelections(kind).filter((item) => item.selectionId !== selectionId));
}

export function moveMediaSelection(kind, fromIndex, toIndex) {
  const currentSelections = [...getMediaSelections(kind)];
  if (fromIndex < 0 || fromIndex >= currentSelections.length || toIndex < 0 || toIndex >= currentSelections.length) {
    return currentSelections;
  }

  const [movedItem] = currentSelections.splice(fromIndex, 1);
  currentSelections.splice(toIndex, 0, movedItem);
  return saveMediaSelections(kind, currentSelections);
}

const mediaSelectionService = {
  addMediaSelection,
  getMediaSelections,
  moveMediaSelection,
  normalizeMediaSelection,
  removeMediaSelection,
  saveMediaSelections,
};

export default mediaSelectionService;