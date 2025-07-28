# Project Brief: Archers Scorecard

## Project Overview
A digital archery score keeping application built in TypeScript that can be hosted on GitHub Pages. The application follows World Archery rules and maintains session state and practice history using browser local storage.

## Core Requirements

### Functional Requirements
1. **Score Tracking**: Follow World Archery Federation (WA) rules for scoring
2. **Session Management**: Track current scoring session with ability to save/resume
3. **History**: Maintain practice session history using local storage
4. **Hosting**: Deploy to GitHub Pages for easy access
5. **Testing**: Include Jest unit tests and Playwright e2e tests

### Technical Requirements
- **Language**: TypeScript for type safety
- **Hosting**: GitHub Pages compatible (static site)
- **Storage**: Browser local storage for persistence
- **Testing**: Jest for unit tests, Playwright for end-to-end testing
- **Architecture**: Client-side only application

### World Archery Rules Context
- Standard target faces (122cm, 80cm, 40cm)
- Scoring zones: 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, Miss (M)
- Inner 10 ring (X) for tie-breaking
- Standard distances and rounds
- Arrow counting and end management

## Success Criteria
1. Accurate score calculation following WA rules
2. Persistent session state across browser sessions
3. Clean, intuitive user interface
4. Comprehensive test coverage
5. Successful deployment to GitHub Pages
6. Mobile-responsive design for field use

## Project Scope
- Focus on individual practice sessions
- Support common WA rounds (70m, 50m, 30m, 18m)
- Basic statistics and history tracking
- No user accounts or server-side components required
