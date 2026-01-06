# Implementation Plan: Firebase Student & Meal Settings Sync

## Overview

This implementation plan converts the Students page from using local mock data to Firebase Firestore with real-time synchronization. The MealSettingsContext already has Firebase integration, so we'll focus on the Students page and updating Firestore security rules.

## Tasks

- [x] 1. Create StudentsContext for Firebase synchronization
  - [x] 1.1 Create StudentsContext with state management
    - Create `src/contexts/StudentsContext.tsx`
    - Define `StudentsContextType` interface with students array, loading, error states
    - Implement `addStudent`, `updateStudent`, `deleteStudent` functions
    - Implement `searchStudents` filter function
    - _Requirements: 1.1, 1.2, 2.1, 3.1_

  - [x] 1.2 Implement real-time Firestore subscription
    - Use `subscribeToStudents` from firestore.ts in useEffect
    - Handle subscription cleanup on unmount
    - Update local state when Firestore data changes
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.3 Implement optimistic updates with rollback
    - Store backup state before operations
    - Update local state immediately (optimistic)
    - Rollback on Firestore operation failure
    - _Requirements: 2.3, 2.4, 3.3_

- [x] 2. Refactor Students page to use StudentsContext
  - [x] 2.1 Replace local state with context
    - Remove `initialStudents` mock data
    - Remove local `students` useState
    - Import and use `useStudents` hook from context
    - _Requirements: 1.2_

  - [x] 2.2 Update CRUD handlers to use context functions
    - Update `handleAddStudent` to call `addStudent` from context
    - Update `handleEditStudent` to call `updateStudent` from context
    - Update `handleDeleteStudent` to call `deleteStudent` from context
    - _Requirements: 1.1, 2.1, 3.1_

  - [x] 2.3 Add loading and error states to UI
    - Show loading skeleton while fetching students
    - Disable action buttons during operations
    - Display error messages on failures
    - _Requirements: 1.3, 8.1, 8.2, 8.3_

- [x] 3. Update Firestore security rules
  - [x] 3.1 Update firestore.rules with authentication requirements
    - Add `isAuthenticated()` helper function
    - Require authentication for students collection
    - Require authentication for settings collection
    - Require authentication for mealLogs collection
    - Require authentication for cafeterias collection
    - Add comments explaining security model
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 4. Checkpoint - Verify basic functionality
  - Ensure students load from Firestore
  - Ensure add/edit/delete operations sync to Firestore
  - Ensure real-time updates work across browser tabs
  - Ask the user if questions arise

- [x] 5. Add error handling and retry mechanism
  - [x] 5.1 Implement error handling in context
    - Catch Firestore errors in all operations
    - Set error state with user-friendly messages
    - Implement retry function for failed operations
    - _Requirements: 1.4, 8.3, 8.4_

  - [x] 5.2 Display error states in UI
    - Show error alert when operations fail
    - Add retry button for failed operations
    - Clear error state on successful retry
    - _Requirements: 8.3, 8.4_

- [x] 6. Wire up App.tsx with StudentsProvider
  - [x] 6.1 Add StudentsProvider to component tree
    - Import StudentsProvider in App.tsx
    - Wrap application with StudentsProvider
    - Ensure proper provider ordering
    - _Requirements: 1.2, 4.1_

- [x] 7. Final checkpoint - Ensure all functionality works
  - Test complete CRUD flow for students
  - Test real-time sync between multiple tabs
  - Test error handling with network disconnection
  - Verify meal settings still sync correctly
  - Ask the user if questions arise

## Notes

- The existing `src/lib/firestore.ts` already has all necessary Firestore functions
- The MealSettingsContext already implements Firebase sync correctly
- Focus is on Students page which currently uses mock data
- Firestore rules will require authentication (users must be logged in)
