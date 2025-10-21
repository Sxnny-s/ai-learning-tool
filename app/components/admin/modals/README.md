# Admin Modal Components

This directory contains reusable modal components for the admin cohort management interface.

## Components

### Cohort Modals

#### CreateCohortModal

- **Purpose**: Create a new cohort
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onSubmit: (cohortName: string) => void` - Called with validated cohort name
  - `loading?: boolean` - Shows loading state
  - `error?: string` - Displays error message

#### EditCohortModal

- **Purpose**: Edit an existing cohort name
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onSubmit: (newCohortName: string) => void` - Called with new cohort name
  - `currentCohortName: string` - Current name to pre-fill and validate against
  - `loading?: boolean` - Shows loading state
  - `error?: string` - Displays error message

#### DeleteCohortModal

- **Purpose**: Confirm deletion of a cohort
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onConfirm: () => void` - Called when deletion is confirmed
  - `cohortName: string` - Name of cohort being deleted
  - `studentCount: number` - Number of students in cohort (for warning)
  - `loading?: boolean` - Shows loading state

### Student Modals

#### AddStudentModal

- **Purpose**: Create a new student and add to cohort
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onSubmit: (studentData: { fullName: string; email: string }) => void` - Called with student data
  - `cohortName: string` - Name of cohort student will be added to
  - `loading?: boolean` - Shows loading state
  - `error?: string` - Displays error message

#### EditStudentModal

- **Purpose**: Edit an existing student's information
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onSubmit: (studentData: { fullName: string; email: string }) => void` - Called with updated student data
  - `currentStudent: { name: string; email: string }` - Current student data to pre-fill
  - `loading?: boolean` - Shows loading state
  - `error?: string` - Displays error message

#### DeleteStudentModal

- **Purpose**: Confirm removal of student from cohort
- **Props**:
  - `isOpen: boolean` - Controls modal visibility
  - `onClose: () => void` - Called when modal is closed
  - `onConfirm: () => void` - Called when removal is confirmed
  - `studentName: string` - Name of student being removed
  - `studentEmail: string` - Email of student being removed
  - `cohortName: string` - Name of cohort student is being removed from
  - `loading?: boolean` - Shows loading state

## Validation Rules

### Cohort Name

- Required
- Minimum 2 characters
- Maximum 50 characters
- Only letters, numbers, spaces, hyphens, and underscores allowed

### Student Name

- Required
- Minimum 2 characters
- Maximum 100 characters

### Student Email

- Required
- Valid email format

## Usage Example

```tsx
import { CreateCohortModal } from '@/components/admin/modals'

const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleCreateCohort = async (cohortName: string) => {
  setLoading(true)
  setError('')
  
  try {
    await createCohort({ name: cohortName, studentIds: [] })
    setIsCreateModalOpen(false)
    // Refresh data or show success message
  } catch (err) {
    setError('Failed to create cohort. Please try again.')
  } finally {
    setLoading(false)
  }
}

return (
  <CreateCohortModal
    isOpen={isCreateModalOpen}
    onClose={() => setIsCreateModalOpen(false)}
    onSubmit={handleCreateCohort}
    loading={loading}
    error={error}
  />
)
```

## Features

- **Form Validation**: Client-side validation with clear error messages
- **Loading States**: Disabled inputs and loading text during operations
- **Keyboard Navigation**: ESC to close, Enter to submit
- **Accessibility**: Proper ARIA labels and focus management
- **Error Handling**: Display of API errors and validation errors
- **Responsive Design**: Works on mobile and desktop
- **Consistent Styling**: Uses the existing UI component library
