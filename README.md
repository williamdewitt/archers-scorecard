# Archers Scorecard

A digital archery score keeping application built with TypeScript that follows World Archery rules. The application can be hosted on GitHub Pages and maintains session state and history using browser local storage.

## Features

- **World Archery Compliant**: Supports standard World Archery round types (70m, 60m, 50m, 30m, 18m)
- **Practice Rounds**: Includes practice rounds for training sessions
- **Real-time Scoring**: Live score calculation and validation
- **Session Management**: Start, pause, and complete scoring sessions
- **Local Storage**: Persistent storage of session data and history
- **Responsive Design**: Works on desktop and mobile devices
- **Score Validation**: Automatic validation of arrow scores (1-10, X, M)
- **Session History**: View and track previous practice sessions

## Round Types Supported

### Standard World Archery Rounds
- **70m Round**: 72 arrows, 122cm target face, 12 ends of 6 arrows
- **60m Round**: 72 arrows, 122cm target face, 12 ends of 6 arrows  
- **50m Round**: 72 arrows, 122cm target face, 12 ends of 6 arrows
- **30m Round**: 72 arrows, 80cm target face, 12 ends of 6 arrows
- **18m Round**: 60 arrows, 40cm target face, 10 ends of 6 arrows

### Practice Rounds
- **Practice 30m**: 18 arrows, 80cm target face, 6 ends of 3 arrows
- **Practice 18m**: 18 arrows, 40cm target face, 6 ends of 3 arrows

## Technology Stack

- **TypeScript**: Type-safe JavaScript development
- **Vite**: Fast build tool and development server
- **HTML5/CSS3**: Modern web standards
- **Local Storage API**: Client-side data persistence
- **Jest**: Unit testing framework
- **Playwright**: End-to-end testing
- **ESLint**: Code linting and quality
- **Prettier**: Code formatting

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/williamdewitt/archers-scorecard.git
cd archers-scorecard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000/archers-scorecard/`

### Building for Production

To build the application for production (GitHub Pages):

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment.

## Usage

### Starting a Session

1. Select a round type from the dropdown menu
2. Click "Start Session" to begin scoring
3. The scoring interface will appear with input fields for each arrow

### Scoring Arrows

- Enter scores from 1-10 for point values
- Use "X" for inner 10 (gold center)
- Use "M" for miss (0 points)
- Invalid entries will be automatically cleared

### Completing Ends

1. Fill in all arrow scores for the current end
2. Click "Complete End" to save and move to the next end
3. Use "Clear End" to reset the current end if needed

### Session Management

- Running total is displayed and updated after each completed end
- End number shows current progress through the round
- Sessions are automatically saved to local storage
- Complete sessions are added to history

### Viewing History

1. Click the "History" tab to view past sessions
2. Sessions show date, round type, final score, and completion status
3. History is persistent across browser sessions

## Testing

### Unit Tests

Run unit tests with Jest:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
npm run test:e2e
```

The E2E tests will automatically start the development server and run tests against the live application.

### Test Coverage

Unit tests cover:
- Round type definitions and validation
- Storage service functionality
- Score calculation logic
- Data persistence and retrieval

E2E tests cover:
- Complete user workflows
- UI interactions and navigation
- Score input and validation
- Session management
- Local storage integration

## Project Structure

```
archers-scorecard/
├── src/
│   ├── app.ts              # Main application class
│   ├── main.ts             # Application entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── services/
│   │   └── storage-service.ts  # Local storage management
│   └── utils/
│       ├── event-bus.ts    # Event system
│       └── round-types.ts  # Round definitions
├── tests/
│   ├── unit/               # Jest unit tests
│   ├── e2e/                # Playwright E2E tests
│   └── setup.ts            # Test configuration
├── public/
│   ├── index.html          # Main HTML file
│   └── styles.css          # Application styles
├── dist/                   # Built files (generated)
├── jest.config.js          # Jest configuration
├── playwright.config.ts    # Playwright configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Project dependencies
```

## Architecture

### Core Components

- **App**: Main application controller managing state and UI
- **StorageService**: Handles local storage operations with error handling
- **EventBus**: Provides event-driven communication between components
- **RoundTypes**: Defines archery round specifications and target faces

### Data Flow

1. User selects round type and starts session
2. App creates session object with round specifications
3. User inputs arrow scores with real-time validation
4. Completed ends are saved to current session
5. Session data is persisted to local storage
6. Completed sessions are added to history

### Storage Schema

Sessions are stored in local storage with the following structure:

```typescript
interface Session {
  id: string;
  roundType: RoundType;
  startTime: Date;
  endTime?: Date;
  ends: End[];
  metadata: Record<string, any>;
  isComplete: boolean;
}
```

## Deployment

### GitHub Pages

The application is configured for GitHub Pages deployment:

1. Build the application: `npm run build`
2. The `dist` folder contains the deployable files
3. Configure GitHub Pages to serve from the `dist` directory
4. The application will be available at your GitHub Pages URL

### Custom Domain

To deploy to a custom domain:

1. Update the `base` path in `vite.config.ts`
2. Rebuild the application
3. Deploy the `dist` folder to your web server

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test && npm run test:e2e`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use ESLint and Prettier for code quality
- Follow semantic versioning for releases
- Update documentation for API changes

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

The application uses modern web APIs and requires a browser with:
- ES2020 support
- Local Storage API
- CSS Grid and Flexbox

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- World Archery Federation for round specifications
- TypeScript team for excellent tooling
- Vite team for fast development experience
- Jest and Playwright teams for testing frameworks
