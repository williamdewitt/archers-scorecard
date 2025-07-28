import { AppState, Session, End, Arrow, ArrowScore } from '@/types';
import { EventBus } from '@/utils/event-bus';
import { StorageService } from '@/services/storage-service';
import { RoundTypes } from '@/utils/round-types';

export class App {
  private state: AppState;
  private eventBus: EventBus;
  private storageService: StorageService;

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.storageService = StorageService.getInstance();
    
    this.state = {
      currentSession: null,
      sessions: [],
      currentView: 'scoring',
      isLoading: false,
      error: null,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.state.isLoading = true;
      
      // Load existing sessions from storage
      await this.loadSessions();
      
      // Initialize UI first
      this.initializeUI();
      
      // Set up event listeners after UI is initialized
      this.setupEventListeners();
      
      this.state.isLoading = false;
      console.log('Archers Scorecard initialized successfully');
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private async loadSessions(): Promise<void> {
    const result = await this.storageService.load<Session[]>('sessions');
    if (result.success && result.data) {
      this.state.sessions = result.data;
    }
  }

  private setupEventListeners(): void {
    // Navigation
    document.getElementById('nav-scoring')?.addEventListener('click', () => {
      this.switchView('scoring');
    });
    
    document.getElementById('nav-history')?.addEventListener('click', () => {
      this.switchView('history');
    });
    
    document.getElementById('nav-settings')?.addEventListener('click', () => {
      this.switchView('settings');
    });

    // Round selection
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const startButton = document.getElementById('start-session') as HTMLButtonElement;
    
    roundSelect?.addEventListener('change', () => {
      startButton.disabled = !roundSelect.value;
    });

    startButton?.addEventListener('click', () => {
      this.startNewSession(roundSelect.value);
    });

    // Score input handling
    document.querySelectorAll('.score-input').forEach(input => {
      input.addEventListener('input', this.handleScoreInput.bind(this));
      input.addEventListener('blur', this.validateScoreInput.bind(this));
    });

    // End completion
    document.getElementById('complete-end')?.addEventListener('click', () => {
      this.completeCurrentEnd();
    });

    document.getElementById('clear-end')?.addEventListener('click', () => {
      this.clearCurrentEnd();
    });
  }

  private initializeUI(): void {
    // Populate round type selector
    this.populateRoundTypes();
    
    // Set initial view
    this.switchView('scoring');
    
    // Update UI with current state
    this.updateUI();
  }

  private populateRoundTypes(): void {
    const select = document.getElementById('round-type') as HTMLSelectElement;
    if (!select) return;

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild!);
    }

