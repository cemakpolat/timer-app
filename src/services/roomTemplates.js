/**
 * Room Templates
 * 
 * Pre-configured room templates for common focus session types.
 * Users can create rooms using these templates as a starting point.
 */

export const ROOM_TEMPLATES = [
  {
    id: 'pomodoro',
    name: 'Pomodoro Sprint',
    description: 'Classic 25-minute focused work sessions with 5-minute breaks',
    tag: 'work',
    duration: 1500, // 25 minutes
    maxParticipants: 10,
    goal: 'Complete focused work cycles',
    breakDuration: 300, // 5 minutes
    cycles: 4,
    emoji: '🍅'
  },
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    description: 'Extended 90-minute uninterrupted focus block for complex tasks',
    tag: 'work',
    duration: 5400, // 90 minutes
    maxParticipants: 8,
    goal: 'Achieve deep flow state',
    breakDuration: 600, // 10 minutes
    cycles: 2,
    emoji: '🧠'
  },
  {
    id: 'study-group',
    name: 'Study Group',
    description: 'Collaborative learning environment with shared focus sessions',
    tag: 'study',
    duration: 3600, // 60 minutes
    maxParticipants: 20,
    goal: 'Learn together with accountability',
    breakDuration: 300,
    cycles: 3,
    emoji: '📚'
  },
  {
    id: 'creative-sprint',
    name: 'Creative Sprint',
    description: 'Dedicated time for creative projects with periodic check-ins',
    tag: 'creative',
    duration: 2700, // 45 minutes
    maxParticipants: 6,
    goal: 'Boost creative output',
    breakDuration: 300,
    cycles: 3,
    emoji: '🎨'
  },
  {
    id: 'fitness-class',
    name: 'Fitness Class',
    description: 'Group workout session with shared motivation and accountability',
    tag: 'fitness',
    duration: 3600, // 60 minutes
    maxParticipants: 15,
    goal: 'Stay active and motivated',
    breakDuration: 120, // 2 minutes
    cycles: 2,
    emoji: '💪'
  },
  {
    id: 'meditation',
    name: 'Meditation Circle',
    description: 'Quiet, shared meditation and mindfulness practice space',
    tag: 'wellness',
    duration: 1800, // 30 minutes
    maxParticipants: 30,
    goal: 'Find peace and mindfulness',
    breakDuration: 0,
    cycles: 1,
    emoji: '🧘'
  },
  {
    id: 'code-jam',
    name: 'Code Jam',
    description: 'Programming-focused session for debugging, refactoring, or learning',
    tag: 'work',
    duration: 3600, // 60 minutes
    maxParticipants: 12,
    goal: 'Ship quality code',
    breakDuration: 300,
    cycles: 2,
    emoji: '💻'
  },
  {
    id: 'writing-sprint',
    name: 'Writing Sprint',
    description: 'Dedicated writing time for authors, bloggers, and content creators',
    tag: 'creative',
    duration: 2700, // 45 minutes
    maxParticipants: 10,
    goal: 'Write freely and consistently',
    breakDuration: 300,
    cycles: 3,
    emoji: '✍️'
  }
];

/**
 * Get room template by ID
 */
export const getTemplate = (templateId) => {
  return ROOM_TEMPLATES.find(t => t.id === templateId);
};

/**
 * Get templates grouped by category
 */
export const getTemplatesByCategory = () => {
  const grouped = {};
  ROOM_TEMPLATES.forEach(template => {
    if (!grouped[template.tag]) {
      grouped[template.tag] = [];
    }
    grouped[template.tag].push(template);
  });
  return grouped;
};

/**
 * Create room from template
 * Returns a new room object with template settings
 */
export const createRoomFromTemplate = (template, roomName, creatorId, creatorName) => {
  return {
    id: `room-${Date.now()}`,
    name: roomName || template.name,
    description: template.description,
    tag: template.tag,
    createdBy: creatorId,
    creatorName: creatorName,
    maxParticipants: template.maxParticipants,
    duration: template.duration,
    goal: template.goal,
    breakDuration: template.breakDuration,
    cycles: template.cycles,
    template: template.id,
    createdAt: Date.now(), // Store as timestamp (number) for consistency
    participants: [creatorId],
    messages: [],
    status: 'waiting', // waiting, in-progress, completed
    completedCycles: 0
  };
};
