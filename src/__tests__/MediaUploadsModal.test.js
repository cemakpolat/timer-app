import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import MediaUploadsModal from '../components/shared/MediaUploadsModal';

jest.mock('../services/remoteMediaLibraryService', () => ({
  previewRemoteMediaSource: jest.fn(),
}));

const theme = {
  card: '#111827',
  text: '#f9fafb',
  accent: '#22c55e',
  borderRadius: 12,
};

test('embeds remote source configuration inside the media uploads modal', () => {
  render(
    <MediaUploadsModal
      theme={theme}
      getTextOpacity={(_theme, opacity = 1) => `rgba(255, 255, 255, ${opacity})`}
      assetType="image"
      onClose={jest.fn()}
      uploadedItems={[]}
      onUploadFile={jest.fn()}
      sources={[]}
      sourceStatuses={[]}
      onAddRemoteSource={jest.fn()}
      onAddLocalSource={jest.fn()}
      onRefreshSources={jest.fn()}
      onRemoveSource={jest.fn()}
      supportsLocalFolders
    />
  );

  fireEvent.click(screen.getByRole('button', { name: /connections/i }));
  fireEvent.click(screen.getByRole('button', { name: /add remote/i }));

  expect(screen.getByRole('combobox')).toBeInTheDocument();
  expect(screen.getByText('Remote Image Source')).toBeInTheDocument();
  expect(screen.getByText('Connect source')).toBeInTheDocument();
});