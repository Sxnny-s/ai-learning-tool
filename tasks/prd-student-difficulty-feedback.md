# Product Requirements Document: Student Difficulty Feedback System

## Introduction/Overview

This feature enables students to provide structured feedback about areas they're struggling with in their coursework. Students can select predefined topics based on their current learning path and add custom areas of difficulty. This feedback is aggregated and visualized in a pie chart on the instructor/admin dashboard, replacing the current `StrugglingStudentsAlert` component. The system helps instructors identify common pain points across cohorts and provide targeted support.

**Problem this solves:** Currently, instructors rely on indirect signals (low progress, inactivity) to identify struggling students. This feature provides direct, actionable feedback from students about specific topics they find challenging, enabling more targeted intervention.

**Goal:** Create a bidirectional feedback loop where students can easily communicate their struggles, and instructors can visualize and respond to cohort-wide learning challenges.

---

## Goals

1. **Empower Students:** Provide an easy, non-judgmental way for students to request help on specific topics
2. **Aggregate Insights:** Give instructors visibility into common difficulty areas across the entire cohort
3. **Enable Targeted Support:** Help instructors prioritize which topics need additional explanation, resources, or one-on-one sessions
4. **Flexible Data Collection:** Support both predefined curriculum topics and student-identified custom areas of difficulty
5. **Real-Time Awareness:** Notify instructors when students submit feedback indicating they're struggling

---

## User Stories

### Student User Stories

1. **As a student**, I want to select topics I'm having trouble with from a checklist, so that my instructor knows where I need help without having to send an email or message.

2. **As a student**, I want to write in specific areas not covered by the checklist, so that I can communicate unique challenges I'm facing.

3. **As a student**, I want to update my difficulty feedback anytime, so that I can add new struggles or remove topics I've since mastered.

4. **As a student**, I want the feedback form to be easily accessible on my dashboard, so that I can quickly submit feedback when I realize I'm stuck.

### Instructor/Admin User Stories

5. **As an instructor**, I want to see a pie chart showing what topics students are struggling with most, so that I can adjust my teaching focus or provide additional resources.

6. **As an instructor**, I want to filter the difficulty data by cohort, so that I can tailor my interventions to specific groups of students.

7. **As an instructor**, I want to be notified when students submit difficulty feedback, so that I can reach out proactively to offer support.

8. **As an admin**, I want the difficulty visualization to replace the StrugglingStudentsAlert component, so that the dashboard provides actionable, topic-specific insights rather than general "at-risk" alerts.

---

## Functional Requirements

### Student-Facing Form (Frontend)

1. **FR-1:** The system must display a "Learning Difficulties" feedback card on the student's main Dashboard tab.

2. **FR-2:** The feedback form must include a list of checkboxes representing topics from a hardcoded list based on the current lesson plans (for MVP).

3. **FR-3:** The system must include an "Other" checkbox option.

4. **FR-4:** When the "Other" checkbox is selected, the system must display a text input field limited to 200 characters.

5. **FR-5:** Students must be able to submit the form at any time without restrictions (unlimited submissions/updates).

6. **FR-6:** The form must persist the student's previous selections, allowing them to update or modify their feedback.

7. **FR-7:** Students must be able to view their current difficulty feedback on the form (pre-populated with their existing selections).

8. **FR-8:** Students must be able to completely remove/delete their feedback if they no longer need help (e.g., "Clear All" or "Remove Feedback" button).

9. **FR-9:** The system must display a success confirmation message after submission (e.g., "Your feedback has been submitted.")

10. **FR-10:** The form must be visually styled as a Card component consistent with the existing student dashboard design.

### Data Storage (Backend)

11. **FR-11:** The system must store each student's difficulty feedback with the following fields:
   - Student ID
   - Cohort ID
   - Selected predefined topics (array)
   - Custom "Other" text (if provided)
   - Timestamp of submission
   - Last updated timestamp

12. **FR-12:** When a student updates their feedback, the system must overwrite their previous submission (not create duplicates).

13. **FR-13:** When a student deletes their feedback, the system must remove their entry from the database entirely.

14. **FR-14:** When a student switches cohorts, they must submit new feedback for the new cohort (previous cohort feedback remains tied to the old cohort).

15. **FR-15:** The system must validate that custom "Other" text does not exceed 200 characters before saving to the database.

