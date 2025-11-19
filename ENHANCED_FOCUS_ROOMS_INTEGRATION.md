# Integration Guide: Enhanced Focus Rooms

## Quick Start

### 1. Import Components in App.js

```javascript
// Add lazy loading for new components
const RoomDiscoveryPanel = lazy(() => import('./components/panels/RoomDiscoveryPanel'));
const RoomTemplateSelector = lazy(() => import('./components/panels/RoomTemplateSelector'));

// Import template service
import { getTemplate, createRoomFromTemplate } from './services/roomTemplates';
```

### 2. Add State for Templates

```javascript
const [showTemplateSelector, setShowTemplateSelector] = useState(false);
const [selectedTemplate, setSelectedTemplate] = useState(null);
const [roomDiscoveryMode, setRoomDiscoveryMode] = useState(false); // Toggle between list and discovery
```

### 3. Add Tab for Discovery

Update the feature tabs to include:
- `'discovery'` - Room discovery with RoomDiscoveryPanel
- Keep existing `'rooms'` tab for current room view

### 4. Handle Template Selection

```javascript
const handleTemplateSelect = (template) => {
  setSelectedTemplate(template);
  // Show room creation form pre-filled with template data
};

const handleCreateRoomFromTemplate = (customName) => {
  const roomData = createRoomFromTemplate(
    selectedTemplate,
    customName,
    currentUserId,
    currentUsername
  );
  // Send to Firebase/create room
  createRoom(roomData);
  setShowTemplateSelector(false);
  setSelectedTemplate(null);
};
```

### 5. Add Tag Field to Rooms

When creating/updating rooms, include the `tag` field:

```javascript
const room = {
  // ... existing fields
  tag: 'work', // or 'study', 'creative', 'fitness', 'wellness', 'other'
  goal: template?.goal || '',
  template: template?.id || null
};
```

### 6. Add Buttons to UI

**In Room Tab Header**:
```javascript
<button onClick={() => setRoomDiscoveryMode(!roomDiscoveryMode)}>
  {roomDiscoveryMode ? 'My Rooms' : 'Discover'}
</button>
```

**In Create Room Modal**:
```javascript
<button onClick={() => setShowTemplateSelector(true)}>
  Choose Template
</button>
<button onClick={() => setShowTemplateSelector(false)}>
  Create Custom
</button>
```

### 7. Conditionally Render Components

```javascript
{activeFeatureTab === 'rooms' && (
  <Suspense fallback={<LazyLoadingFallback theme={theme} />}>
    {roomDiscoveryMode ? (
      <RoomDiscoveryPanel
        theme={theme}
        rooms={rooms}
        onJoinRoom={handleJoinRoom}
        onCreateRoom={() => setShowCreateRoomModal(true)}
        currentUserId={currentUserId}
        currentRoom={currentRoom}
      />
    ) : (
      <FocusRoomsPanel {...existingProps} />
    )}
  </Suspense>
)}

{showTemplateSelector && (
  <RoomTemplateSelector
    theme={theme}
    onSelectTemplate={handleTemplateSelect}
    onSkip={() => setShowTemplateSelector(false)}
  />
)}
```

## Component Props Reference

### RoomDiscoveryPanel

```typescript
interface RoomDiscoveryPanelProps {
  theme: Theme,
  rooms: Room[],
  onJoinRoom: (roomId: string) => void,
  onCreateRoom: () => void,
  currentUserId: string,
  currentRoom: Room | null
}
```

### RoomTemplateSelector

```typescript
interface RoomTemplateSelectorProps {
  theme: Theme,
  onSelectTemplate: (template: Template) => void,
  onSkip: () => void
}
```

## Room Data Structure

Add these fields to room objects:

```typescript
interface Room {
  // ... existing fields
  tag: 'work' | 'study' | 'creative' | 'fitness' | 'wellness' | 'other',
  template?: string, // Template ID if created from template
  goal?: string, // Session objective
  breakDuration?: number, // Break duration in seconds
  cycles?: number, // Number of cycles for template-based rooms
  description?: string // Room description for discovery
}
```

## Available Tags

| Tag | Emoji | Use Case |
|-----|-------|----------|
| `work` | 💼 | Professional work, coding, business tasks |
| `study` | 📚 | Learning, studying, education |
| `creative` | 🎨 | Art, design, writing, creative projects |
| `fitness` | 💪 | Exercise, workouts, physical activity |
| `wellness` | 🧘 | Meditation, mindfulness, relaxation |
| `other` | ⭐ | Anything else |

## Features to Add Later

### Phase 3b: Room Controls
- Owner moderation (mute, remove users)
- Room status badges (waiting, in-progress, completed)
- Participant list with role indicators

### Phase 3c: Social Features
- Member profiles with streaks
- Achievement display in rooms
- Leaderboards by category

### Phase 3d: Analytics
- Room completion rates
- Popular templates
- Usage patterns by category

## Testing Checklist

- [ ] RoomDiscoveryPanel filters by tag correctly
- [ ] Search works for room names and descriptions
- [ ] Sorting by participants, name, and date works
- [ ] Templates load and display correctly
- [ ] Join button disabled when room is full
- [ ] Current room shows correct badge
- [ ] Mobile responsive layout works
- [ ] All existing tests still pass

## Notes

- Lazy loading is recommended for both new components (already configured in example)
- Suspense boundaries wrap the new components
- All components use existing theme system
- No additional dependencies required
- Components are fully self-contained

---

**Status**: Ready for integration
**Estimated Dev Time**: 2-3 hours
**Risk Level**: Low (no changes to existing components)
