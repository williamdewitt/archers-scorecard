import { AppState, Session, End, Arrow, ArrowScore, SessionConfiguration, RoundType } from '@/types';
import { EventBus } from '@/utils/event-bus';
import { StorageService } from '@/services/storage-service';
import { RoundTypes } from '@/utils/round-types';
import { TargetFaceComponent } from '@/components/target-face';

export class App {
  private state: AppState;
  private eventBus: EventBus;
  private storageService: StorageService;
  private targetFaceComponent: TargetFaceComponent | null = null;
  private currentEndArrows: Arrow[] = [];
  private currentConfiguration: SessionConfiguration | null = null;

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

    // Round and bow selection
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const bowSelect = document.getElementById('bow-type') as HTMLSelectElement;
    const startButton = document.getElementById('start-session') as HTMLButtonElement;
    
    console.log('Setting up event listeners:', { roundSelect, bowSelect, startButton });
    
    if (roundSelect) {
      roundSelect.addEventListener('change', (e) => {
        console.log('Round type change event fired:', (e.target as HTMLSelectElement).value);
        this.handleRoundTypeChange();
      });
    } else {
      console.error('Round select element not found');
    }

    if (bowSelect) {
      bowSelect.addEventListener('change', () => {
        console.log('Bow type change event fired');
        this.updateStartButtonState();
      });
    } else {
      console.error('Bow select element not found');
    }

    // Configuration options
    document.getElementById('arrows-per-end')?.addEventListener('change', () => {
      this.updateConfiguration();
    });

    document.getElementById('total-ends')?.addEventListener('change', () => {
      this.updateConfiguration();
    });

    startButton?.addEventListener('click', () => {
      this.startNewSession();
    });

    // Scoring interface
    document.getElementById('complete-end')?.addEventListener('click', () => {
      this.completeCurrentEnd();
    });

    document.getElementById('clear-end')?.addEventListener('click', () => {
      this.clearCurrentEnd();
    });

    document.getElementById('undo-arrow')?.addEventListener('click', () => {
      this.undoLastArrow();
    });

