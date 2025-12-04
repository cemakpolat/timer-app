# Timer App Improvement Roadmap

## 💪 Workout Feature Development Roadmap

### Completed (December 4, 2025)
- [x] Created workout templates service with 9 pre-configured workouts
- [x] Built WorkoutBrowser component with filtering and search
- [x] Integrated WorkoutsPanel into main app
- [x] Fixed timer dots overflow with scrollable navigation (proper flexbox solution)
- [x] Fixed navigation to return to workouts tab after completion/reset
- [x] Simplified WorkoutsPanel (removed unnecessary tabs and hero)
- [x] Added scroll to composite timer builder for long sequences
- [x] Designed unified timer/workout architecture (see WORKOUT_ARCHITECTURE.md)
- [x] **Option A Implementation Completed:**
  - [x] Enhanced saveSequence to add workout metadata (category, difficulty, emoji, tags)
  - [x] Updated WorkoutBrowser to display both templates and custom sequences
  - [x] Added source filter tabs (All Workouts / Templates / My Workouts)
  - [x] Added delete button for custom workouts
  - [x] Custom timer sequences now appear in workouts tab
  - [x] Dynamic dot sizing for long sequences (prevents ellipse appearance)
- [x] **Fixed workout auto-start and ambient music:**
  - [x] Added ambient sound trigger to startSequence() function
  - [x] Workouts now auto-start and play ambient music when clicking "Start Solo"

### Phase 1: Unified Timer System (Next 1-2 weeks)
- [ ] Create `timerService.js` with unified CRUD operations
- [ ] Add metadata fields to workout template definitions
- [ ] Implement getAllTimers() to merge templates + custom timers
- [ ] Add migration logic for existing saved sequences
- [ ] Update WorkoutBrowser to show both templates and custom timers
- [ ] Add source filter (All / Templates / My Workouts)

### Phase 2: Enhanced Composite Timer UI (Next sprint)
- [ ] Add visual metadata input fields to CompositePanel save dialog:
  - [ ] Description textarea
  - [ ] Category dropdown UI (cardio, strength, flexibility, etc.)
  - [ ] Difficulty selector buttons (beginner, intermediate, advanced)
  - [ ] Emoji picker button
  - [ ] Tags input with suggestions
  - [ ] "Available for Focus Rooms" checkbox
  - [ ] Recommended participants input
- [ ] Pass metadata from UI to saveSequence function
- [ ] Add validation for required fields (name, category)
- [ ] Add preview of workout metadata before saving
- [ ] Test full custom workout creation and display flow

### Phase 3: Focus Room Integration (Week 5)
- [ ] Update CreateRoomModal to show all room-compatible timers
- [ ] Add optgroups: "Workout Templates" and "My Workouts"
- [ ] Pre-fill room metadata from selected timer
- [ ] Test room creation with custom workouts
- [ ] Add workout name display in active rooms

### Phase 4: Advanced Features (Week 6+)
- [ ] Add edit functionality for custom timers
- [ ] Add delete with confirmation for custom timers
- [ ] Implement clone/duplicate for templates
- [ ] Add workout history tracking (completions, streaks)
- [ ] Add favorites system with quick filter
- [ ] Implement workout sharing (export/import JSON)
- [ ] Add usage statistics to workout cards ("Last used: 2 days ago")
- [ ] Create workout stats dashboard

### Technical Debt & Improvements
- [ ] Add TypeScript types for timer/workout objects
- [ ] Write unit tests for timerService
- [ ] Add integration tests for workout flow
- [ ] Optimize getAllTimers() with caching
- [ ] Add error handling for localStorage failures
- [ ] Implement cloud sync (Firebase) for cross-device access

### Design Enhancements
- [ ] Add visual preview of workout timeline
- [ ] Improve workout card design with better typography
- [ ] Add animation for workout start transitions
- [ ] Create onboarding tour for workout features
- [ ] Add empty state illustrations for "My Workouts"

---

*Last Updated: December 4, 2025 - Workout Integration Phase 1 Complete*
*Next Review: December 2025*</content>
<parameter name="filePath">/Users/cemakpolat/Development/timer-app/TODO.md