import React from 'react';

/**
 * Avatar component
 * Props:
 * - user: { avatarUrl, displayName, uid }
 * - size: number (px)
 */
const Avatar = ({ user = {}, size = 32, className = '' }) => {
  const seed = user.uid || user.displayName || 'anon';
  const avatarUrl = user.avatarUrl || `https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(seed)}`;

  return (
    <img
      src={avatarUrl}
      alt={user.displayName || 'User avatar'}
      title={user.displayName || ''}
      className={className}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
    />
  );
};

export default Avatar;
