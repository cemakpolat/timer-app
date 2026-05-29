import React, { useState, useEffect } from 'react';
import { Database, Image as ImageIcon, Plus, Trash, ChevronLeft, Images, Film } from 'lucide-react';
import SlideSetPanel from './SlideSetPanel';
import BackgroundVideosPanel from './BackgroundVideosPanel';
import MediaUploadsModal from '../shared/MediaUploadsModal';
import { saveLocalMediaSourceHandle, supportsLocalMediaLibrary } from '../../services/localMediaLibraryService';
import { createLocalFolderSource } from '../../services/remoteMediaSourcesService';

function getOriginCopy(item = {}) {
  if (item.isBuiltIn || item.id === 'None') {
    return null;
  }

  if (item.isLocal) {
    return {
      label: 'Folder',
      background: 'rgba(250,204,21,0.88)',
      color: '#111827',
    };
  }

  if (item.isRemote) {
    return {
      label: 'Cloud',
      background: 'rgba(59,130,246,0.9)',
      color: '#ffffff',
    };
  }

  return null;
}

function getStorageCopy(item = {}) {
  if (item.isBuiltIn || item.id === 'None') {
    return null;
  }

  const stored = !item.isRemote && !item.isLocal;

  return {
    stored,
    title: stored
      ? 'Stored in browser storage'
      : item.isLocal
        ? 'Not stored in browser storage · local folder'
        : 'Not stored in browser storage · remote source',
  };
}

/**
 * BackgroundImagesPanel Component
 * 
 * Allows users to:
 * - View and select from built-in background images
 * - Upload custom background images
 * - Delete custom background images
 * - Preview selected image with full name
 * 
 * Props:
 * - theme: Current theme object
 * - getTextOpacity: Function to get text opacity
 * - selectedBackgroundId: Currently selected background image id
 * - setSelectedBackgroundId: Callback to update selected background
 * - getAllBackgroundImages: Function to get all available backgrounds
 * - getBackgroundImageUrl: Function to get URL for a background image
 * - uploadBackgroundImage: Function to upload a new background image
 * - deleteBackgroundImage: Function to delete a background image
 * - addRemoteBackgroundImageSource: Function to add a remote image source
 * - deleteRemoteBackgroundImageSource: Function to delete a remote image source
 * - onBack: Callback to go back to settings main view
 */
