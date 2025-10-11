import { IRealtimeService } from '../interfaces/IRealtimeService';

/**
 * Mock implementation for testing without Firebase
 * Uses localStorage and simulates real-time with intervals
 */
class MockRealtimeService extends IRealtimeService {
  constructor() {
    super();
    this.currentUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    this.listeners = new Map();

    // Initialize with mock data
    this.initMockData();
  }

  initMockData() {
    // Mock rooms
    const mockRooms = [
      {
        id: 'room1',
        name: '📚 Deep Work Session',
        createdBy: 'user_alice',
        createdAt: Date.now() - 300000,
        maxParticipants: 10,
        duration: 1500,
        participants: {
          user_alice: { displayName: 'Alice', joinedAt: Date.now() - 300000 },
          user_bob: { displayName: 'Bob', joinedAt: Date.now() - 200000 },
          user_charlie: { displayName: 'Charlie', joinedAt: Date.now() - 100000 }
        },
        timer: {
          startedAt: Date.now() - 180000,
          endsAt: Date.now() + 1320000,
          duration: 1500
        },
        messages: [
          { id: 'msg1', userId: 'user_alice', text: 'Let\'s stay focused everyone!', timestamp: Date.now() - 180000 },
          { id: 'msg2', userId: 'user_bob', text: '👍 Ready to work', timestamp: Date.now() - 170000 },
          { id: 'msg3', userId: 'user_charlie', text: 'Same here! 💪', timestamp: Date.now() - 160000 }
        ],
        completed: false,
        isPublic: true
      },
      {
        id: 'room2',
        name: '☕ Coffee Break',
        createdBy: 'user_david',
        createdAt: Date.now() - 600000,
        maxParticipants: 5,
        duration: 300,
        participants: {
          user_david: { displayName: 'David', joinedAt: Date.now() - 600000 },
          user_eve: { displayName: 'Eve', joinedAt: Date.now() - 500000 }
        },
        timer: {
          startedAt: Date.now() - 30000,
          endsAt: Date.now() + 270000,
          duration: 300
        },
        messages: [
          { id: 'msg4', userId: 'user_david', text: 'Quick break before the next session', timestamp: Date.now() - 30000 },
          { id: 'msg5', userId: 'user_eve', text: 'Perfect timing!', timestamp: Date.now() - 25000 }
        ],
        completed: false,
        isPublic: true
      },
      {
        id: 'room3',
        name: '💪 Evening Workout',
        createdBy: 'user_frank',
        createdAt: Date.now() - 120000,
        maxParticipants: 10,
        duration: 1800,
        participants: {
          user_frank: { displayName: 'Frank', joinedAt: Date.now() - 120000 }
        },
        timer: null,
        messages: [],
        completed: false,
        isPublic: true
      }
    ];

    localStorage.setItem('mockRooms', JSON.stringify(mockRooms));
    localStorage.setItem('mockPresence', JSON.stringify({
      [this.currentUserId]: { lastSeen: Date.now() }
    }));
  }

  async initialize(config) {
    console.log('Mock service initialized (no Firebase needed)');
    return true;
  }

  async getActiveUsersCount() {
    const presence = JSON.parse(localStorage.getItem('mockPresence') || '{}');
    const now = Date.now();
    const THRESHOLD = 2 * 60 * 1000;

    let count = 0;
    Object.values(presence).forEach(p => {
      if (p.lastSeen && (now - p.lastSeen) < THRESHOLD) {
        count++;
      }
    });

    // Add some random users to simulate activity
    return count + Math.floor(Math.random() * 50) + 10;
  }

  async updatePresence(userId = this.currentUserId, metadata = {}) {
    const presence = JSON.parse(localStorage.getItem('mockPresence') || '{}');
    presence[userId] = { lastSeen: Date.now(), ...metadata };
    localStorage.setItem('mockPresence', JSON.stringify(presence));
  }

  async removePresence(userId = this.currentUserId) {
    const presence = JSON.parse(localStorage.getItem('mockPresence') || '{}');
    delete presence[userId];
    localStorage.setItem('mockPresence', JSON.stringify(presence));
  }

  subscribeToActiveUsers(callback) {
    const interval = setInterval(async () => {
      const count = await this.getActiveUsersCount();
      callback(count);
    }, 5000);

    return () => clearInterval(interval);
  }

  startPresenceHeartbeat(intervalMs = 60000) {
    this.updatePresence();
    this.heartbeatInterval = setInterval(() => {
      this.updatePresence();
    }, intervalMs);
  }

  stopPresenceHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  // === FOCUS ROOMS ===

  async getFocusRooms() {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    return rooms.filter(r => !r.completed);
  }

  async createFocusRoom(roomData) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');

    const room = {
      id: `room_${Date.now()}`,
      name: roomData.name || 'Focus Room',
      createdBy: this.currentUserId,
      createdAt: Date.now(),
      maxParticipants: roomData.maxParticipants || 10,
      duration: roomData.duration || 1500,
      participants: {},
      timer: null,
      messages: [],
      completed: false,
      isPublic: roomData.isPublic !== false,
      timerType: roomData.timerType || 'single',
      compositeTimer: roomData.compositeTimer || null,
      currentStep: 0
    };