    // Settings
    document.getElementById('clear-data')?.addEventListener('click', () => {
      this.clearAllData();
    });
  }

  private initializeUI(): void {
    // Populate round type selector
    this.populateRoundTypes();
    
    // Populate bow type selector
    this.populateBowTypes();
    
    // Set initial view
    this.switchView('scoring');
    
    // Update UI with current state
    this.updateUI();
  }

  private populateRoundTypes(): void {
    const select = document.getElementById('round-type') as HTMLSelectElement;
    if (!select) {
      console.error('Round type select element not found');
      return;
    }

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild!);
    }

    // Add round type options
    const roundTypes = RoundTypes.getAll();
    console.log('Populating round types:', roundTypes);
    
    roundTypes.forEach(roundType => {
      const option = document.createElement('option');
      option.value = roundType.id;
      option.textContent = `${roundType.name} - ${roundType.distance}m`;
      select.appendChild(option);
      console.log('Added option:', option.value, option.textContent);
    });
  }

  private populateBowTypes(): void {
    const select = document.getElementById('bow-type') as HTMLSelectElement;
    if (!select) return;

    // Clear existing options except the first one
    while (select.children.length > 1) {
      select.removeChild(select.lastChild!);
    }

    // Add bow type options
    RoundTypes.getAllBowTypes().forEach(bowType => {
      const option = document.createElement('option');
      option.value = bowType.id;
      option.textContent = bowType.name;
      select.appendChild(option);
    });
  }

  private handleRoundTypeChange(): void {
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const configOptions = document.getElementById('config-options') as HTMLElement;
    
    console.log('Round type changed:', roundSelect.value);
    
    if (!roundSelect.value) {
      configOptions?.classList.add('d-none');
      this.updateStartButtonState();
      return;
    }

    const roundType = RoundTypes.getById(roundSelect.value);
    console.log('Found round type:', roundType);
    
    if (roundType?.isConfigurable) {
      console.log('Round type is configurable, showing options');
      configOptions?.classList.remove('d-none');
      this.populateConfigurationOptions(roundType);
    } else {
      console.log('Round type is not configurable, hiding options');
      configOptions?.classList.add('d-none');
    }

    this.updateStartButtonState();
  }

  private populateConfigurationOptions(roundType: RoundType): void {
    const arrowsSelect = document.getElementById('arrows-per-end') as HTMLSelectElement;
    const endsSelect = document.getElementById('total-ends') as HTMLSelectElement;

    if (arrowsSelect) {
      arrowsSelect.value = roundType.arrowsPerEnd.toString();
    }

    if (endsSelect) {
      endsSelect.value = roundType.totalEnds.toString();
    }
  }

  private updateConfiguration(): void {
    // Configuration is updated when starting a session
    this.updateStartButtonState();
  }

  private updateStartButtonState(): void {
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const bowSelect = document.getElementById('bow-type') as HTMLSelectElement;
    const startButton = document.getElementById('start-session') as HTMLButtonElement;

    if (startButton) {
      startButton.disabled = !roundSelect.value || !bowSelect.value;
    }
  }

  private startNewSession(): void {
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const bowSelect = document.getElementById('bow-type') as HTMLSelectElement;
    const arrowsSelect = document.getElementById('arrows-per-end') as HTMLSelectElement;
    const endsSelect = document.getElementById('total-ends') as HTMLSelectElement;

    const roundType = RoundTypes.getById(roundSelect.value);
    const bowType = RoundTypes.getBowTypeById(bowSelect.value);

    if (!roundType || !bowType) {
      this.handleError(new Error('Please select both round type and bow type'));
      return;
    }

    // Create configuration
    let arrowsPerEnd = roundType.arrowsPerEnd;
    let totalEnds = roundType.totalEnds;

    if (roundType.isConfigurable) {
      arrowsPerEnd = parseInt(arrowsSelect.value) || roundType.arrowsPerEnd;
      totalEnds = parseInt(endsSelect.value) || roundType.totalEnds;
    }

    this.currentConfiguration = {
      roundType,
      bowType,
      arrowsPerEnd,
      totalEnds,
      customSettings: {
        allowCustomArrows: roundType.isConfigurable || false,
        allowCustomEnds: roundType.isConfigurable || false
      }
    };

    // Create session with potentially modified round type
    const sessionRoundType: RoundType = {
      ...roundType,
      arrowsPerEnd,
      totalEnds,
      maxScore: RoundTypes.calculateMaxScore(arrowsPerEnd, totalEnds)
    };

    const session: Session = {
      id: this.generateSessionId(),
      roundType: sessionRoundType,
      startTime: new Date(),
      ends: [],
      metadata: {
        bowType
      },
      isComplete: false
    };

    this.state.currentSession = session;
    this.currentEndArrows = [];
    this.showScoringInterface();
    this.initializeTargetFace();
    this.updateUI();
    
    this.eventBus.emit('session-started', session);
  }

  private showScoringInterface(): void {
    const roundSelector = document.querySelector('.card') as HTMLElement;
    const scoringInterface = document.getElementById('scoring-interface') as HTMLElement;
    
    if (roundSelector) roundSelector.style.display = 'none';
    if (scoringInterface) {
      scoringInterface.classList.remove('d-none');
      scoringInterface.style.display = 'block';
    }

    // Update display elements
    this.updateScoringDisplay();
  }

  private initializeTargetFace(): void {
    if (!this.state.currentSession) return;

    const targetContainer = document.getElementById('target-face');
    if (!targetContainer) return;

    // Clean up existing target face
    if (this.targetFaceComponent) {
      this.targetFaceComponent.destroy();
    }

    // Create new target face component
    this.targetFaceComponent = new TargetFaceComponent(
      this.state.currentSession.roundType.targetFace,
      targetContainer,
      (score: ArrowScore) => this.scoreArrow(score)
    );
  }

  private scoreArrow(score: ArrowScore): void {
    if (!this.state.currentSession || !this.currentConfiguration) return;

    // Check if end is complete
    if (this.currentEndArrows.length >= this.currentConfiguration.arrowsPerEnd) {
      this.showError('End is complete. Please complete the end or clear it.');
      return;
    }

    const arrow: Arrow = {
      value: score,
      isInnerTen: score === 'X',
      timestamp: new Date()
    };

    this.currentEndArrows.push(arrow);
    this.updateArrowDisplay();
    this.updateEndTotal();
    this.updateUndoButton();

    // Auto-complete end if all arrows are scored
    if (this.currentEndArrows.length >= this.currentConfiguration.arrowsPerEnd) {
      const completeButton = document.getElementById('complete-end') as HTMLButtonElement;
      if (completeButton) {
        completeButton.disabled = false;
      }
    }
  }

  private undoLastArrow(): void {
    if (this.currentEndArrows.length === 0) return;

    this.currentEndArrows.pop();
    this.updateArrowDisplay();
    this.updateEndTotal();
    this.updateUndoButton();

    const completeButton = document.getElementById('complete-end') as HTMLButtonElement;
    if (completeButton) {
      completeButton.disabled = this.currentEndArrows.length === 0;
    }
  }

  private updateArrowDisplay(): void {
    const arrowsList = document.getElementById('arrows-list');
    const currentArrowNumber = document.getElementById('current-arrow-number');

    if (!arrowsList || !this.currentConfiguration) return;

    // Clear existing arrows
    arrowsList.innerHTML = '';

    // Add arrow displays
    this.currentEndArrows.forEach((arrow) => {
      const arrowElement = document.createElement('div');
      arrowElement.className = `arrow-score ${this.getArrowColorClass(arrow.value)}`;
      arrowElement.textContent = arrow.value.toString();
      arrowsList.appendChild(arrowElement);
    });

    // Add empty slots
    const remainingSlots = this.currentConfiguration.arrowsPerEnd - this.currentEndArrows.length;
    for (let i = 0; i < remainingSlots; i++) {
      const emptySlot = document.createElement('div');
      emptySlot.className = 'arrow-score empty';
      emptySlot.textContent = '-';
      arrowsList.appendChild(emptySlot);
    }

    // Update current arrow number
    if (currentArrowNumber) {
      const nextArrow = this.currentEndArrows.length + 1;
      currentArrowNumber.textContent = nextArrow <= this.currentConfiguration.arrowsPerEnd 
        ? nextArrow.toString() 
        : 'Complete';
    }
  }

  private getArrowColorClass(score: ArrowScore): string {
    if (score === 'M') return 'miss';
    if (score === 'X' || score === 10 || score === 9) return 'gold';
    if (score === 8 || score === 7) return 'red';
    if (score === 6 || score === 5) return 'blue';
    if (score === 4 || score === 3) return 'black';
    if (score === 2 || score === 1) return 'white';
    return 'white';
  }

  private updateEndTotal(): void {
    const endTotalElement = document.getElementById('end-total');
    if (!endTotalElement) return;

    const total = this.currentEndArrows.reduce((sum, arrow) => {
      if (arrow.value === 'X') return sum + 10;
      if (arrow.value === 'M') return sum + 0;
      const numValue = typeof arrow.value === 'string' ? parseInt(arrow.value) : arrow.value;
      return sum + (isNaN(numValue) ? 0 : numValue);
    }, 0);

    endTotalElement.textContent = total.toString();
  }

  private updateUndoButton(): void {
    const undoButton = document.getElementById('undo-arrow') as HTMLButtonElement;
    if (undoButton) {
      undoButton.disabled = this.currentEndArrows.length === 0;
    }
  }

  private updateScoringDisplay(): void {
    if (!this.state.currentSession) return;

    const currentEndNumber = document.getElementById('current-end-number');
    const totalEndsDisplay = document.getElementById('total-ends-display');

    if (currentEndNumber) {
      currentEndNumber.textContent = (this.state.currentSession.ends.length + 1).toString();
    }

    if (totalEndsDisplay) {
      totalEndsDisplay.textContent = this.state.currentSession.roundType.totalEnds.toString();
    }
  }

  private completeCurrentEnd(): void {
    if (!this.state.currentSession || this.currentEndArrows.length === 0) return;

    const endNumber = this.state.currentSession.ends.length + 1;
    const endTotal = this.currentEndArrows.reduce((sum, arrow) => {
      if (arrow.value === 'X') return sum + 10;
      if (arrow.value === 'M') return sum + 0;
      const numValue = typeof arrow.value === 'string' ? parseInt(arrow.value) : arrow.value;
      return sum + (isNaN(numValue) ? 0 : numValue);
    }, 0);

    const end: End = {
      number: endNumber,
      arrows: [...this.currentEndArrows],
      timestamp: new Date(),
      total: endTotal
    };

    this.state.currentSession.ends.push(end);
    
    // Clear current end
    this.currentEndArrows = [];
    this.updateArrowDisplay();
    this.updateEndTotal();
    this.updateUndoButton();
    
    // Update UI
    this.updateUI();
    this.updateScoringDisplay();
    
    // Save session
    this.saveCurrentSession();
    
    // Check if session is complete
    if (endNumber >= this.state.currentSession.roundType.totalEnds) {
      this.completeSession();
    } else {
      // Reset complete button
      const completeButton = document.getElementById('complete-end') as HTMLButtonElement;
      if (completeButton) {
        completeButton.disabled = true;
      }
    }

    this.eventBus.emit('end-completed', end);
  }

  private clearCurrentEnd(): void {
    this.currentEndArrows = [];
    this.updateArrowDisplay();
    this.updateEndTotal();
    this.updateUndoButton();
    
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
    
    // Clean up
    if (this.targetFaceComponent) {
      this.targetFaceComponent.destroy();
      this.targetFaceComponent = null;
    }
    
    // Reset current session
    const completedSession = this.state.currentSession;
    this.state.currentSession = null;
    this.currentConfiguration = null;
    
    // Show completion message and reset UI
    this.showSessionComplete();
    
    this.eventBus.emit('session-ended', completedSession);
  }

  private showSessionComplete(): void {
    const roundSelector = document.querySelector('.card') as HTMLElement;
    const scoringInterface = document.getElementById('scoring-interface') as HTMLElement;
    
    if (roundSelector) roundSelector.style.display = 'block';
    if (scoringInterface) {
      scoringInterface.classList.add('d-none');
      scoringInterface.style.display = 'none';
    }
    
    // Reset selectors
    const roundSelect = document.getElementById('round-type') as HTMLSelectElement;
    const bowSelect = document.getElementById('bow-type') as HTMLSelectElement;
    const startButton = document.getElementById('start-session') as HTMLButtonElement;
    const configOptions = document.getElementById('config-options') as HTMLElement;
    
    if (roundSelect) roundSelect.value = '';
    if (bowSelect) bowSelect.value = '';
    if (startButton) startButton.disabled = true;
    if (configOptions) configOptions.classList.add('d-none');
    
    // Show success message
    this.showSuccess('Session completed successfully!');
  }

  private switchView(view: 'scoring' | 'history'): void {
    const previousView = this.state.currentView;
    this.state.currentView = view;

    // Update navigation buttons
    const scoringBtn = document.getElementById('nav-scoring');
    const historyBtn = document.getElementById('nav-history');
    
    if (view === 'scoring') {
      scoringBtn?.classList.remove('btn-outline-primary');
      scoringBtn?.classList.add('btn-primary');
      historyBtn?.classList.remove('btn-primary');
      historyBtn?.classList.add('btn-outline-primary');
    } else {
      historyBtn?.classList.remove('btn-outline-primary');
      historyBtn?.classList.add('btn-primary');
      scoringBtn?.classList.remove('btn-primary');
      scoringBtn?.classList.add('btn-outline-primary');
    }

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
      sessionList.innerHTML = `
        <div class="text-center text-muted">
          <i class="bi bi-archive display-4 mb-3"></i>
          <p class="lead">No sessions recorded yet</p>
        </div>
      `;
      return;
    }

    const sessionsHtml = this.state.sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .map(session => {
        const total = session.ends.reduce((sum, end) => sum + end.total, 0);
        const date = new Date(session.startTime).toLocaleDateString();
        const bowType = session.metadata.bowType?.name || 'Unknown';
        const percentage = Math.round((total / session.roundType.maxScore) * 100);
        
        return `
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0">${session.roundType.name}</h5>
              <span class="badge bg-primary">${percentage}%</span>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <p class="card-text mb-1"><strong>Date:</strong> ${date}</p>
                  <p class="card-text mb-1"><strong>Bow:</strong> ${bowType}</p>
                </div>
                <div class="col-md-6">
                  <p class="card-text mb-1"><strong>Score:</strong> ${total}/${session.roundType.maxScore}</p>
                  <p class="card-text mb-1"><strong>Ends:</strong> ${session.ends.length}/${session.roundType.totalEnds}</p>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    sessionList.innerHTML = sessionsHtml;
  }

  private async clearAllData(): Promise<void> {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await this.storageService.clear();
        this.state.sessions = [];
        this.state.currentSession = null;
        this.showSuccess('All data cleared successfully!');
        this.updateHistoryView();
      } catch (error) {
        this.handleError(error as Error);
      }
    }
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