    // Add round type options
    RoundTypes.getAll().forEach(roundType => {
      const option = document.createElement('option');
      option.value = roundType.id;
      option.textContent = `${roundType.name} - ${roundType.distance}m`;
      select.appendChild(option);
    });
  }

  private switchView(view: 'scoring' | 'history' | 'settings'): void {
    const previousView = this.state.currentView;
    this.state.currentView = view;

    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(button => {
      button.classList.remove('active');
    });
    document.getElementById(`nav-${view}`)?.classList.add('active');

    // Update view visibility
    document.querySelectorAll('.view').forEach(viewElement => {
      viewElement.classList.remove('active');
    });
    document.getElementById(`${view}-view`)?.classList.add('active');

    // Emit view change event
    this.eventBus.emit('view-changed', { from: previousView, to: view });

    // Update view-specific content
    if (view === 'history') {
      this.updateHistoryView();
    }
  }

  private startNewSession(roundTypeId: string): void {
    const roundType = RoundTypes.getById(roundTypeId);
    if (!roundType) {
      this.handleError(new Error('Invalid round type selected'));
      return;
    }

    const session: Session = {
      id: this.generateSessionId(),
      roundType,
      startTime: new Date(),
      ends: [],
      metadata: {},
      isComplete: false
    };

    this.state.currentSession = session;
    this.showScoringInterface();
    this.updateUI();
    
    this.eventBus.emit('session-started', session);
  }

  private showScoringInterface(): void {
    const roundSelector = document.querySelector('.round-selector') as HTMLElement;
    const scoringInterface = document.getElementById('scoring-interface') as HTMLElement;
    
    if (roundSelector) roundSelector.style.display = 'none';
    if (scoringInterface) {
      scoringInterface.classList.remove('hidden');
      scoringInterface.style.display = 'block';
    }
  }

  private handleScoreInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    
    // Validate input as user types
    if (this.isValidScoreInput(value) || value === '') {
      input.classList.remove('invalid');
      this.updateEndTotal();
    } else {
      input.classList.add('invalid');
    }
  }

  private validateScoreInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    
    if (value && !this.isValidScoreInput(value)) {
      input.value = '';
      input.classList.remove('invalid');
      this.showError('Invalid score. Use 1-10, X, or M');
    }
  }

  private isValidScoreInput(value: string): boolean {
    if (value === 'X' || value === 'M') return true;
    const num = parseInt(value);
    return !isNaN(num) && num >= 1 && num <= 10;
  }

  private updateEndTotal(): void {
    const inputs = document.querySelectorAll('.score-input') as NodeListOf<HTMLInputElement>;
    let total = 0;
    let validInputs = 0;

    inputs.forEach(input => {
      const value = input.value.toUpperCase();
      if (value) {
        if (value === 'X') {
          total += 10;
          validInputs++;
        } else if (value === 'M') {
          validInputs++;
        } else {
          const num = parseInt(value);
          if (!isNaN(num) && num >= 1 && num <= 10) {
            total += num;
            validInputs++;
          }
        }
      }
    });

    const endTotalElement = document.getElementById('end-total');
    if (endTotalElement) {
      endTotalElement.textContent = total.toString();
    }

    // Enable complete button if all arrows are scored
    const completeButton = document.getElementById('complete-end') as HTMLButtonElement;
    if (completeButton && this.state.currentSession) {
      completeButton.disabled = validInputs !== this.state.currentSession.roundType.arrowsPerEnd;
    }
  }

  private completeCurrentEnd(): void {
    if (!this.state.currentSession) return;

    const inputs = document.querySelectorAll('.score-input') as NodeListOf<HTMLInputElement>;
    const arrows: Arrow[] = [];

    inputs.forEach(input => {
      const value = input.value.toUpperCase() as ArrowScore;
      if (value) {
        arrows.push({
          value,
          isInnerTen: value === 'X',
          timestamp: new Date()
        });
      }
    });

    const endNumber = this.state.currentSession.ends.length + 1;
    const endTotal = arrows.reduce((sum, arrow) => {
      if (arrow.value === 'X') return sum + 10;
      if (arrow.value === 'M') return sum + 0;
      const numValue = typeof arrow.value === 'string' ? parseInt(arrow.value) : arrow.value;
      return sum + (isNaN(numValue) ? 0 : numValue);
    }, 0);

    const end: End = {
      number: endNumber,
      arrows,
      timestamp: new Date(),
      total: endTotal
    };

    this.state.currentSession.ends.push(end);
    
    // Clear inputs for next end
    this.clearCurrentEnd();
    
    // Update UI
    this.updateUI();
    
    // Save session
    this.saveCurrentSession();
    
    // Check if session is complete
    if (endNumber >= this.state.currentSession.roundType.totalEnds) {
      this.completeSession();
    } else {
      // Update end number display
      const endNumberElement = document.getElementById('current-end-number');
      if (endNumberElement) {
        endNumberElement.textContent = (endNumber + 1).toString();
      }
    }

    this.eventBus.emit('end-completed', end);
  }

  private clearCurrentEnd(): void {
    const inputs = document.querySelectorAll('.score-input') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('invalid');
    });
    
    const endTotalElement = document.getElementById('end-total');
    if (endTotalElement) {
      endTotalElement.textContent = '0';
    }
    
    const completeButton = document.getElementById('complete-end') as HTMLButtonElement;
    if (completeButton) {
      completeButton.disabled = true;
    }
  }

  private completeSession(): void {
    if (!this.state.currentSession) return;

    this.state.currentSession.endTime = new Date();
    this.state.currentSession.isComplete = true;
    
    // Add to sessions list
    this.state.sessions.push(this.state.currentSession);
    
    // Save to storage
    this.saveAllSessions();
    
    // Reset current session
    this.state.currentSession = null;
    
    // Show completion message and reset UI
    this.showSessionComplete();
    
    this.eventBus.emit('session-ended', this.state.currentSession);
  }

  private showSessionComplete(): void {
    const roundSelector = document.querySelector('.round-selector') as HTMLElement;
    const scoringInterface = document.getElementById('scoring-interface') as HTMLElement;
    
    if (roundSelector) roundSelector.style.display = 'block';
    if (scoringInterface) {
      scoringInterface.classList.add('hidden');
      scoringInterface.style.display = 'none';
    }
    
    // Reset round selector
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const startButton = document.getElementById('start-session') as HTMLButtonElement;
    
    if (roundSelect) roundSelect.value = '';
    if (startButton) startButton.disabled = true;
    
    // Show success message
    this.showSuccess('Session completed successfully!');
  }

  private updateUI(): void {
    this.updateRunningTotal();
  }

  private updateRunningTotal(): void {
    if (!this.state.currentSession) return;

    const total = this.state.currentSession.ends.reduce((sum, end) => sum + end.total, 0);
    const runningTotalElement = document.getElementById('running-total');
    
    if (runningTotalElement) {
      runningTotalElement.textContent = total.toString();
    }
  }

  private updateHistoryView(): void {
    const sessionList = document.getElementById('session-list');
    if (!sessionList) return;

    if (this.state.sessions.length === 0) {
      sessionList.innerHTML = '<p>No sessions recorded yet</p>';
      return;
    }

    const sessionsHtml = this.state.sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .map(session => {
        const total = session.ends.reduce((sum, end) => sum + end.total, 0);
        const date = new Date(session.startTime).toLocaleDateString();
        
        return `
          <div class="session-item">
            <h3>${session.roundType.name}</h3>
            <p>Date: ${date}</p>
            <p>Score: ${total}/${session.roundType.maxScore}</p>
            <p>Ends: ${session.ends.length}/${session.roundType.totalEnds}</p>
          </div>
        `;
      })
      .join('');

    sessionList.innerHTML = sessionsHtml;
  }

  private async saveCurrentSession(): Promise<void> {
    if (!this.state.currentSession) return;
    
    const result = await this.storageService.save('currentSession', this.state.currentSession);
    if (!result.success) {
      console.error('Failed to save current session:', result.error);
    }
  }

  private async saveAllSessions(): Promise<void> {
    const result = await this.storageService.save('sessions', this.state.sessions);
    if (!result.success) {
      console.error('Failed to save sessions:', result.error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleError(error: Error): void {
    console.error('Application error:', error);
    this.state.error = error.message;
    this.showError(error.message);
    this.eventBus.emit('error-occurred', error);
  }

  private showError(message: string): void {
    // Simple error display - could be enhanced with a proper notification system
    alert(`Error: ${message}`);
  }

  private showSuccess(message: string): void {
    // Simple success display - could be enhanced with a proper notification system
    alert(message);
  }
}
