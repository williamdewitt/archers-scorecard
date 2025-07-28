import { Result } from '@/types';

export class StorageService {
  private static instance: StorageService;
  private readonly storageKey = 'archers-scorecard';

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async save<T>(key: string, data: T): Promise<Result<void>> {
    try {
      if (!this.isStorageAvailable()) {
        return {
          success: false,
          error: new Error('localStorage is not available')
        };
      }

      const fullKey = `${this.storageKey}.${key}`;
      const serializedData = JSON.stringify(data);
      localStorage.setItem(fullKey, serializedData);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  async load<T>(key: string): Promise<Result<T | null>> {
    try {
      if (!this.isStorageAvailable()) {
        return {
          success: false,
          error: new Error('localStorage is not available')
        };
      }

      const fullKey = `${this.storageKey}.${key}`;
      const serializedData = localStorage.getItem(fullKey);

      if (serializedData === null) {
        return { success: true, data: null };
      }

      const data = JSON.parse(serializedData) as T;
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  async delete(key: string): Promise<Result<void>> {
    try {
      if (!this.isStorageAvailable()) {
        return {
          success: false,
          error: new Error('localStorage is not available')
        };
      }

      const fullKey = `${this.storageKey}.${key}`;
      localStorage.removeItem(fullKey);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      if (!this.isStorageAvailable()) {
        return {
          success: false,
          error: new Error('localStorage is not available')
        };
      }

      // Remove all keys that start with our storage prefix
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storageKey)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error as Error
      };
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isStorageAvailable()) {
        return false;
      }

      const fullKey = `${this.storageKey}.${key}`;
      return localStorage.getItem(fullKey) !== null;
    } catch (error) {
      return false;
    }
  }

  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get storage usage information
  getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.storageKey)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Estimate available storage (typical limit is 5-10MB)
    const estimated = 5 * 1024 * 1024; // 5MB estimate
    const percentage = (used / estimated) * 100;

    return {
      used,
      available: estimated - used,
      percentage: Math.min(percentage, 100)
    };
  }
}
