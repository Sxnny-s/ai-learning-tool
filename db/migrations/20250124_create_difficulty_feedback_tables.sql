-- Migration: Create Student Difficulty Feedback System Tables
-- Created: 2025-01-24
-- Description: Tables for student difficulty feedback and instructor-addressed topics

-- Table 1: Student Difficulty Feedback
-- Stores individual student submissions about topics they're struggling with
CREATE TABLE IF NOT EXISTS student_difficulty_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  cohort_id TEXT NOT NULL,
  selected_topics TEXT[] NOT NULL DEFAULT '{}',
  custom_other TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_cohort UNIQUE(user_id, cohort_id),
  CONSTRAINT custom_other_length CHECK (char_length(custom_other) <= 200)
);

-- Table 2: Addressed Topics
-- Tracks which difficulty topics have been addressed by instructors
CREATE TABLE IF NOT EXISTS addressed_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id TEXT NOT NULL,
  topic_name TEXT NOT NULL,
  addressed_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  addressed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  CONSTRAINT unique_cohort_topic UNIQUE(cohort_id, topic_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_difficulty_feedback_user_id ON student_difficulty_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_feedback_cohort_id ON student_difficulty_feedback(cohort_id);
CREATE INDEX IF NOT EXISTS idx_difficulty_feedback_updated_at ON student_difficulty_feedback(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_addressed_topics_cohort_id ON addressed_topics(cohort_id);
CREATE INDEX IF NOT EXISTS idx_addressed_topics_is_active ON addressed_topics(is_active);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_difficulty_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on student_difficulty_feedback
CREATE TRIGGER trigger_update_difficulty_feedback_timestamp
BEFORE UPDATE ON student_difficulty_feedback
FOR EACH ROW
EXECUTE FUNCTION update_difficulty_feedback_updated_at();

-- Comments for documentation
COMMENT ON TABLE student_difficulty_feedback IS 'Stores student submissions about topics they are struggling with';
COMMENT ON TABLE addressed_topics IS 'Tracks which difficulty topics have been addressed by instructors per cohort';

COMMENT ON COLUMN student_difficulty_feedback.selected_topics IS 'Array of predefined topic names the student is struggling with';
COMMENT ON COLUMN student_difficulty_feedback.custom_other IS 'Custom text for topics not in predefined list (max 200 characters)';
COMMENT ON COLUMN addressed_topics.is_active IS 'FALSE if instructor un-marks the topic as addressed (soft delete)';

