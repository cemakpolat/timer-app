import {
  SCENES,
  getScene,
  getAllScenes,
  hasScene
} from '../utils/scenes';

describe('scenes', () => {
  describe('SCENES constant', () => {
    test('contains none scene', () => {
      expect(SCENES.none).toBeDefined();
      expect(SCENES.none.name).toBe('None');
      expect(SCENES.none.emoji).toBe('🚫');
    });

    test('contains coffee scene', () => {
      expect(SCENES.coffee).toBeDefined();
      expect(SCENES.coffee.name).toBe('Coffee Break');
      expect(SCENES.coffee.emoji).toBe('☕');
      expect(SCENES.coffee.bg).toContain('linear-gradient');
    });

    test('contains deepWork scene', () => {
      expect(SCENES.deepWork).toBeDefined();
      expect(SCENES.deepWork.name).toBe('Deep Work');
      expect(SCENES.deepWork.emoji).toBe('🧠');
    });

    test('contains exercise scene', () => {
      expect(SCENES.exercise).toBeDefined();
      expect(SCENES.exercise.name).toBe('Exercise');
      expect(SCENES.exercise.emoji).toBe('💪');
    });

    test('all scenes have required properties', () => {
      Object.values(SCENES).forEach(scene => {
        expect(scene).toHaveProperty('name');
        expect(scene).toHaveProperty('emoji');
        expect(scene.name === 'None' || scene.bg !== undefined).toBe(true);
      });
    });

    test('all non-none scenes have description', () => {
      Object.values(SCENES)
        .filter(scene => scene.name !== 'None')
        .forEach(scene => {
          expect(scene.description).toBeDefined();
          expect(typeof scene.description).toBe('string');
          expect(scene.description.length).toBeGreaterThan(0);
        });
    });
  });

  describe('getScene', () => {
    test('retrieves existing scene by key', () => {
      const coffee = getScene('coffee');
      expect(coffee).toBeDefined();
      expect(coffee.name).toBe('Coffee Break');
    });

    test('returns null for non-existent scene', () => {
      const scene = getScene('nonExistentScene');
      expect(scene).toBeNull();
    });

    test('retrieves none scene', () => {
      const none = getScene('none');
      expect(none).toBeDefined();
      expect(none.name).toBe('None');
    });

    test('retrieves deepWork scene', () => {
      const deepWork = getScene('deepWork');
      expect(deepWork).toBeDefined();
      expect(deepWork.accent).toBeDefined();
    });

    test('retrieves meditation scene', () => {
      const meditation = getScene('meditation');
      expect(meditation).toBeDefined();
      expect(meditation.emoji).toBe('🧘');
    });
  });

  describe('getAllScenes', () => {
    test('returns array of all scenes', () => {
      const scenes = getAllScenes();
      expect(Array.isArray(scenes)).toBe(true);
      expect(scenes.length).toBeGreaterThan(0);
    });

    test('each scene has a key property', () => {
      const scenes = getAllScenes();
      scenes.forEach(scene => {
        expect(scene).toHaveProperty('key');
        expect(typeof scene.key).toBe('string');
      });
    });

    test('each scene has name and emoji', () => {
      const scenes = getAllScenes();
      scenes.forEach(scene => {
        expect(scene).toHaveProperty('name');
        expect(scene).toHaveProperty('emoji');
      });
    });

    test('includes all expected scenes', () => {
      const scenes = getAllScenes();
      const keys = scenes.map(s => s.key);
      
      expect(keys).toContain('none');
      expect(keys).toContain('coffee');
      expect(keys).toContain('deepWork');
      expect(keys).toContain('exercise');
      expect(keys).toContain('reading');
      expect(keys).toContain('meditation');
    });

    test('returns new array instance each time', () => {
      const scenes1 = getAllScenes();
      const scenes2 = getAllScenes();
      expect(scenes1).not.toBe(scenes2); // different references
      expect(scenes1).toEqual(scenes2); // same content
    });
  });

  describe('hasScene', () => {
    test('returns true for existing scenes', () => {
      expect(hasScene('coffee')).toBe(true);
      expect(hasScene('deepWork')).toBe(true);
      expect(hasScene('exercise')).toBe(true);
      expect(hasScene('none')).toBe(true);
    });

    test('returns false for non-existent scenes', () => {
      expect(hasScene('invalidScene')).toBe(false);
      expect(hasScene('notAScene')).toBe(false);
      expect(hasScene('')).toBe(false);
    });

    test('is case-sensitive', () => {
      expect(hasScene('coffee')).toBe(true);
      expect(hasScene('Coffee')).toBe(false);
      expect(hasScene('COFFEE')).toBe(false);
    });

    test('handles all valid scene keys', () => {
      const allScenes = getAllScenes();
      allScenes.forEach(scene => {
        expect(hasScene(scene.key)).toBe(true);
      });
    });
  });

  describe('Scene structure consistency', () => {
    test('all scenes except none have card property', () => {
      Object.entries(SCENES).forEach(([key, scene]) => {
        expect(key === 'none' || typeof scene.card === 'string').toBe(true);
      });
    });

    test('all scenes except none have accent property', () => {
      Object.entries(SCENES).forEach(([key, scene]) => {
        expect(key === 'none' || scene.accent !== undefined).toBe(true);
        expect(key === 'none' || /^#[0-9A-F]{6}$/i.test(scene.accent)).toBe(true);
      });
    });

    test('background gradients follow expected format', () => {
      Object.entries(SCENES).forEach(([key, scene]) => {
        expect(key === 'none' || !scene.bg || scene.bg.includes('linear-gradient')).toBe(true);
      });
    });
  });
});
