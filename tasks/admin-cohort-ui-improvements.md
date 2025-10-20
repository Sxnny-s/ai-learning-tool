# Admin Cohort Page UI Improvements

## Overview

Replace prompt-based interactions with proper modal components to improve user experience and maintain consistency with modern UI patterns.

## Current Issues

- Using browser `prompt()` and `confirm()` dialogs which are not user-friendly
- No form validation or error handling in UI
- Inconsistent user experience across different actions
- No loading states during operations

## User Stories

### Cohort Management

1. **Create Cohort**: As an admin, I want to click "Create Cohort" and see a modal form where I can enter the cohort name, so that I can create new cohorts with proper validation and feedback.

2. **Edit Cohort**: As an admin, I want to click the edit button on a cohort and see a modal form pre-filled with the current name, so that I can rename cohorts with validation to prevent empty names.

3. **Delete Cohort**: As an admin, I want to click the delete button on a cohort and see a confirmation modal with clear messaging about the consequences, so that I can safely delete cohorts without accidental data loss.

### Student Management

1. **Add Student**: As an admin, I want to click "Add Student" and see a modal form with fields for full name and email, so that I can create new students with proper validation and add them to the selected cohort.

2. **Edit Student**: As an admin, I want to click the edit button on a student and see a modal form pre-filled with current student information, so that I can update student details with validation.

3. **Delete Student**: As an admin, I want to click the delete button on a student and see a confirmation modal explaining that the student will be removed from the cohort, so that I can safely remove students without confusion.

## Task Breakdown

### Phase 1: Modal Infrastructure

- [x] **Task 1.1**: Create reusable modal components using existing UI library, place them in the `components/admin/modals` directory.
  - [x] Create `CreateCohortModal` component
  - [x] Create `EditCohortModal` component  
  - [x] Create `DeleteCohortModal` component
  - [x] Create `AddStudentModal` component
  - [x] Create `EditStudentModal` component
  - [x] Create `DeleteStudentModal` component

### Phase 2: Form Components

- [x] **Task 2.1**: Build form components with validation
  - [x] Create cohort name input with validation (required, min length, unique)
  - [x] Create student form with name and email validation
  - [x] Add proper error states and messaging
  - [x] Implement loading states for form submissions

### Phase 3: Integration

- [x] **Task 3.1**: Replace prompt-based handlers in `CohortsPage`
  - [x] Update `handleCreateCohort` to use modal
  - [x] Update `handleEditCohort` to use modal
  - [x] Update `handleDeleteCohort` to use modal
  - [x] Update `handleAddStudent` to use modal
  - [x] Update `handleEditStudent` to use modal
  - [x] Update `handleDeleteStudent` to use modal

### Phase 4: State Management

- [x] **Task 4.1**: Implement modal state management
  - [x] Add modal open/close state for each modal type
  - [x] Add form data state management
  - [x] Add loading states for async operations
  - [x] Add error handling and user feedback

### Phase 4.5: View Student Details

- [x] **Task 4.5.1**: Implement view student details modal
  - [x] Add modal open/close state for view student details modal
  - [x] Add loading states for async operations
  - [x] Add error handling and user feedback

## Technical Requirements

### Modal Components Structure

```typescript
// Example structure for modal components
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading?: boolean;
  error?: string;
}

// Form validation schemas
interface CohortFormData {
  name: string;
}

interface StudentFormData {
  fullName: string;
  email: string;
}
```

### UI Components to Use

- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from `@/components/ui/dialog`
- `Button` from `@/components/ui/button`
- `Input` from `@/components/ui/input`
- `Label` from `@/components/ui/label`
- `AlertDialog` for confirmation modals
- `Toast` for success/error notifications

### Validation Rules

- **Cohort Name**: Required, minimum 2 characters, maximum 50 characters, no special characters
- **Student Name**: Required, minimum 2 characters, maximum 100 characters
- **Student Email**: Required, valid email format, unique within cohort

### Error Handling

- Network errors during API calls
- Validation errors for form inputs
- Duplicate name/email errors
- Permission errors (if user loses admin access)

## Success Criteria

- [x] All prompt/confirm dialogs replaced with proper modals
- [ ] Form validation working correctly
- [ ] Loading states visible during operations
- [ ] Error messages clear and actionable
- [x] Mobile responsive design
- [x] No regression in existing functionality
- [x] Improved user experience with better feedback

## Dependencies

- Existing UI component library (`@/components/ui/*`)
- Current API endpoints (no changes needed)
- Form validation library (consider adding if not present)
- Toast notification system

## Estimated Effort

- **Phase 1-2**: 2-3 days (Modal and form components)
- **Phase 3-4**: 1-2 days (Integration and state management)
- **Phase 5-6**: 1-2 days (UX enhancements and testing)
- **Total**: 4-7 days

## Notes

- Preserve all existing functionality and API calls
- Maintain current data flow and state updates
- Ensure accessibility compliance
- Consider adding form libraries like React Hook Form for better form management
- Test thoroughly with different user scenarios and edge cases
