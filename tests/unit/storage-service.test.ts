import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { StorageService } from '../../src/services/storage-service';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('StorageService', () => {
  let storageService: StorageService;

  beforeEach(() => {
    storageService = StorageService.getInstance();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton)', () => {
      const instance1 = StorageService.getInstance();
      const instance2 = StorageService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('save', () => {
    it('should save data successfully', async () => {
      const testData = { name: 'Test Session', score: 100 };
      
      const result = await storageService.save('test-key', testData);
      
      expect(result.success).toBe(true);
      expect(localStorage.getItem('archers-scorecard.test-key')).toBeTruthy();
    });

    it('should serialize complex objects', async () => {
      const complexData = {
        session: {
          id: 'session-1',
          rounds: [
            { arrows: [10, 9, 8], total: 27 },
            { arrows: ['X', 'M', 7], total: 17 }
          ],
          timestamp: new Date('2024-01-01')
        }
      };
      
      const result = await storageService.save('complex-data', complexData);
      
      expect(result.success).toBe(true);
      
      const stored = localStorage.getItem('archers-scorecard.complex-data');
      const parsed = JSON.parse(stored!);
      
      expect(parsed.session.id).toBe('session-1');
      expect(parsed.session.rounds).toHaveLength(2);
    });
  });

  describe('load', () => {
    it('should load saved data successfully', async () => {
      const testData = { name: 'Test Session', score: 100 };
      await storageService.save('test-key', testData);
      
      const result = await storageService.load<typeof testData>('test-key');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(testData);
      }
    });

    it('should return null for non-existent key', async () => {
      const result = await storageService.load('non-existent-key');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeNull();
      }
    });

    it('should handle corrupted data gracefully', async () => {
      // Manually set corrupted JSON
      localStorage.setItem('archers-scorecard.corrupted', 'invalid-json{');
      
      const result = await storageService.load('corrupted');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('delete', () => {
    it('should delete existing data', async () => {
      const testData = { name: 'Test Session' };
      await storageService.save('test-key', testData);
      
      const deleteResult = await storageService.delete('test-key');
      expect(deleteResult.success).toBe(true);
      
      const loadResult = await storageService.load('test-key');
      expect(loadResult.success).toBe(true);
      if (loadResult.success) {
        expect(loadResult.data).toBeNull();
      }
    });

    it('should not fail when deleting non-existent key', async () => {
      const result = await storageService.delete('non-existent-key');
      expect(result.success).toBe(true);
    });
  });

  describe('clear', () => {
    it('should clear all application data', async () => {
      await storageService.save('key1', { data: 'test1' });
      await storageService.save('key2', { data: 'test2' });
      
      // Add some non-application data
      localStorage.setItem('other-app.data', 'should-remain');
      
      const result = await storageService.clear();
      expect(result.success).toBe(true);
      
      // Application data should be gone
      const load1 = await storageService.load('key1');
      const load2 = await storageService.load('key2');
      
      expect(load1.success).toBe(true);
      expect(load2.success).toBe(true);
      
      if (load1.success && load2.success) {
        expect(load1.data).toBeNull();
        expect(load2.data).toBeNull();
      }
      
      // Other app data should remain
      expect(localStorage.getItem('other-app.data')).toBe('should-remain');
    });
  });

  describe('exists', () => {
    it('should return true for existing keys', async () => {
      await storageService.save('test-key', { data: 'test' });
      
      const exists = await storageService.exists('test-key');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent keys', async () => {
      const exists = await storageService.exists('non-existent-key');
      expect(exists).toBe(false);
    });
  });

  describe('getStorageInfo', () => {
    it('should return storage usage information', () => {
      const info = storageService.getStorageInfo();
      
      expect(info).toHaveProperty('used');
      expect(info).toHaveProperty('available');
      expect(info).toHaveProperty('percentage');
      expect(typeof info.used).toBe('number');
      expect(typeof info.available).toBe('number');
      expect(typeof info.percentage).toBe('number');
    });

    it('should calculate usage correctly', async () => {
      const initialInfo = storageService.getStorageInfo();
      const initialUsed = initialInfo.used;
      
      await storageService.save('large-data', { 
        data: 'x'.repeat(1000) // 1000 character string
      });
      
      const afterInfo = storageService.getStorageInfo();
      expect(afterInfo.used).toBeGreaterThan(initialUsed);
    });
  });

  // describe('error handling', () => {
  //   it('should handle localStorage unavailability', async () => {
  //     // Temporarily disable localStorage
  //     const originalLocalStorage = window.localStorage;
  //     Object.defineProperty(window, 'localStorage', {
  //       value: undefined,
  //       configurable: true
  //     });
      
  //     const result = await storageService.save('test', { data: 'test' });
      
  //     expect(result.success).toBe(false);
  //     if (!result.success) {
  //       expect(result.error.message).toContain('localStorage is not available');
  //     }
      
  //     // Restore localStorage
  //     Object.defineProperty(window, 'localStorage', {
  //       value: originalLocalStorage,
  //       configurable: true
  //     });
  //   });
  // });

  describe('data integrity', () => {
    it('should maintain data types after save/load cycle', async () => {
      const originalData = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'value' },
        null: null
      };
      
      await storageService.save('integrity-test', originalData);
      const result = await storageService.load<typeof originalData>('integrity-test');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(originalData);
        expect(typeof result.data?.string).toBe('string');
        expect(typeof result.data?.number).toBe('number');
        expect(typeof result.data?.boolean).toBe('boolean');
        expect(Array.isArray(result.data?.array)).toBe(true);
        expect(typeof result.data?.object).toBe('object');
        expect(result.data?.null).toBeNull();
      }
    });
  });
});
