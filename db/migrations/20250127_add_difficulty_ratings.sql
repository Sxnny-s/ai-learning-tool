-- Migration: Add difficulty ratings to student feedback
-- Created: 2025-01-27
-- Description: Allow students to rate each topic's difficulty level

-- Add topic_ratings column to store difficulty ratings for each topic
-- Format: {"topic_name": "High"|"Medium"|"Low"}
ALTER TABLE student_difficulty_feedback 
ADD COLUMN IF NOT EXISTS topic_ratings JSONB DEFAULT '{}';

-- Add index for better query performance on topic_ratings
CREATE INDEX IF NOT EXISTS idx_difficulty_feedback_topic_ratings 
ON student_difficulty_feedback USING GIN (topic_ratings);

-- Update comment
COMMENT ON COLUMN student_difficulty_feedback.topic_ratings IS 'JSONB object mapping topic names to difficulty ratings (High, Medium, Low)';

