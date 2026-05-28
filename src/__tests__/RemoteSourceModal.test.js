import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import RemoteSourceModal from '../components/shared/RemoteSourceModal';

jest.mock('../services/remoteMediaLibraryService', () => ({
  previewRemoteMediaSource: jest.fn(),
}));

const theme = {
  card: '#111827',
  text: '#f9fafb',
  accent: '#22c55e',
  borderRadius: 12,
};

test('switches provider-specific fields via the dropdown', () => {
  render(
    <RemoteSourceModal
      theme={theme}
      getTextOpacity={(_theme, opacity = 1) => `rgba(255, 255, 255, ${opacity})`}
      assetType="audio"
      onClose={jest.fn()}
      onConnect={jest.fn()}
    />
  );

  const providerSelect = screen.getByRole('combobox');

  expect(providerSelect).toHaveValue('generic-manifest');
  expect(screen.getByPlaceholderText('https://cdn.example.com/catalog/manifest.json')).toBeInTheDocument();

  fireEvent.change(providerSelect, { target: { value: 'github' } });

  expect(screen.getByPlaceholderText('acme')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('media-library')).toBeInTheDocument();
  expect(screen.queryByPlaceholderText('https://cdn.example.com/catalog/manifest.json')).not.toBeInTheDocument();
});