### Instructor/Admin Dashboard (Pie Chart Visualization)

16. **FR-16:** The system must replace the `StrugglingStudentsAlert` component on the instructor/admin dashboard with a "Student Difficulty Insights" pie chart component.

17. **FR-17:** The pie chart must aggregate difficulty feedback from all students in the most recent cohort by default.

18. **FR-18:** The system must provide a cohort selector (dropdown or tabs) allowing instructors to switch between different cohorts.

19. **FR-19:** The pie chart must display each predefined topic as a separate slice (labeled with topic name and count/percentage), with all custom "Other" responses aggregated into a single "Other/Custom" slice.

20. **FR-20:** The pie chart must display all submitted difficulty topics without a minimum threshold (even if only one student reports difficulty with a topic).

21. **FR-21:** When hovering over or clicking the "Other/Custom" slice, the system must display a tooltip or expandable list showing the individual custom responses.

22. **FR-22:** Instructors/admins must be able to mark individual topics as "addressed" directly from the chart interface (e.g., via a button or context menu on each slice).

23. **FR-23:** When a topic is marked as "addressed," the system must remove that topic's data from the current pie chart view (but preserve the underlying student feedback in the database).

24. **FR-24:** The system must maintain a separate table or field tracking which topics have been marked as "addressed" by cohort and instructor.

25. **FR-25:** Instructors must be able to view a history or list of "addressed" topics and un-mark them if needed (e.g., "Show Addressed Topics" toggle).

26. **FR-26:** If no students in the selected cohort have submitted feedback, the component must display a message: "No difficulty feedback submitted yet."

27. **FR-27:** The pie chart must use the existing chart library (Recharts) and styling consistent with other dashboard charts.

### In-App Notifications (Admin Dashboard Only)

28. **FR-28:** When a student submits or updates their difficulty feedback, the system must display a visual indicator on the admin dashboard showing new feedback has been submitted (e.g., badge count, alert banner, or timestamp).

29. **FR-29:** The Student Difficulty Insights component must display the timestamp of the most recent feedback submission (e.g., "Last updated: 2 minutes ago").

30. **FR-30:** The system must NOT send external notifications (email, SMS, etc.). All notifications are contained within the admin dashboard interface.

31. **FR-31:** Optional: Display a list of recent feedback submissions below the pie chart showing:
    - Student name
    - Topics selected
    - Timestamp
    - Link to view the student's profile

### API Requirements

32. **FR-32:** The system must provide a POST endpoint `/api/student/difficulty-feedback` to accept feedback submissions and updates.

33. **FR-33:** The system must provide a DELETE endpoint `/api/student/difficulty-feedback` to allow students to remove their entire feedback entry.

34. **FR-34:** The system must provide a GET endpoint `/api/student/difficulty-feedback` to retrieve the current student's existing feedback for pre-populating the form.

35. **FR-35:** The system must provide a GET endpoint `/api/admin/difficulty-insights?cohortId={id}` to retrieve aggregated difficulty data for a specific cohort.

36. **FR-36:** The system must provide a POST endpoint `/api/admin/difficulty-insights/mark-addressed` to allow admins to mark topics as addressed.

37. **FR-37:** The system must provide a GET endpoint `/api/admin/difficulty-insights/addressed?cohortId={id}` to retrieve the list of topics marked as addressed for a cohort.

---

## Non-Goals (Out of Scope)

1. **Individual student difficulty tracking on the instructor dashboard** - This feature focuses on cohort-level aggregation, not drilling down into individual student feedback from the pie chart.

2. **Automated remediation or resource suggestions** - The system will visualize data but won't automatically assign learning resources or interventions.

3. **Historical trend analysis** - Version 1 will show current feedback only, not trends over time (e.g., "JavaScript struggles decreased by 20% this month").

4. **Gamification or incentives** - No points, badges, or rewards for submitting feedback.

5. **Multi-language support** - Feedback will be collected in English only.

6. **Integration with external learning management systems (LMS)** - This is an internal feature only.

7. **Automatic categorization or promotion of "Other" responses** - Custom responses will be grouped under "Other" and require manual instructor review. Since the curriculum is constantly changing, there is no need to promote "Other" responses into predefined topics for the MVP.

8. **External notifications (email, SMS, push)** - All feedback visibility is contained within the admin dashboard interface only.

