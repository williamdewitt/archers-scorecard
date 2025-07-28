// Core archery scoring types following World Archery rules

export type ArrowScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 'X' | 'M';

export interface Arrow {
  value: ArrowScore;
  isInnerTen: boolean; // true for 'X', used for tie-breaking
  timestamp: Date;
}

export interface End {
  number: number;
  arrows: Arrow[];
  timestamp: Date;
  total: number;
}

export interface RoundType {
  id: string;
  name: string;
  distance: number; // in meters
  targetFace: TargetFace;
  arrowsPerEnd: number;
  totalEnds: number;
  maxScore: number;
}

export interface TargetFace {
  size: number; // diameter in cm
  rings: ScoringRing[];
}

export interface ScoringRing {
  value: number;
  innerRadius: number; // as percentage of target face
  outerRadius: number; // as percentage of target face
  color: string;
}

export interface Session {
  id: string;
  roundType: RoundType;
  startTime: Date;
  endTime?: Date;
  ends: End[];
  metadata: SessionMetadata;
  isComplete: boolean;
}

export interface SessionMetadata {
  location?: string;
  weather?: string;
  equipment?: string;
  notes?: string;
}

export interface ScoreCalculation {
  totalScore: number;
  runningTotal: number[];
  averagePerArrow: number;
  averagePerEnd: number;
  innerTens: number; // X count
  tens: number; // 10 + X count
  nines: number;
  misses: number;
  endScores: number[];
}

export interface Statistics {
  totalSessions: number;
  totalArrows: number;
  averageScore: number;
  bestScore: number;
  bestAverage: number;
  consistency: number; // standard deviation
  improvement: number; // trend over time
}

// Error handling types
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Component and service interfaces
export interface Component {
  element: HTMLElement;
  render(): void;
  destroy(): void;
}

export interface EventEmitter {
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
  emit(event: string, data?: any): void;
}

// Storage interfaces
export interface StorageService {
  save<T>(key: string, data: T): Promise<Result<void>>;
  load<T>(key: string): Promise<Result<T | null>>;
  delete(key: string): Promise<Result<void>>;
  clear(): Promise<Result<void>>;
  exists(key: string): Promise<boolean>;
}

// Application state
export interface AppState {
  currentSession: Session | null;
  sessions: Session[];
  currentView: 'scoring' | 'history' | 'settings';
  isLoading: boolean;
  error: string | null;
}

// Events
export type AppEvent = 
  | 'session-started'
  | 'session-ended'
  | 'session-saved'
  | 'arrow-scored'
  | 'end-completed'
  | 'view-changed'
  | 'error-occurred';

export interface AppEventData {
  'session-started': Session;
  'session-ended': Session;
  'session-saved': Session;
  'arrow-scored': { arrow: Arrow; endNumber: number };
  'end-completed': End;
  'view-changed': { from: string; to: string };
  'error-occurred': Error;
}