export default function BackgroundImagesPanel({
  theme,
  getTextOpacity,
  selectedBackgroundId,
  setSelectedBackgroundId,
  getAllBackgroundImages,
  getBackgroundImageUrl,
  releaseBackgroundImageUrl,
  uploadBackgroundImage,
  deleteBackgroundImage,
  remoteBackgroundImageSources = [],
  remoteBackgroundImageSourceStatuses = [],
  addRemoteBackgroundImageSource,
  deleteRemoteBackgroundImageSource,
  refreshRemoteBackgroundImages,
  onBack,
  // Slide set props (optional — panel degrades gracefully without them)
  slideSets = [],
  activeSlideSetId = null,
  createSlideSet,
  deleteSlideSet,
  renameSlideSet,
  setSlideInterval,
  setSlideTransition,
  addImageToSet,
  addVideoToSet,
  removeImageFromSet,
  removeMediaItemFromSet,
  setActiveSlideSetId,
  // Video props
  selectedVideoId = 'None',
  setSelectedVideoId,
  getAllBackgroundVideos,
  getBackgroundVideoUrl,
  releaseBackgroundVideoUrl,
  uploadBackgroundVideo,
  deleteBackgroundVideo,
  remoteBackgroundVideoSources = [],
  remoteBackgroundVideoSourceStatuses = [],
  addRemoteBackgroundVideoSource,
  addLocalVideoSource,
  deleteRemoteBackgroundVideoSource,
  refreshRemoteBackgroundVideos,
  videoLoopFade,
  setVideoLoopFade,
  videoAudioEnabled = false,
  setVideoAudioEnabled,
}) {
  const [activeTab, setActiveTab] = useState('images');
  const [allImages, setAllImages] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [uploadModalAssetType, setUploadModalAssetType] = useState(null);
  const localFoldersSupported = supportsLocalMediaLibrary();

  // Load all images and their URLs
  useEffect(() => {
    let cancelled = false;
    const acquiredImageIds = [];

    const loadImages = async () => {
      const images = getAllBackgroundImages();

      // Preload URLs for visible images
      const urls = {};
      for (const img of images) {
        if (img.id !== 'None') {
          try {
            const url = await getBackgroundImageUrl(img.id);
            if (!url) {
              continue;
            }

            if (cancelled) {
              releaseBackgroundImageUrl?.(img.id);
              continue;
            }

            urls[img.id] = url;
            acquiredImageIds.push(img.id);
          } catch (e) {
            console.error(`Failed to load URL for ${img.id}:`, e);
          }
        }
      }

      if (cancelled) {
        return;
      }

      setAllImages(images);
      setImageUrls(urls);
    };

    loadImages();

    return () => {
      cancelled = true;
      acquiredImageIds.forEach((id) => {
        releaseBackgroundImageUrl?.(id);
      });
    };
  }, [getAllBackgroundImages, getBackgroundImageUrl, releaseBackgroundImageUrl, selectedBackgroundId]);

  const handleUpload = async (file) => {
    if (!file) return;

    try {
      await uploadBackgroundImage(file);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: '✅ Background image uploaded successfully!', type: 'success', ttl: 3000 }
      }));
      // Reload images
      const images = getAllBackgroundImages();
      setAllImages(images);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to upload image: ${error.message}`, type: 'error', ttl: 3000 }
      }));
    }
  };

  const handleDelete = async () => {
    if (selectedBackgroundId === 'None') {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Cannot delete None background', type: 'error', ttl: 3000 }
      }));
      return;
    }

    const selected = allImages.find(img => img.id === selectedBackgroundId);
    if (!selected || selected.isBuiltIn) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Cannot delete built-in background images', type: 'error', ttl: 3000 }
      }));
      return;
    }

    if (selected.isRemote) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Remove the remote source to remove this image.', type: 'error', ttl: 3000 }
      }));
      return;
    }

    try {
      await deleteBackgroundImage(selectedBackgroundId);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: '✅ Background image deleted successfully!', type: 'success', ttl: 3000 }
      }));
      // Reload images
      const images = getAllBackgroundImages();
      setAllImages(images);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to delete image: ${error.message}`, type: 'error', ttl: 3000 }
      }));
    }
  };

  const handleRefreshRemoteSources = async () => {
    if (typeof refreshRemoteBackgroundImages !== 'function') {
      return;
    }

    try {
      await refreshRemoteBackgroundImages();
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Remote image sources refreshed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to refresh remote sources: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  };

  const handleDeleteRemoteSource = async (sourceId) => {
    if (typeof deleteRemoteBackgroundImageSource !== 'function') {
      return;
    }

    try {
      await deleteRemoteBackgroundImageSource(sourceId);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Remote image source removed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to remove source: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  };

  const handleUploadVideoFile = async (file) => {
    const newVideo = await uploadBackgroundVideo(file);
    handleSelectVideo(newVideo.id);
    return newVideo;
  };

  const connectLocalFolderSource = async (assetType) => {
    if (!localFoldersSupported || typeof window.showDirectoryPicker !== 'function') {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Local folders need a compatible browser with File System Access support.', type: 'error', ttl: 3500 }
      }));
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      const source = createLocalFolderSource(directoryHandle, [assetType], {
        name: `${directoryHandle.name} ${assetType === 'video' ? 'videos' : 'images'}`,
      });

      await saveLocalMediaSourceHandle(source.directoryHandleKey || source.id, directoryHandle);
      if (assetType === 'video') {
        await addRemoteBackgroundVideoSource(source);
      } else {
        await addRemoteBackgroundImageSource(source);
      }

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `Connected local ${assetType} folder: ${source.name}`,
          type: 'success',
          ttl: 3000,
        }
      }));
    } catch (error) {
      if (error?.name === 'AbortError') {
        return;
      }

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `❌ Failed to connect local folder: ${error.message}`,
          type: 'error',
          ttl: 3500,
        }
      }));
    }
  };

  const handleConnectRemoteImageSource = async (sourceInput) => {
    try {
      const source = await addRemoteBackgroundImageSource(sourceInput);

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `Connected remote image source: ${source.name}`,
          type: 'success',
          ttl: 3000,
        }
      }));
      return source;
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `❌ Failed to connect remote image source: ${error.message}`,
          type: 'error',
          ttl: 3500,
        }
      }));
      throw error;
    }
  };

  const handleConnectRemoteVideoSource = async (sourceInput) => {
    try {
      const source = await addRemoteBackgroundVideoSource(sourceInput);

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `Connected remote video source: ${source.name}`,
          type: 'success',
          ttl: 3000,
        }
      }));
      return source;
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `❌ Failed to connect remote video source: ${error.message}`,
          type: 'error',
          ttl: 3500,
        }
      }));
      throw error;
    }
  };

  const handleRefreshRemoteVideoSources = async () => {
    if (typeof refreshRemoteBackgroundVideos !== 'function') {
      return;
    }

    try {
      await refreshRemoteBackgroundVideos();
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Remote video sources refreshed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to refresh remote video sources: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  };

  const handleDeleteRemoteVideoSource = async (sourceId) => {
    if (typeof deleteRemoteBackgroundVideoSource !== 'function') {
      return;
    }

    try {
      await deleteRemoteBackgroundVideoSource(sourceId);
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: 'Remote video source removed.', type: 'success', ttl: 2500 }
      }));
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: `❌ Failed to remove video source: ${error.message}`, type: 'error', ttl: 3500 }
      }));
    }
  };

  const handleSelectBackground = (backgroundId) => {
    if (backgroundId && backgroundId !== 'None') {
      if (typeof setSelectedVideoId === 'function' && selectedVideoId !== 'None') {
        setSelectedVideoId('None');
      }

      if (typeof setActiveSlideSetId === 'function' && activeSlideSetId) {
        setActiveSlideSetId(null);
      }
    }

    if (typeof setSelectedBackgroundId === 'function') {
      setSelectedBackgroundId(backgroundId);
    }
  };

  const handleSelectVideo = (videoId) => {
    if (videoId && videoId !== 'None') {
      if (typeof setSelectedBackgroundId === 'function' && selectedBackgroundId !== 'None') {
        setSelectedBackgroundId('None');
      }

      if (typeof setActiveSlideSetId === 'function' && activeSlideSetId) {
        setActiveSlideSetId(null);
      }
    }

    if (typeof setSelectedVideoId === 'function') {
      setSelectedVideoId(videoId);
    }
  };

  const handleSelectSlideSet = (slideSetId) => {
    if (slideSetId) {
      if (typeof setSelectedVideoId === 'function' && selectedVideoId !== 'None') {
        setSelectedVideoId('None');
      }

      if (typeof setSelectedBackgroundId === 'function' && selectedBackgroundId !== 'None') {
        setSelectedBackgroundId('None');
      }
    }

    if (typeof setActiveSlideSetId === 'function') {
      setActiveSlideSetId(slideSetId);
    }
  };

  const isDeleteDisabled = selectedBackgroundId === 'None' || 
                          !allImages.find(img => img.id === selectedBackgroundId && !img.isBuiltIn && !img.isRemote);
  const featuredImage = allImages.find((image) => image.id === selectedBackgroundId && image.id !== 'None' && imageUrls[image.id])
    || allImages.find((image) => image.id !== 'None' && imageUrls[image.id])
    || null;
  const storedImages = allImages
    .filter((image) => image.id !== 'None' && !image.isBuiltIn && !image.isRemote && !image.isLocal)
    .map((image) => ({ ...image, isStored: true }));
  const storedVideos = (getAllBackgroundVideos ? getAllBackgroundVideos() : [])
    .filter((video) => video.id !== 'None' && !video.isRemote && !video.isLocal)
    .map((video) => ({ ...video, isStored: true }));

  const tabStyle = (tab) => ({
    flex: 1,
    background: activeTab === tab ? theme.accent : 'transparent',
    border: 'none',
    borderRadius: theme.borderRadius,
    padding: '7px 0',
    color: activeTab === tab ? '#fff' : getTextOpacity(theme, 0.6),
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    transition: 'all 0.2s',
  });

  return (
    <div style={{ width: '100%' }}>
      {uploadModalAssetType && (
        <MediaUploadsModal
          theme={theme}
          getTextOpacity={getTextOpacity}
          assetType={uploadModalAssetType}
          onClose={() => setUploadModalAssetType(null)}
          uploadedItems={uploadModalAssetType === 'video' ? storedVideos : storedImages}
          onUploadFile={uploadModalAssetType === 'video' ? handleUploadVideoFile : handleUpload}
          sources={uploadModalAssetType === 'video' ? remoteBackgroundVideoSources : remoteBackgroundImageSources}
          sourceStatuses={uploadModalAssetType === 'video' ? remoteBackgroundVideoSourceStatuses : remoteBackgroundImageSourceStatuses}
          onAddRemoteSource={uploadModalAssetType === 'video' ? handleConnectRemoteVideoSource : handleConnectRemoteImageSource}
          onAddLocalSource={localFoldersSupported ? () => connectLocalFolderSource(uploadModalAssetType) : undefined}
          onRefreshSources={uploadModalAssetType === 'video' ? handleRefreshRemoteVideoSources : handleRefreshRemoteSources}
          onRemoveSource={uploadModalAssetType === 'video' ? handleDeleteRemoteVideoSource : handleDeleteRemoteSource}
          supportsLocalFolders={localFoldersSupported}
        />
      )}

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          borderRadius: theme.borderRadius,
          padding: '10px 12px',
          color: theme.text,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          marginBottom: 12,
          width: '100%'
        }}
        onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Tabs: Images | Slide Sets | Videos */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.05)', borderRadius: theme.borderRadius, padding: 4, marginBottom: 14 }}>
        <button style={tabStyle('images')} onClick={() => setActiveTab('images')}>
          <ImageIcon size={13} /> Images
        </button>
        <button style={tabStyle('slidesets')} onClick={() => setActiveTab('slidesets')}>
          <Images size={13} /> Slides
          {activeSlideSetId && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginLeft: 2 }} title="Slideshow active" />
          )}
        </button>
        <button style={tabStyle('videos')} onClick={() => setActiveTab('videos')}>
          <Film size={13} /> Video
          {selectedVideoId && selectedVideoId !== 'None' && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginLeft: 2 }} title="Video background active" />
          )}
        </button>
      </div>

      {/* Videos tab */}
      {activeTab === 'videos' && (
        <BackgroundVideosPanel
          theme={theme}
          getTextOpacity={getTextOpacity}
          selectedVideoId={selectedVideoId}
          setSelectedVideoId={handleSelectVideo}
          getAllBackgroundVideos={getAllBackgroundVideos}
          getBackgroundVideoUrl={getBackgroundVideoUrl}
          uploadBackgroundVideo={uploadBackgroundVideo}
          deleteBackgroundVideo={deleteBackgroundVideo}
          onOpenUploadModal={() => setUploadModalAssetType('video')}
          onOpenLocalFolder={typeof addLocalVideoSource === 'function' ? async () => {
            if (typeof window.showDirectoryPicker !== 'function') {
              window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: 'Local folders need a compatible browser with File System Access support.', type: 'error', ttl: 3500 }
              }));
              return;
            }

            try {
              const directoryHandle = await window.showDirectoryPicker();
              const source = await addLocalVideoSource(directoryHandle);
              window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: `Connected local video folder: ${source.name}`, type: 'success', ttl: 3000 }
              }));
            } catch (error) {
              if (error?.name === 'AbortError') {
                return;
              }

              window.dispatchEvent(new CustomEvent('app-toast', {
                detail: { message: `❌ Failed to connect local video folder: ${error.message}`, type: 'error', ttl: 3500 }
              }));
            }
          } : undefined}
          remoteBackgroundVideoSources={remoteBackgroundVideoSources}
          remoteBackgroundVideoSourceStatuses={remoteBackgroundVideoSourceStatuses}
          addRemoteBackgroundVideoSource={addRemoteBackgroundVideoSource}
          deleteRemoteBackgroundVideoSource={deleteRemoteBackgroundVideoSource}
          refreshRemoteBackgroundVideos={refreshRemoteBackgroundVideos}
          videoLoopFade={videoLoopFade}
          setVideoLoopFade={setVideoLoopFade}
          videoAudioEnabled={videoAudioEnabled}
          setVideoAudioEnabled={setVideoAudioEnabled}
        />
      )}

      {/* Slide Sets tab */}
      {activeTab === 'slidesets' && (
        <SlideSetPanel
          theme={theme}
          getTextOpacity={getTextOpacity}
          slideSets={slideSets}
          activeSlideSetId={activeSlideSetId}
          getAllBackgroundImages={getAllBackgroundImages}
          getBackgroundImageUrl={getBackgroundImageUrl}
          releaseBackgroundImageUrl={releaseBackgroundImageUrl}
          createSlideSet={createSlideSet}
          deleteSlideSet={deleteSlideSet}
          renameSlideSet={renameSlideSet}
          setSlideInterval={setSlideInterval}
          setSlideTransition={setSlideTransition}
          addImageToSet={addImageToSet}
          addVideoToSet={addVideoToSet}
          removeImageFromSet={removeImageFromSet}
          removeMediaItemFromSet={removeMediaItemFromSet}
          setActiveSlideSetId={handleSelectSlideSet}
          getAllBackgroundVideos={getAllBackgroundVideos}
          getBackgroundVideoUrl={getBackgroundVideoUrl}
          releaseBackgroundVideoUrl={releaseBackgroundVideoUrl}
        />
      )}

      {/* Images tab content below */}
      {activeTab === 'images' && (<>

      {/* Title and Add/Delete buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        justifyContent: 'space-between'
      }}>
        <h3 style={{
          fontSize: 14,
          fontWeight: 600,
          color: theme.text,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <ImageIcon size={16} /> Background Images
        </h3>

        {/* Add and Delete buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Add Button */}
          <button
            type="button"
            onClick={() => setUploadModalAssetType('image')}
            style={{
              background: theme.accent,
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '6px 10px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.8'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
            title="Open image uploads"
            aria-label="Open image uploads"
          >
            <Plus size={14} />
            Upload
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={isDeleteDisabled}
            style={{
              background: isDeleteDisabled ? 'rgba(255,255,255,0.1)' : '#ef4444',
              border: 'none',
              borderRadius: theme.borderRadius,
              padding: '6px 10px',
              color: '#fff',
              cursor: isDeleteDisabled ? 'not-allowed' : 'pointer',
              fontSize: 12,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s',
              opacity: isDeleteDisabled ? 0.4 : 1
            }}
            onMouseEnter={(e) => !isDeleteDisabled && (e.target.style.opacity = '0.8')}
            onMouseLeave={(e) => !isDeleteDisabled && (e.target.style.opacity = '1')}
            title={isDeleteDisabled ? "Select a custom image to delete" : "Delete selected image"}
          >
            <Trash size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Featured Image Preview */}
      {featuredImage ? (
        <div style={{
          marginBottom: 12,
          borderRadius: theme.borderRadius,
          overflow: 'hidden',
          border: `2px solid ${theme.accent}`,
          background: 'rgba(0,0,0,0.2)'
        }}>
          <img
            src={imageUrls[featuredImage.id]}
            alt={`${featuredImage.name} preview`}
            style={{
              width: '100%',
              height: '112px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.3)',
            color: theme.text,
            fontSize: 11,
            fontWeight: 500,
            textAlign: 'center'
          }}>
            {featuredImage.name}
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: 12,
          borderRadius: theme.borderRadius,
          border: `1px dashed ${getTextOpacity(theme, 0.2)}`,
          background: 'rgba(0,0,0,0.12)',
          padding: '22px 16px',
          color: getTextOpacity(theme, 0.55),
          textAlign: 'center',
          fontSize: 12,
          lineHeight: 1.5,
        }}>
          Select an image to feature it here.
        </div>
      )}

      {/* Scrollable thumbnails */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
        gap: 6,
        maxHeight: '176px',
        overflowY: 'auto',
        paddingRight: 4,
        alignContent: 'start'
      }}>
        {allImages.map(img => {
          const originCopy = getOriginCopy(img);
          const storageCopy = getStorageCopy(img);

          return (
            <div
              key={img.id}
              onClick={() => handleSelectBackground(img.id)}
              style={{
                position: 'relative',
                borderRadius: theme.borderRadius,
                overflow: 'hidden',
                cursor: 'pointer',
                border: selectedBackgroundId === img.id ? `2px solid ${theme.accent}` : `1px solid ${getTextOpacity(theme, 0.1)}`,
                background: img.id === 'None' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                aspectRatio: '1'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.accent;
                e.currentTarget.style.boxShadow = `0 0 8px ${getTextOpacity(theme, 0.2)}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedBackgroundId === img.id ? theme.accent : getTextOpacity(theme, 0.1);
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {img.id === 'None' ? (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 3
                }}>
                  <ImageIcon size={16} color={getTextOpacity(theme, 0.4)} />
                  <div style={{
                    fontSize: 9,
                    color: getTextOpacity(theme, 0.4),
                    fontWeight: 500,
                    textAlign: 'center'
                  }}>
                    None
                  </div>
                </div>
              ) : imageUrls[img.id] ? (
                <>
                  {originCopy && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      zIndex: 1,
                      padding: '1px 4px',
                      borderRadius: 999,
                      background: originCopy.background,
                      color: originCopy.color,
                      fontSize: 8,
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {originCopy.label}
                    </div>
                  )}
                  {storageCopy && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      zIndex: 1,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: storageCopy.stored ? 'rgba(34,197,94,0.92)' : 'rgba(15,23,42,0.82)',
                      color: storageCopy.stored ? '#052e16' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }} title={storageCopy.title}>
                      <Database size={9} />
                    </div>
                  )}
                  <img
                    src={imageUrls[img.id]}
                    alt={img.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    padding: '8px 5px 5px 5px',
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: 500,
                    textAlign: 'center',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}>
                    {img.name}
                  </div>
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: getTextOpacity(theme, 0.4)
                }}>
                  Loading...
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help text */}
      <div style={{
        fontSize: 11,
        color: getTextOpacity(theme, 0.4),
        marginTop: 12,
        lineHeight: 1.4
      }}>
        Click an image to select it as your background. Uploads stay on this device. Remote images are validated before they appear here.
      </div>
      </>)}
    </div>
  );
}