9. **Privacy filtering based on submission count** - All difficulty topics will be displayed regardless of how many students report them, as only admins can view the aggregated data.

---

## Design Considerations

### Student Feedback Card (Dashboard Tab)

- **Component:** Use existing `Card`, `CardHeader`, `CardTitle`, `CardContent` components
- **Form Elements:** Use existing `Checkbox` and `Textarea` components from the UI library
- **Layout:** Position below or alongside existing dashboard cards (e.g., Calendar & Events)
- **Styling:** Follow existing color scheme and spacing patterns
- **Accessibility:** Ensure all form fields have proper labels and keyboard navigation support

### Instructor Pie Chart Component

- **Component Name:** `StudentDifficultyInsights.tsx` (replaces `StrugglingStudentsAlert.tsx`)
- **Location:** Same position in the admin dashboard layout where `StrugglingStudentsAlert` currently appears
- **Chart Library:** Use Recharts (already in use on the student dashboard)
- **Cohort Selector:** Implement as a dropdown using the existing `Select` component or as `Tabs` for easy switching
- **Color Scheme:** Use distinct colors from the existing `--chart-1`, `--chart-2`, etc. CSS variables
- **Responsiveness:** Ensure the chart is legible on mobile devices

### Notification Design

- **Format:** Follow existing notification patterns in the application
- **Priority:** Medium priority (not urgent alerts, but should be visible)
- **Grouping:** If multiple students submit feedback simultaneously, consider grouping notifications

---

## Technical Considerations

### Database Schema

Create two new tables:

**Table 1: `student_difficulty_feedback`**

```sql
CREATE TABLE student_difficulty_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  cohort_id UUID REFERENCES cohorts(id) NOT NULL,
  selected_topics TEXT[] NOT NULL, -- Array of topic names
  custom_other TEXT, -- Max 200 characters
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, cohort_id) -- Ensure one feedback entry per student per cohort
);
```

**Table 2: `addressed_topics`**

```sql
CREATE TABLE addressed_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id UUID REFERENCES cohorts(id) NOT NULL,
  topic_name TEXT NOT NULL,
  addressed_by UUID REFERENCES profiles(id) NOT NULL, -- Instructor/admin who marked it
  addressed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE, -- For soft deletion if instructor un-marks it
  UNIQUE(cohort_id, topic_name) -- Ensure one entry per topic per cohort
);
```

### Topic List (Hardcoded for MVP)

- **Implementation:** Topics will be hardcoded in the frontend component as a constant array for the MVP
- **Source:** Based on the current lesson plans (see Appendix for initial list)
- **Future Enhancement:** Topics could be made dynamic by creating a `lesson_topics` table and fetching based on student progress, but this is out of scope for MVP

### API Considerations

- **Authentication:** All endpoints must verify the user is authenticated via Clerk
- **Authorization:** 
  - Students can only submit/view their own feedback
  - Instructors/admins can view aggregated data for cohorts they manage
- **Rate Limiting:** Apply the existing rate limiting middleware to prevent abuse
- **Error Handling:** Use the existing error handler middleware

### Integration Points

- **Dashboard Integration:** The Student Difficulty Insights component will replace the `StrugglingStudentsAlert` component in the same layout position on the admin dashboard
- **Cohort Management:** Integrate with the existing `cohortService.ts` to fetch cohort data and filter feedback
- **User Profiles:** Link feedback to the `profiles` table for accurate student identification
- **In-App Notifications:** Display visual indicators (badges, timestamps) on the admin dashboard when new feedback is submitted (no external notification system needed)

---

## Success Metrics

1. **Adoption Rate:** At least 60% of students submit difficulty feedback within the first 2 weeks of feature launch

2. **Instructor Engagement:** Instructors view the difficulty insights dashboard at least 3 times per week

3. **Response Time:** Average time from student feedback submission to instructor action (reach out, resource sharing) decreases by 30%

4. **Feedback Quality:** Less than 10% of submissions are blank or contain only "Other" with unclear text

5. **Update Frequency:** Students update their feedback at least once every 2 weeks (showing ongoing engagement)

6. **Student Satisfaction:** Post-implementation survey shows students feel more supported (qualitative feedback)

---

## Clarifications & Decisions

The following decisions were made during the PRD refinement process:

1. **Topic List:** Topics will be **hardcoded** in the MVP based on the current lesson plans. Dynamic topic generation will be considered for future iterations.

