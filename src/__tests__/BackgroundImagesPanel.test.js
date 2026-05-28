import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BackgroundImagesPanel from '../components/panels/BackgroundImagesPanel';

describe('BackgroundImagesPanel', () => {
  const createProps = (overrides = {}) => ({
    theme: {
      accent: '#3b82f6',
      text: '#ffffff',
      borderRadius: 8,
    },
    getTextOpacity: (_theme, opacity) => `rgba(255,255,255,${opacity})`,
    selectedBackgroundId: 'image-1',
    setSelectedBackgroundId: jest.fn(),
    getAllBackgroundImages: jest.fn(() => [
      { id: 'None', name: 'None' },
      { id: 'image-1', name: 'Focus Background', isBuiltIn: false },
    ]),
    getBackgroundImageUrl: jest.fn().mockResolvedValue(null),
    uploadBackgroundImage: jest.fn(),
    deleteBackgroundImage: jest.fn(),
    remoteBackgroundImageSources: [],
    remoteBackgroundImageSourceStatuses: [],
    addRemoteBackgroundImageSource: jest.fn(),
    deleteRemoteBackgroundImageSource: jest.fn(),
    refreshRemoteBackgroundImages: jest.fn(),
    onBack: jest.fn(),
    slideSets: [],
    activeSlideSetId: 'slide-set-1',
    createSlideSet: jest.fn(),
    deleteSlideSet: jest.fn(),
    renameSlideSet: jest.fn(),
    setSlideInterval: jest.fn(),
    setSlideTransition: jest.fn(),
    addImageToSet: jest.fn(),
    removeImageFromSet: jest.fn(),
    setActiveSlideSetId: jest.fn(),
    selectedVideoId: 'None',
    setSelectedVideoId: jest.fn(),
    getAllBackgroundVideos: jest.fn(() => []),
    getBackgroundVideoUrl: jest.fn(),
    uploadBackgroundVideo: jest.fn().mockResolvedValue({ id: 'video-1', name: 'Focus Video' }),
    deleteBackgroundVideo: jest.fn(),
    remoteBackgroundVideoSources: [],
    remoteBackgroundVideoSourceStatuses: [],
    addRemoteBackgroundVideoSource: jest.fn(),
    addLocalVideoSource: jest.fn(),
    deleteRemoteBackgroundVideoSource: jest.fn(),
    refreshRemoteBackgroundVideos: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploading a video clears image and slideshow selections before activating the video', async () => {
    const props = createProps();
    const { container } = render(<BackgroundImagesPanel {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /video/i }));

    fireEvent.click(screen.getByRole('button', { name: /open video uploads/i }));

    const fileInput = container.querySelector('input[accept="video/mp4,video/webm,video/ogg"]');
    expect(fileInput).not.toBeNull();

    const file = new File(['video-bytes'], 'focus.mp4', { type: 'video/mp4' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(props.uploadBackgroundVideo).toHaveBeenCalledWith(file);
    });

    expect(props.setSelectedBackgroundId).toHaveBeenCalledWith('None');
    expect(props.setActiveSlideSetId).toHaveBeenCalledWith(null);
    expect(props.setSelectedVideoId).toHaveBeenCalledWith('video-1');
  });

  test('shows a local video folder button when local folders are supported', () => {
    const props = createProps();
    render(<BackgroundImagesPanel {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /video/i }));

    expect(screen.getByRole('button', { name: /open local video folder/i })).toBeInTheDocument();
  });
});