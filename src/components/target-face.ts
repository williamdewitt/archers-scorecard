import { ArrowScore, TargetFace, ScoringRing } from '@/types';

export class TargetFaceComponent {
  private targetFace: TargetFace;
  private container: HTMLElement;
  private onScoreCallback: (score: ArrowScore) => void;

  constructor(targetFace: TargetFace, container: HTMLElement, onScore: (score: ArrowScore) => void) {
    this.targetFace = targetFace;
    this.container = container;
    this.onScoreCallback = onScore;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = '';
    this.container.className = 'target-face-grid';

    // Create a grid of score buttons
    this.createScoreGrid();
  }

  private createScoreGrid(): void {
    // Create title
    const title = document.createElement('h3');
    title.textContent = 'Select Arrow Score';
    title.style.textAlign = 'center';
    title.style.marginBottom = '20px';
    title.style.color = '#2c3e50';
    this.container.appendChild(title);

    // Create grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'score-grid';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    gridContainer.style.gap = '12px';
    gridContainer.style.maxWidth = '400px';
    gridContainer.style.margin = '0 auto';
    gridContainer.style.padding = '20px';

    // Create score buttons for each possible score
    const scores = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 'M'];
    
    scores.forEach(score => {
      const button = this.createScoreButton(score);
      gridContainer.appendChild(button);
    });

    this.container.appendChild(gridContainer);
  }

  private createScoreButton(score: number | string): HTMLElement {
    const button = document.createElement('button');
    button.className = `score-button ${this.getScoreColorClass(score)}`;
    
    // Display X for 10, M for miss, otherwise the score
    const displayText = score === 10 ? 'X' : score.toString();
    button.textContent = displayText;
    
    // Styling
    button.style.width = '80px';
    button.style.height = '80px';
    button.style.border = '3px solid #2c3e50';
    button.style.borderRadius = '12px';
    button.style.fontSize = '24px';
    button.style.fontWeight = '900';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.2s ease';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';

    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const arrowScore: ArrowScore = score === 10 ? 'X' : score as ArrowScore;
      this.onScoreCallback(arrowScore);
    });

    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
      button.style.borderColor = '#3498db';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
      button.style.borderColor = '#2c3e50';
    });

    // Add active state
    button.addEventListener('mousedown', () => {
      button.style.transform = 'scale(0.95)';
    });

    button.addEventListener('mouseup', () => {
      button.style.transform = 'scale(1.1)';
    });

    return button;
  }

  private getScoreColorClass(score: number | string): string {
    if (score === 'M') return 'miss';
    if (score === 'X' || score === 10) return 'gold';
    if (score === 9) return 'gold';
    if (score === 8 || score === 7) return 'red';
    if (score === 6 || score === 5) return 'blue';
    if (score === 4 || score === 3) return 'black';
    if (score === 2 || score === 1) return 'white';
    return 'white';
  }

  private getFontSize(value: number): string {
    if (value >= 9) return '1.4rem';
    if (value >= 7) return '1.2rem';
    if (value >= 5) return '1.1rem';
    return '1rem';
  }

  private getRingColorClass(color: string): string {
    switch (color.toLowerCase()) {
      case '#ffd700':
      case '#ffa500':
        return 'gold';
      case '#ff0000':
      case '#dc143c':
        return 'red';
      case '#0000ff':
      case '#4169e1':
        return 'blue';
      case '#000000':
      case '#333333':
        return 'black';
      case '#ffffff':
      case '#f0f0f0':
        return 'white';
      default:
        return 'white';
    }
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}