2. **"Other" Response Handling:** Since the curriculum is constantly changing, there is **no need** to implement functionality for promoting "Other" responses into predefined topics at this time.

3. **Mark as Addressed:** **YES** - Instructors/admins should be able to mark topics as "addressed" and remove them from the pie chart view. The system will track addressed topics separately and allow instructors to un-mark them if needed.

4. **Cohort Switching:** When a student switches cohorts, they must **submit new feedback** for the new cohort. Previous cohort feedback remains tied to the old cohort for historical purposes.

5. **Student Feedback Visibility:** **YES** - Students can view their own current feedback (form pre-populated with their selections) and can **delete/remove their entire feedback** if they no longer need help.

6. **Notification System:** **No external notifications** needed (no email, SMS, or push). All feedback visibility is contained within the admin dashboard interface with visual indicators (badges, timestamps, recent submissions list).

7. **Minimum Threshold:** **No minimum threshold** - The pie chart will display all submitted difficulty topics, even if only one student reports difficulty with a topic.

8. **Privacy Considerations:** **Not necessary** - Since only admins/instructors can view the aggregated pie chart (students cannot see others' feedback), there are no privacy concerns about displaying topics with low submission counts.

---

## Implementation Notes for Developers

### Key Files to Create

1. `app/components/student/DifficultyFeedbackCard.tsx` - Student-facing form component with delete functionality
2. `app/components/admin/StudentDifficultyInsights.tsx` - Admin pie chart component (replaces StrugglingStudentsAlert) with "mark as addressed" functionality
3. `app/api/student/difficulty-feedback/route.ts` - API routes for submitting, fetching, and deleting feedback (GET, POST, DELETE)
4. `app/api/admin/difficulty-insights/route.ts` - API route for retrieving aggregated data (GET)
5. `app/api/admin/difficulty-insights/mark-addressed/route.ts` - API route for marking topics as addressed (POST)
6. `app/api/admin/difficulty-insights/addressed/route.ts` - API route for retrieving addressed topics (GET)
7. `db/migrations/YYYYMMDD_create_difficulty_feedback_tables.sql` - Database migration for both tables

### Key Files to Modify

1. `app/student/page.tsx` - Import and render `DifficultyFeedbackCard` in the Dashboard tab
2. `app/admin/page.tsx` - Replace `StrugglingStudentsAlert` with `StudentDifficultyInsights`
3. `types/data.ts` - Add TypeScript interfaces for feedback data structures:
   - `DifficultyFeedback` (student submission)
   - `DifficultyInsight` (aggregated data for pie chart)
   - `AddressedTopic` (tracked addressed topics)

### Testing Checklist

- [ ] Student can submit feedback with predefined topics only
- [ ] Student can submit feedback with "Other" custom text (max 200 chars)
- [ ] Student can view their existing feedback (form pre-populated)
- [ ] Student can update their previous feedback
- [ ] Student can delete their entire feedback entry
- [ ] Custom text is limited to 200 characters (frontend and backend validation)
- [ ] When student switches cohorts, new feedback is required
- [ ] Instructor can view aggregated pie chart for the most recent cohort
- [ ] Instructor can switch between different cohorts using selector
- [ ] Pie chart displays all topics without minimum threshold
- [ ] "Other/Custom" slice shows individual responses on hover/click
- [ ] Instructor can mark a topic as "addressed" from the chart
- [ ] Marked topics are removed from the current chart view
- [ ] Instructor can view and un-mark addressed topics
- [ ] Visual indicators show when new feedback is submitted
- [ ] Timestamp of most recent feedback is displayed
- [ ] Empty states display correctly (no feedback submitted yet)
- [ ] Component is responsive on mobile devices
- [ ] Accessibility: keyboard navigation and screen reader support
- [ ] API endpoints properly validate authentication and authorization

---

## Appendix: Example Predefined Topics (Initial List)

For the MVP, consider using these programming fundamentals topics:

1. Variables & Data Types
2. Loops (for, while)
3. Functions & Parameters
4. Arrays & Objects
5. Conditional Logic (if/else)
6. DOM Manipulation
7. APIs & Fetch Requests
8. Asynchronous JavaScript (Promises, async/await)
9. React Components
10. State Management
11. CSS & Styling
12. Debugging & Error Handling

**Note:** This list should be reviewed with instructors and aligned with the actual curriculum before implementation.

