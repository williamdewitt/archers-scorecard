# System Patterns: Archers Scorecard

## Architecture Overview

### Component-Based Architecture
```
Application Layer
├── App Controller (main.ts)
├── Router (page navigation)
└── Global State Manager

Component Layer
├── ScoreInput Component
├── SessionManager Component
├── HistoryViewer Component
└── SettingsPanel Component

Service Layer
├── StorageService (localStorage)
├── CalculationService (scoring logic)
├── ValidationService (input validation)
└── ExportService (data export)

Model Layer
├── Session Model
├── Round Model
├── Arrow Model
└── Statistics Model
```

### Key Design Patterns

#### Observer Pattern (State Management)
```typescript
class StateManager {
  private observers: Map<string, Function[]> = new Map();
  
  subscribe(event: string, callback: Function): void
  notify(event: string, data: any): void
  unsubscribe(event: string, callback: Function): void
}
```

**Usage**: Components subscribe to state changes for reactive UI updates

#### Strategy Pattern (Scoring Rules)
```typescript
interface ScoringStrategy {
  calculateScore(arrows: Arrow[]): ScoreResult;
  validateInput(value: string): boolean;
}

class StandardScoringStrategy implements ScoringStrategy
class CompoundScoringStrategy implements ScoringStrategy
```

**Usage**: Different scoring rules for different archery disciplines

#### Factory Pattern (Component Creation)
```typescript
class ComponentFactory {
  static create(type: ComponentType, config: ComponentConfig): Component
}
```

**Usage**: Dynamic component creation based on round type and user preferences

#### Command Pattern (User Actions)
```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class AddArrowCommand implements Command
class DeleteEndCommand implements Command
```

**Usage**: Undo/redo functionality for score corrections

## Data Models

### Core Entities
```typescript
interface Session {
  id: string;
  roundType: RoundType;
  startTime: Date;
  endTime?: Date;
  ends: End[];
  metadata: SessionMetadata;
}

interface End {
  number: number;
  arrows: Arrow[];
  timestamp: Date;
}

interface Arrow {
  value: number | 'X' | 'M';
  isInnerTen: boolean;
  timestamp: Date;
}

interface RoundType {
  name: string;
  distance: number;
  targetFace: TargetFace;
  arrowsPerEnd: number;
  totalEnds: number;
}
```

### Calculated Properties
```typescript
interface ScoreCalculation {
  totalScore: number;
  runningTotal: number[];
  averagePerArrow: number;
  averagePerEnd: number;
  innerTens: number;
  tens: number;
  misses: number;
}
```

## Component Patterns

### Base Component Pattern
```typescript
abstract class BaseComponent {
  protected element: HTMLElement;
  protected state: ComponentState;
  protected eventListeners: Map<string, Function> = new Map();

  abstract render(): void;
  abstract destroy(): void;
  
  protected bindEvents(): void;
  protected unbindEvents(): void;
}
```

### Component Lifecycle
1. **Initialize**: Constructor sets up initial state
2. **Mount**: Attach to DOM and bind events
3. **Update**: React to state changes
4. **Unmount**: Clean up events and references

### Event Handling Pattern
```typescript
class ScoreInputComponent extends BaseComponent {
  private handleScoreInput = (event: Event): void => {
    const value = (event.target as HTMLInputElement).value;
    this.validateAndEmit('score-entered', value);
  };

  private validateAndEmit(event: string, data: any): void {
    if (this.validate(data)) {
      this.emit(event, data);
    }
  }
}
```

## Service Patterns

### Storage Service Pattern
```typescript
class StorageService {
  private static instance: StorageService;
  private readonly storageKey = 'archers-scorecard';

  static getInstance(): StorageService;
  
  save<T>(key: string, data: T): Promise<void>;
  load<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
```

### Calculation Service Pattern
```typescript
class CalculationService {
  static calculateEndScore(arrows: Arrow[]): number;
  static calculateRunningTotal(ends: End[]): number[];
  static calculateStatistics(session: Session): Statistics;
  static validateScore(value: string, rules: ScoringRules): boolean;
}
```

## Error Handling Patterns

### Result Pattern
```typescript
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

class ValidationService {
  static validateArrowScore(value: string): Result<number | 'X' | 'M', ValidationError>;
}
```

### Error Boundary Pattern
```typescript
class ErrorHandler {
  static handleError(error: Error, context: string): void;
  static showUserError(message: string): void;
  static logError(error: Error, context: string): void;
}
```

## Performance Patterns

### Debounced Auto-Save
```typescript
class AutoSaveManager {
  private saveTimeout: number | null = null;
  private readonly SAVE_DELAY = 1000;

  scheduleSave(data: any): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => this.save(data), this.SAVE_DELAY);
  }
}
```

### Virtual Scrolling (for History)
```typescript
class VirtualScrollList {
  private visibleItems: number = 10;
  private itemHeight: number = 60;
  
  renderVisibleItems(scrollTop: number, items: any[]): void;
  calculateVisibleRange(scrollTop: number): [number, number];
}
```

## Testing Patterns

### Test Data Builders
```typescript
class SessionBuilder {
  private session: Partial<Session> = {};
  
  withRoundType(roundType: RoundType): SessionBuilder;
  withEnds(ends: End[]): SessionBuilder;
  build(): Session;
}
```

### Mock Service Pattern
```typescript
class MockStorageService implements StorageService {
  private data: Map<string, any> = new Map();
  
  async save<T>(key: string, data: T): Promise<void>;
  async load<T>(key: string): Promise<T | null>;
}
```

## Security Patterns

### Input Sanitization
```typescript
class InputSanitizer {
  static sanitizeScoreInput(input: string): string;
  static validateNumericInput(input: string): boolean;
  static escapeHtml(input: string): string;
}
```

### Safe Storage Access
```typescript
class SafeStorage {
  static isStorageAvailable(): boolean;
  static safeGetItem(key: string): string | null;
  static safeSetItem(key: string, value: string): boolean;
}
```

## Integration Patterns

### Event Bus for Component Communication
```typescript
class EventBus {
  private static instance: EventBus;
  private events: Map<string, Function[]> = new Map();
  
  emit(event: string, data?: any): void;
  on(event: string, callback: Function): void;
  off(event: string, callback: Function): void;
}
```

### Plugin Architecture (Future)
```typescript
interface Plugin {
  name: string;
  version: string;
  initialize(app: Application): void;
  destroy(): void;
}

class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  
  register(plugin: Plugin): void;
  unregister(name: string): void;
  getPlugin(name: string): Plugin | undefined;
}
