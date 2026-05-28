import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MusicLibraryModal from '../components/MusicLibraryModal';

jest.mock('../services/remoteMediaLibraryService', () => ({
  previewRemoteMediaSource: jest.fn(),
}));

const theme = {
  card: '#111827',
  text: '#f9fafb',
  accent: '#22c55e',
  borderRadius: 12,
};

test('embeds remote source configuration inside the music library modal', () => {
  render(
    <MusicLibraryModal
      theme={theme}
      getTextOpacity={(_theme, opacity = 1) => `rgba(255, 255, 255, ${opacity})`}
      onClose={jest.fn()}
      customMusicFiles={[]}
      sources={[]}
      sourceStatuses={[]}
      availableAssets={[]}
      selectedQueue={[]}
      onUploadCustomMusic={jest.fn()}
      onAddRemoteSource={jest.fn()}
      onAddLocalSource={jest.fn()}
      onRefreshSources={jest.fn()}
      onRemoveSource={jest.fn()}
      onAddSelection={jest.fn()}
      onRemoveSelection={jest.fn()}
      onMoveSelection={jest.fn()}
      getSelectionStatus={jest.fn(() => 'ready')}
      supportsLocalFolders
    />
  );

  fireEvent.click(screen.getByRole('button', { name: /connections/i }));
  fireEvent.click(screen.getByRole('button', { name: /add remote/i }));

  expect(screen.getByRole('combobox')).toBeInTheDocument();
  expect(screen.getByText('Remote Music Source')).toBeInTheDocument();
  expect(screen.getByText('Connect source')).toBeInTheDocument();
});