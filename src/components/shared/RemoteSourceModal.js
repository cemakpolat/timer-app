import React from 'react';
import RemoteSourceConfigurator from './RemoteSourceConfigurator';

export default function RemoteSourceModal({
  theme,
  getTextOpacity,
  assetType,
  onClose,
  onConnect,
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100,
        padding: 12,
      }}
      onClick={onClose}
    >
      <div style={{ width: 'min(880px, 96vw)' }}>
        <RemoteSourceConfigurator
          theme={theme}
          getTextOpacity={getTextOpacity}
          assetType={assetType}
          onCancel={onClose}
          onConnect={onConnect}
        />
      </div>
    </div>
  );
}