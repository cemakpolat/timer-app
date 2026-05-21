import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SlideSetPanel from '../components/panels/SlideSetPanel';

describe('SlideSetPanel', () => {
  const createProps = (overrides = {}) => ({
    theme: {
      accent: '#3b82f6',
      text: '#ffffff',
      borderRadius: 8,
    },
    getTextOpacity: (_theme, opacity) => `rgba(255,255,255,${opacity})`,
    slideSets: [
      {
        id: 'set-1',
        name: 'Mixed Set',
        mediaItems: [],
        intervalSec: 5,
        transition: 'fade',
      },
    ],
    activeSlideSetId: null,
    getAllBackgroundImages: jest.fn(() => []),
    getAllBackgroundVideos: jest.fn(() => [
      { id: 'video-1', name: 'Ocean Loop', size: 1024 },
    ]),
    getBackgroundImageUrl: jest.fn().mockResolvedValue(null),
    getBackgroundVideoUrl: jest.fn().mockResolvedValue(null),
    createSlideSet: jest.fn(),
    deleteSlideSet: jest.fn(),
    renameSlideSet: jest.fn(),
    setSlideInterval: jest.fn(),
    setSlideTransition: jest.fn(),
    addImageToSet: jest.fn(),
    addVideoToSet: jest.fn(),
    removeMediaItemFromSet: jest.fn(),
    setActiveSlideSetId: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('allows adding video items into a slide set', async () => {
    const props = createProps();
    render(<SlideSetPanel {...props} />);

    fireEvent.click(screen.getByTitle('Manage images'));

    await waitFor(() => {
      expect(screen.getByTitle('Add "Ocean Loop"')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle('Add "Ocean Loop"'));
    expect(props.addVideoToSet).toHaveBeenCalledWith('set-1', 'video-1');
  });
});