    rooms.push(room);
    localStorage.setItem('mockRooms', JSON.stringify(rooms));

    this.notifyListeners('rooms', rooms);
    return room;
  }

  async joinFocusRoom(roomId, userId = this.currentUserId, userInfo = {}) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);

    if (!room) throw new Error('Room not found');

    const participantCount = Object.keys(room.participants).length;
    if (participantCount >= room.maxParticipants) {
      throw new Error('Room is full');
    }

    room.participants[userId] = {
      joinedAt: Date.now(),
      displayName: userInfo.displayName || `User ${userId.substr(0, 6)}`,
      ...userInfo
    };

    localStorage.setItem('mockRooms', JSON.stringify(rooms));
    this.notifyListeners(`room_${roomId}`, room);

    return room;
  }

  async leaveFocusRoom(roomId, userId = this.currentUserId) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);

    if (room && room.participants[userId]) {
      delete room.participants[userId];
      localStorage.setItem('mockRooms', JSON.stringify(rooms));
      this.notifyListeners(`room_${roomId}`, room);
    }
  }

  subscribeToFocusRoom(roomId, callback) {
    const key = `room_${roomId}`;

    // Initial callback
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);
    if (room) callback(room);

    // Store listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    // Return unsubscribe
    return () => {
      const listeners = this.listeners.get(key) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  async sendMessage(roomId, userId = this.currentUserId, text) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);

    if (!room) return;

    const message = {
      id: `msg_${Date.now()}`,
      userId,
      text,
      timestamp: Date.now()
    };

    room.messages.push(message);
    localStorage.setItem('mockRooms', JSON.stringify(rooms));

    this.notifyListeners(`messages_${roomId}`, room.messages);
  }

  subscribeToMessages(roomId, callback) {
    const key = `messages_${roomId}`;

    // Initial callback
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);
    if (room) callback(room.messages);

    // Store listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    return () => {
      const listeners = this.listeners.get(key) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  async startRoomTimer(roomId, duration) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);

    if (!room) {
      console.error('Room not found:', roomId);
      return;
    }

    const now = Date.now();

    // For composite timers, use the duration of the current step
    let stepDuration = duration;
    if (room.timerType === 'composite' && room.compositeTimer?.steps) {
      const currentStepData = room.compositeTimer.steps[room.currentStep || 0];
      if (currentStepData) {
        stepDuration = currentStepData.unit === 'sec' ? currentStepData.duration : currentStepData.duration * 60;
      }
    }

    room.timer = {
      startedAt: now,
      endsAt: now + (stepDuration * 1000),
      duration: stepDuration
    };

    localStorage.setItem('mockRooms', JSON.stringify(rooms));

    // Notify both timer and room listeners
    this.notifyListeners(`timer_${roomId}`, room.timer);
    this.notifyListeners(`room_${roomId}`, room);

    // Auto-advance composite timer steps
    if (room.timerType === 'composite' && room.compositeTimer?.steps) {
      setTimeout(() => {
        this.advanceCompositeStep(roomId);
      }, stepDuration * 1000);
    }
  }

  advanceCompositeStep(roomId) {
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);

    if (!room || room.timerType !== 'composite' || !room.compositeTimer?.steps) return;

    const nextStep = (room.currentStep || 0) + 1;

    if (nextStep < room.compositeTimer.steps.length) {
      room.currentStep = nextStep;
      const nextStepData = room.compositeTimer.steps[nextStep];
      const stepDuration = nextStepData.unit === 'sec' ? nextStepData.duration : nextStepData.duration * 60;

      const now = Date.now();
      room.timer = {
        startedAt: now,
        endsAt: now + (stepDuration * 1000),
        duration: stepDuration
      };

      localStorage.setItem('mockRooms', JSON.stringify(rooms));
      this.notifyListeners(`room_${roomId}`, room);
      this.notifyListeners(`timer_${roomId}`, room.timer);

      // Schedule next step
      setTimeout(() => {
        this.advanceCompositeStep(roomId);
      }, stepDuration * 1000);
    } else {
      // Composite timer completed
      room.timer = null;
      room.currentStep = 0;
      localStorage.setItem('mockRooms', JSON.stringify(rooms));
      this.notifyListeners(`room_${roomId}`, room);
    }
  }

  subscribeToRoomTimer(roomId, callback) {
    const key = `timer_${roomId}`;

    // Initial callback
    const rooms = JSON.parse(localStorage.getItem('mockRooms') || '[]');
    const room = rooms.find(r => r.id === roomId);
    if (room) callback(room.timer);

    // Store listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    return () => {
      const listeners = this.listeners.get(key) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  }

  notifyListeners(key, data) {
    const listeners = this.listeners.get(key) || [];
    listeners.forEach(callback => callback(data));
  }

  async disconnect() {
    await this.removePresence();
    this.stopPresenceHeartbeat();
    this.listeners.clear();
    console.log('Mock service disconnected');
  }
}

export default MockRealtimeService;
