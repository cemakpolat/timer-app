import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash, ChevronLeft, Images, Film, Link2 } from 'lucide-react';
import SlideSetPanel from './SlideSetPanel';
import BackgroundVideosPanel from './BackgroundVideosPanel';
import RemoteSourcesPanel from '../shared/RemoteSourcesPanel';
import RemoteSourceModal from '../shared/RemoteSourceModal';

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
  uploadBackgroundVideo,
  deleteBackgroundVideo,
  remoteBackgroundVideoSources = [],
  remoteBackgroundVideoSourceStatuses = [],
  addRemoteBackgroundVideoSource,
  deleteRemoteBackgroundVideoSource,
  refreshRemoteBackgroundVideos,
}) {
  const [activeTab, setActiveTab] = useState('images');
  const [allImages, setAllImages] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [selectedName, setSelectedName] = useState('');
  const [remoteSourceModalAssetType, setRemoteSourceModalAssetType] = useState(null);
  const totalRemoteSourceCount = remoteBackgroundImageSources.length + remoteBackgroundVideoSources.length;

  // Load all images and their URLs
  useEffect(() => {
    const loadImages = async () => {
      const images = getAllBackgroundImages();
      setAllImages(images);

      // Preload URLs for visible images
      const urls = {};
      for (const img of images) {
        if (img.id !== 'None') {
          try {
            const url = await getBackgroundImageUrl(img.id);
            if (url) urls[img.id] = url;
          } catch (e) {
            console.error(`Failed to load URL for ${img.id}:`, e);
          }
        }
      }
      setImageUrls(urls);

      // Get selected image name
      const selected = images.find(img => img.id === selectedBackgroundId);
      setSelectedName(selected ? selected.name : 'None');
    };

    loadImages();
  }, [getAllBackgroundImages, getBackgroundImageUrl, selectedBackgroundId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
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

  const handleAddRemoteSource = async () => {
    setRemoteSourceModalAssetType('image');
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

  const handleAddRemoteVideoSource = async () => {
    setRemoteSourceModalAssetType('video');
  };

  const handleConnectRemoteSource = async (sourceInput) => {
    try {
      const source = remoteSourceModalAssetType === 'video'
        ? await addRemoteBackgroundVideoSource(sourceInput)
        : await addRemoteBackgroundImageSource(sourceInput);

      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `Connected remote ${remoteSourceModalAssetType === 'video' ? 'video' : 'image'} source: ${source.name}`,
          type: 'success',
          ttl: 3000,
        }
      }));
      setRemoteSourceModalAssetType(null);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: {
          message: `❌ Failed to connect remote source: ${error.message}`,
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
      {remoteSourceModalAssetType && (
        <RemoteSourceModal
          theme={theme}
          getTextOpacity={getTextOpacity}
          assetType={remoteSourceModalAssetType}
          onClose={() => setRemoteSourceModalAssetType(null)}
          onConnect={handleConnectRemoteSource}
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

      {/* Tabs: Images | Slide Sets | Videos | Sources */}
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
        <button style={tabStyle('sources')} onClick={() => setActiveTab('sources')}>
          <Link2 size={13} /> Sources
          {totalRemoteSourceCount > 0 && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block', marginLeft: 2 }} title="Remote sources connected" />
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
          remoteBackgroundVideoSources={remoteBackgroundVideoSources}
          remoteBackgroundVideoSourceStatuses={remoteBackgroundVideoSourceStatuses}
          addRemoteBackgroundVideoSource={addRemoteBackgroundVideoSource}
          deleteRemoteBackgroundVideoSource={deleteRemoteBackgroundVideoSource}
          refreshRemoteBackgroundVideos={refreshRemoteBackgroundVideos}
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
        />
      )}

      {activeTab === 'sources' && (
        <div style={{ width: '100%' }}>
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: theme.text, margin: '0 0 6px' }}>
              Remote Sources
            </h3>
            <div style={{ fontSize: 11, color: getTextOpacity(theme, 0.46), lineHeight: 1.4 }}>
              Keep uploads and remote libraries separate. Connect or refresh public sources here.
            </div>
          </div>

          <RemoteSourcesPanel
            theme={theme}
            getTextOpacity={getTextOpacity}
            title="Remote Image Sources"
            description="Public GitHub or JSON manifests for image libraries."
            sources={remoteBackgroundImageSources}
            sourceStatuses={remoteBackgroundImageSourceStatuses}
            onAddSource={handleAddRemoteSource}
            onRefreshSources={handleRefreshRemoteSources}
            onRemoveSource={handleDeleteRemoteSource}
          />

          <RemoteSourcesPanel
            theme={theme}
            getTextOpacity={getTextOpacity}
            title="Remote Video Sources"
            description="Public GitHub or JSON manifests for streamed MP4 and WebM backgrounds."
            sources={remoteBackgroundVideoSources}
            sourceStatuses={remoteBackgroundVideoSourceStatuses}
            onAddSource={handleAddRemoteVideoSource}
            onRefreshSources={handleRefreshRemoteVideoSources}
            onRemoveSource={handleDeleteRemoteVideoSource}
          />
        </div>
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
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            style={{ display: 'none' }}
            id="bg-image-upload"
          />
          <button
            onClick={() => document.getElementById('bg-image-upload').click()}
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
            title="Add background image"
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

      {/* Selected Image Preview */}
      {selectedBackgroundId !== 'None' && imageUrls[selectedBackgroundId] && (
        <div style={{
          marginBottom: 12,
          borderRadius: theme.borderRadius,
          overflow: 'hidden',
          border: `2px solid ${theme.accent}`,
          background: 'rgba(0,0,0,0.2)'
        }}>
          <img
            src={imageUrls[selectedBackgroundId]}
            alt={selectedName}
            style={{
              width: '100%',
              height: '120px',
              objectFit: 'cover'
            }}
          />
          <div style={{
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.3)',
            color: theme.text,
            fontSize: 12,
            fontWeight: 500,
            textAlign: 'center'
          }}>
            {selectedName}
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
        maxHeight: '260px',
        overflowY: 'auto',
        paddingRight: 4
      }}>
        {allImages.map(img => (
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
                gap: 6
              }}>
                <ImageIcon size={24} color={getTextOpacity(theme, 0.4)} />
                <div style={{
                  fontSize: 11,
                  color: getTextOpacity(theme, 0.4),
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  None
                </div>
              </div>
            ) : imageUrls[img.id] ? (
              <>
                {(img.isRemote || (!img.isBuiltIn && img.id !== 'None')) && (
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    zIndex: 1,
                    padding: '3px 6px',
                    borderRadius: 999,
                    background: img.isRemote ? `${theme.accent}dd` : 'rgba(0,0,0,0.65)',
                    color: '#fff',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    {img.isRemote ? 'Remote' : 'Local'}
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
                  padding: '12px 8px 8px 8px',
                  color: '#fff',
                  fontSize: 11,
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
        ))}
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
