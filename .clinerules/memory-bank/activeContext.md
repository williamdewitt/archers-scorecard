# Active Context: Archers Scorecard

## Current Work Focus
**Phase**: Initial Development Setup
**Priority**: Establish project foundation with TypeScript, build tools, and core architecture

## Recent Changes
- Created Memory Bank documentation structure
- Defined project requirements and technical architecture
- Established design patterns and component structure

## Next Steps
1. **Project Setup** (Current Priority)
   - Initialize npm project with TypeScript and Vite
   - Configure build tools, linting, and testing frameworks
   - Set up project directory structure

2. **Core Type Definitions**
   - Define TypeScript interfaces for Session, End, Arrow, RoundType
   - Create scoring and validation types
   - Establish error handling types

3. **Foundation Services**
   - Implement StorageService for localStorage operations
   - Create CalculationService for scoring logic
   - Build ValidationService for input validation

4. **Basic UI Components**
   - Create base component class and event system
   - Implement ScoreInput component
   - Build SessionManager component

## Active Decisions and Considerations

### Build Tool Choice: Vite
- **Rationale**: Fast development server, excellent TypeScript support, optimized for modern browsers
- **Alternative Considered**: Webpack (rejected due to complexity for static site)
- **Impact**: Faster development iteration, simpler configuration

### State Management: Custom Observer Pattern
- **Rationale**: Lightweight, no external dependencies, fits simple use case
- **Alternative Considered**: Redux/Zustand (rejected due to overhead for client-only app)
- **Impact**: Smaller bundle size, easier to understand and maintain

### Testing Strategy: Jest + Playwright
- **Rationale**: Jest for unit tests, Playwright for cross-browser e2e testing
- **Coverage Target**: 80%+ for core business logic, 60%+ overall
- **Focus Areas**: Scoring calculations, data persistence, user workflows

## Important Patterns and Preferences

### Code Organization
- **Barrel Exports**: Use index.ts files for clean imports
- **Naming Convention**: PascalCase for classes, camelCase for functions/variables
- **File Structure**: Group by feature, not by type (components/scoring/, not components/all)

### Error Handling
- **Pattern**: Result<T, E> type for operations that can fail
- **User Errors**: Show friendly messages, log technical details
- **Validation**: Fail fast with clear error messages

### Performance Priorities
1. **Score Input Response**: < 100ms for immediate feedback
2. **Auto-save**: Debounced to avoid excessive localStorage writes
3. **History Loading**: Virtual scrolling for large datasets
4. **Bundle Size**: < 100KB gzipped for mobile users

## Learnings and Project Insights

### World Archery Rules Complexity
- **Inner 10 (X)**: Counts as 10 for score but tracked separately for tie-breaking
- **Target Faces**: Different sizes (122cm, 80cm, 40cm) affect scoring zones
- **Round Variations**: Distance, arrow count, and target face combinations

### Mobile-First Considerations
- **Touch Targets**: 44px minimum for accessibility
- **Input Method**: Large buttons preferred over text input for scores
- **Orientation**: Support both portrait and landscape modes
- **Offline Usage**: Critical for field conditions

### Local Storage Limitations
- **Size Limit**: ~5-10MB typical, need efficient data structure
- **Versioning**: Plan for data migration as features evolve
- **Backup Strategy**: JSON export/import for user data portability

## Development Environment Notes
- **Node Version**: Targeting 18+ for modern JavaScript features
- **Browser Testing**: Chrome/Safari/Firefox latest versions
- **Mobile Testing**: iOS Safari and Chrome Mobile priority
- **GitHub Pages**: Static site deployment, no server-side processing

## Risk Mitigation
- **Data Loss**: Implement robust auto-save and export functionality
- **Browser Compatibility**: Progressive enhancement, graceful degradation
- **Performance**: Monitor bundle size, optimize critical rendering path
- **User Experience**: Extensive testing on actual mobile devices in field conditions
