import {
  addMediaSelection,
  getMediaSelections,
  moveMediaSelection,
  removeMediaSelection,
  saveMediaSelections,
} from '../services/mediaSelectionService';

describe('mediaSelectionService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('stores separate ordered music and video selections using metadata only', () => {
    const savedMusicSelections = saveMediaSelections('music', [
      {
        id: 'track-1',
        sourceId: 'cloud-audio-source',
        sourceType: 'generic-manifest',
        assetType: 'audio',
        name: 'Focus Loop',
        mimeType: 'audio/mpeg',
        duration: 180,
        url: 'https://cdn.example.com/audio/focus-loop.mp3',
      },
    ]);

    const savedVideoSelections = saveMediaSelections('video', [
      {
        id: 'video-1',
        sourceId: 'cloud-video-source',
        sourceType: 'generic-manifest',
        assetType: 'video',
        name: 'Ocean Loop',
        mimeType: 'video/mp4',
        duration: 45,
        posterUrl: 'https://cdn.example.com/posters/ocean.jpg',
        url: 'https://cdn.example.com/video/ocean.mp4',
      },
    ]);

    expect(savedMusicSelections).toHaveLength(1);
    expect(savedMusicSelections[0]).toMatchObject({
      assetId: 'track-1',
      sourceId: 'cloud-audio-source',
      assetType: 'audio',
      name: 'Focus Loop',
    });
    expect(savedMusicSelections[0].url).toBeUndefined();

    expect(savedVideoSelections).toHaveLength(1);
    expect(savedVideoSelections[0]).toMatchObject({
      assetId: 'video-1',
      sourceId: 'cloud-video-source',
      assetType: 'video',
      posterUrl: 'https://cdn.example.com/posters/ocean.jpg',
    });
    expect(savedVideoSelections[0].url).toBeUndefined();

    expect(getMediaSelections('music')).toHaveLength(1);
    expect(getMediaSelections('video')).toHaveLength(1);
  });

  test('deduplicates repeated assets when adding selections', () => {
    addMediaSelection('music', {
      id: 'track-1',
      sourceId: 'cloud-audio-source',
      sourceType: 'generic-manifest',
      assetType: 'audio',
      name: 'Focus Loop',
    });

    const selections = addMediaSelection('music', {
      id: 'track-1',
      sourceId: 'cloud-audio-source',
      sourceType: 'generic-manifest',
      assetType: 'audio',
      name: 'Focus Loop Duplicate',
    });

    expect(selections).toHaveLength(1);
    expect(selections[0].name).toBe('Focus Loop');
  });

  test('reorders and removes persisted selections', () => {
    const savedSelections = saveMediaSelections('music', [
      {
        id: 'track-1',
        sourceId: 'source-a',
        sourceType: 'generic-manifest',
        assetType: 'audio',
        name: 'First Track',
      },
      {
        id: 'track-2',
        sourceId: 'source-a',
        sourceType: 'generic-manifest',
        assetType: 'audio',
        name: 'Second Track',
      },
    ]);

    const reorderedSelections = moveMediaSelection('music', 1, 0);
    expect(reorderedSelections.map((item) => item.assetId)).toEqual(['track-2', 'track-1']);

    const remainingSelections = removeMediaSelection('music', savedSelections[0].selectionId);
    expect(remainingSelections).toHaveLength(1);
    expect(remainingSelections[0].assetId).toBe('track-2');
  });
});