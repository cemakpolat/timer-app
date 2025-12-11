import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Plus, Trash, ChevronLeft } from 'lucide-react';

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
  onBack
}) {
  const [allImages, setAllImages] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [selectedName, setSelectedName] = useState('');

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

  const isDeleteDisabled = selectedBackgroundId === 'None' || 
                          !allImages.find(img => img.id === selectedBackgroundId && !img.isBuiltIn);

  return (
    <div style={{ width: '100%' }}>
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
            Add
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
        maxHeight: '300px',
        overflowY: 'auto',
        paddingRight: 4
      }}>
        {allImages.map(img => (
          <div
            key={img.id}
            onClick={() => setSelectedBackgroundId(img.id)}
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
        Click an image to select it as your background. Custom images will be stored on this device.
      </div>
    </div>
  );
}
