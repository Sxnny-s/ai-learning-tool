// Consolidated data types for the AI Learning Platform

export interface Student {
  id: number | string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  status: "Active" | "Inactive" | "Pending";
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastActive: string;
  streak: number;
  cohort?: string | null;
  sessionCount?: number;
  totalTimeSeconds?: number;
  topics?: string[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  students: number;
  completionRate: number;
  status: "Published" | "Draft" | "Archived";
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  student: {
    name: string;
    avatar?: string;
  };
  topic: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
  sentiment: "Positive" | "Neutral" | "Frustrated";
  status: "Active" | "Resolved" | "Needs Help";
  aiResponses: number;
  resolved: boolean;
}

export interface Analytics {
  totalStudents: number;
  activeStudents: number;
  totalLessons: number;
  completedLessons: number;
  totalConversations: number;
  averageCompletionRate: number;
  averageProgress: number;
  weeklyEngagement: number;
  monthlyGrowth: number;
}

export interface DashboardStats {
  totalStudents: number;
  activeLessons: number;
  conversations: number;
  completionRate: number;
}

export interface RecentActivity {
  id: number;
  type: "student" | "lesson" | "conversation";
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

// Sample data generators
export const generateSampleStudents = (): Student[] => [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    joinDate: "2024-01-15",
    status: "Active",
    progress: 85,
    lessonsCompleted: 12,
    totalLessons: 15,
    lastActive: "2 hours ago",
    streak: 7,
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@example.com",
    joinDate: "2024-01-20",
    status: "Active",
    progress: 92,
    lessonsCompleted: 18,
    totalLessons: 20,
    lastActive: "1 hour ago",
    streak: 12,
  },
  {
    id: 3,
    name: "David Chen",
    email: "david@example.com",
    joinDate: "2024-01-25",
    status: "Pending",
    progress: 45,
    lessonsCompleted: 6,
    totalLessons: 15,
    lastActive: "1 day ago",
    streak: 3,
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    joinDate: "2024-02-01",
    status: "Active",
    progress: 78,
    lessonsCompleted: 14,
    totalLessons: 18,
    lastActive: "3 hours ago",
    streak: 5,
  },
  {
    id: 5,
    name: "Michael Brown",
    email: "michael@example.com",
    joinDate: "2024-02-05",
    status: "Inactive",
    progress: 30,
    lessonsCompleted: 4,
    totalLessons: 15,
    lastActive: "1 week ago",
    streak: 0,
  },
];

export const generateSampleLessons = (): Lesson[] => [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React and component-based architecture",
    category: "Frontend",
    difficulty: "Beginner",
    duration: "2 hours",
    students: 245,
    completionRate: 87,
    status: "Published",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Advanced TypeScript",
    description: "Master advanced TypeScript concepts and patterns",
    category: "Programming",
    difficulty: "Advanced",
    duration: "4 hours",
    students: 189,
    completionRate: 72,
    status: "Published",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-20",
  },
  {
    id: 3,
    title: "Database Design",
    description: "Learn how to design efficient database schemas",
    category: "Backend",
    difficulty: "Intermediate",
    duration: "3 hours",
    students: 156,
    completionRate: 91,
    status: "Published",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-18",
  },
  {
    id: 4,
    title: "API Development",
    description: "Build RESTful APIs with Node.js and Express",
    category: "Backend",
    difficulty: "Intermediate",
    duration: "5 hours",
    students: 203,
    completionRate: 68,
    status: "Published",
    createdAt: "2024-01-18",
    updatedAt: "2024-01-25",
  },
  {
    id: 5,
    title: "UI/UX Design Principles",
    description: "Learn fundamental design principles for better user experiences",
    category: "Design",
    difficulty: "Beginner",
    duration: "2.5 hours",
    students: 178,
    completionRate: 85,
    status: "Draft",
    createdAt: "2024-01-20",
    updatedAt: "2024-01-22",
  },
];

export const generateSampleConversations = (): Conversation[] => [
  {
    id: 1,
    student: {
      name: "Alex Johnson",
    },
    topic: "React Hooks Confusion",
    lastMessage: "I'm having trouble understanding useEffect dependencies. Can you help?",
    timestamp: "2 hours ago",
    messageCount: 8,
    sentiment: "Frustrated",
    status: "Active",
    aiResponses: 5,
    resolved: false,
  },
  {
    id: 2,
    student: {
      name: "Maria Garcia",
    },
    topic: "TypeScript Error",
    lastMessage: "Thanks! That fixed the issue. The type assertion worked perfectly.",
    timestamp: "5 hours ago",
    messageCount: 12,
    sentiment: "Positive",
    status: "Resolved",
    aiResponses: 8,
    resolved: true,
  },
  {
    id: 3,
    student: {
      name: "David Chen",
    },
    topic: "Database Query Optimization",
    lastMessage: "How can I improve the performance of this complex query?",
    timestamp: "1 day ago",
    messageCount: 6,
    sentiment: "Neutral",
    status: "Needs Help",
    aiResponses: 3,
    resolved: false,
  },
  {
    id: 4,
    student: {
      name: "Sarah Wilson",
    },
    topic: "CSS Grid Layout",
    lastMessage: "I'm trying to create a responsive grid but it's not working as expected.",
    timestamp: "3 hours ago",
    messageCount: 4,
    sentiment: "Neutral",
    status: "Active",
    aiResponses: 2,
    resolved: false,
  },
  {
    id: 5,
    student: {
      name: "Michael Brown",
    },
    topic: "JavaScript Promises",
    lastMessage: "I understand now! Thanks for the detailed explanation.",
    timestamp: "1 week ago",
    messageCount: 15,
    sentiment: "Positive",
    status: "Resolved",
    aiResponses: 10,
    resolved: true,
  },
];

export const generateSampleAnalytics = (): Analytics => ({
  totalStudents: 1247,
  activeStudents: 1089,
  totalLessons: 89,
  completedLessons: 67,
  totalConversations: 3421,
  averageCompletionRate: 87.3,
  averageProgress: 78.5,
  weeklyEngagement: 92.1,
  monthlyGrowth: 15.7,
});

export const generateSampleDashboardStats = (): DashboardStats => ({
  totalStudents: 1247,
  activeLessons: 89,
  conversations: 3421,
  completionRate: 87.3,
});

export const generateSampleRecentActivity = (): RecentActivity[] => [
  {
    id: 1,
    type: "student",
    title: "Alex Johnson joined",
    description: "New student registered for the platform",
    timestamp: "2 hours ago",
    status: "Active",
  },
  {
    id: 2,
    type: "lesson",
    title: "Advanced TypeScript published",
    description: "New lesson is now available to students",
    timestamp: "5 hours ago",
    status: "Published",
  },
  {
    id: 3,
    type: "conversation",
    title: "Maria Garcia resolved issue",
    description: "Student successfully resolved their TypeScript problem",
    timestamp: "1 day ago",
    status: "Resolved",
  },
  {
    id: 4,
    type: "student",
    title: "David Chen completed lesson",
    description: "Student finished Introduction to React",
    timestamp: "2 days ago",
    status: "Completed",
  },
  {
    id: 5,
    type: "lesson",
    title: "Database Design updated",
    description: "Lesson content was improved and republished",
    timestamp: "3 days ago",
    status: "Updated",
  },
];

// Instructor-specific interfaces and data
export interface StrugglingStudent {
  id: number;
  name: string;
  email: string;
  lastActive: string;
  progress: number;
  strugglingTopics: string[];
  riskLevel: 'High' | 'Medium' | 'Low';
  daysSinceLastSession: number;
}

export interface TopicDifficulty {
  name: string;
  difficulty: 'High' | 'Medium' | 'Low';
  studentsStruggling: number;
  averageTime: string;
  completionRate: number;
}

export interface HotTopic {
  name: string;
  discussionCount: number;
  studentCount: number;
  trend: 'up' | 'down' | 'stable';
  difficulty: 'High' | 'Medium' | 'Low';
  lastActivity: string;
  studentReportedDifficulty?: 'High' | 'Medium' | 'Low' | null;
  difficultyRatings?: {
    High: number;
    Medium: number;
    Low: number;
  };
  studentsRequesting?: Array<{
    userId: string;
    clerkUserId: string | null;
    name: string;
    email: string;
    submittedAt: string;
    difficultyRating: 'High' | 'Medium' | 'Low' | null;
  }>;
}

export interface StudentProgress {
  id: number;
  name: string;
  email: string;
  progress: number;
  previousProgress: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastActive: string;
  streak: number;
  status: 'On Track' | 'Behind' | 'Ahead' | 'Struggling';
  topics: {
    mastered: string[];
    struggling: string[];
    inProgress: string[];
  };
}

// Difficulty Feedback System Interfaces
export interface DifficultyFeedback {
  id: string;
  userId: string;
  cohortId: string;
  selectedTopics: string[];
  customOther?: string;
  topicRatings?: Record<string, DifficultyRating>;
  createdAt: string;
  updatedAt: string;
}

export interface DifficultyInsight {
  topicName: string;
  count: number;
  percentage: number;
  customResponses?: string[]; // For "Other" category
}

export interface AddressedTopic {
  id: string;
  cohortId: string;
  topicName: string;
  addressedBy: string;
  addressedAt: string;
  isActive: boolean;
  notes?: string;
}

export type DifficultyRating = "Low" | "Medium" | "High";

export interface DifficultyFeedbackSubmission {
  selectedTopics: string[];
  customOther?: string;
  topicRatings?: Record<string, DifficultyRating>;
}

export interface MarkTopicAddressedRequest {
  cohortId: string;
  topicName: string;
  notes?: string;
}

// Hardcoded topics for MVP based on current lesson plans
export const DIFFICULTY_TOPICS = [
  "Variables & Data Types",
  "Loops (for, while)",
  "Functions & Parameters",
  "Arrays & Objects",
  "Conditional Logic (if/else)",
  "DOM Manipulation",
  "APIs & Fetch Requests",
  "Asynchronous JavaScript (Promises, async/await)",
  "React Components",
  "State Management",
  "CSS & Styling",
  "Debugging & Error Handling",
] as const;

export type DifficultyTopic = typeof DIFFICULTY_TOPICS[number];

// Cohort-related interfaces
export interface Cohort {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'Upcoming';
  studentCount: number;
  instructor: string;
  curriculum: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CohortStudent extends Student {
  userId: string; // Add actual database user_id for API operations
  cohortId: number;
  enrollmentDate: string;
  graduationDate?: string;
  cohortProgress: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

export const generateSampleStrugglingStudents = (): StrugglingStudent[] => [
  {
    id: 1,
    name: "David Chen",
    email: "david@example.com",
    lastActive: "3 days ago",
    progress: 25,
    strugglingTopics: ["Async/Await", "Promises", "Closures"],
    riskLevel: "High",
    daysSinceLastSession: 5,
  },
  {
    id: 2,
    name: "Emily Davis",
    email: "emily@example.com",
    lastActive: "2 days ago",
    progress: 45,
    strugglingTopics: ["React State", "Props"],
    riskLevel: "Medium",
    daysSinceLastSession: 3,
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    lastActive: "1 week ago",
    progress: 15,
    strugglingTopics: ["JavaScript Fundamentals", "Functions"],
    riskLevel: "High",
    daysSinceLastSession: 7,
  },
];

export const generateSampleTopicDifficulties = (): TopicDifficulty[] => [
  {
    name: "Async/Await",
    difficulty: "High",
    studentsStruggling: 12,
    averageTime: "3.2 hours",
    completionRate: 45,
  },
  {
    name: "Closures",
    difficulty: "High",
    studentsStruggling: 8,
    averageTime: "2.8 hours",
    completionRate: 52,
  },
  {
    name: "React State Management",
    difficulty: "High",
    studentsStruggling: 10,
    averageTime: "2.5 hours",
    completionRate: 48,
  },
  {
    name: "Props and Components",
    difficulty: "Medium",
    studentsStruggling: 5,
    averageTime: "1.8 hours",
    completionRate: 72,
  },
  {
    name: "API Calls",
    difficulty: "Medium",
    studentsStruggling: 6,
    averageTime: "2.1 hours",
    completionRate: 68,
  },
  {
    name: "Event Handling",
    difficulty: "Medium",
    studentsStruggling: 4,
    averageTime: "1.5 hours",
    completionRate: 75,
  },
  {
    name: "Variables and Functions",
    difficulty: "Low",
    studentsStruggling: 2,
    averageTime: "1.2 hours",
    completionRate: 88,
  },
  {
    name: "Basic React Components",
    difficulty: "Low",
    studentsStruggling: 1,
    averageTime: "1.0 hours",
    completionRate: 92,
  },
];

export const generateSampleHotTopics = (): HotTopic[] => [
  {
    name: "Async/Await",
    discussionCount: 45,
    studentCount: 23,
    trend: "up",
    difficulty: "High",
    lastActivity: "2 hours ago",
  },
  {
    name: "React Hooks",
    discussionCount: 38,
    studentCount: 19,
    trend: "up",
    difficulty: "High",
    lastActivity: "4 hours ago",
  },
  {
    name: "JavaScript Closures",
    discussionCount: 32,
    studentCount: 16,
    trend: "stable",
    difficulty: "High",
    lastActivity: "6 hours ago",
  },
  {
    name: "API Integration",
    discussionCount: 28,
    studentCount: 14,
    trend: "up",
    difficulty: "Medium",
    lastActivity: "8 hours ago",
  },
  {
    name: "CSS Grid Layout",
    discussionCount: 22,
    studentCount: 11,
    trend: "down",
    difficulty: "Medium",
    lastActivity: "1 day ago",
  },
];

export const generateSampleStudentProgress = (): StudentProgress[] => [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    progress: 85,
    previousProgress: 78,
    lessonsCompleted: 12,
    totalLessons: 15,
    lastActive: "2 hours ago",
    streak: 7,
    status: "On Track",
    topics: {
      mastered: ["Variables", "Functions", "Basic React"],
      struggling: [],
      inProgress: ["Async/Await", "API Calls"],
    },
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria@example.com",
    progress: 92,
    previousProgress: 89,
    lessonsCompleted: 18,
    totalLessons: 20,
    lastActive: "1 hour ago",
    streak: 12,
    status: "Ahead",
    topics: {
      mastered: ["Variables", "Functions", "React Components", "State Management"],
      struggling: [],
      inProgress: ["Advanced TypeScript"],
    },
  },
  {
    id: 3,
    name: "David Chen",
    email: "david@example.com",
    progress: 25,
    previousProgress: 30,
    lessonsCompleted: 3,
    totalLessons: 15,
    lastActive: "3 days ago",
    streak: 0,
    status: "Struggling",
    topics: {
      mastered: ["Variables"],
      struggling: ["Async/Await", "Promises", "Closures"],
      inProgress: ["Functions"],
    },
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    progress: 78,
    previousProgress: 75,
    lessonsCompleted: 14,
    totalLessons: 18,
    lastActive: "3 hours ago",
    streak: 5,
    status: "On Track",
    topics: {
      mastered: ["Variables", "Functions", "Basic React"],
      struggling: ["State Management"],
      inProgress: ["Props", "Event Handling"],
    },
  },
  {
    id: 5,
    name: "Emily Davis",
    email: "emily@example.com",
    progress: 45,
    previousProgress: 50,
    lessonsCompleted: 6,
    totalLessons: 15,
    lastActive: "2 days ago",
    streak: 2,
    status: "Behind",
    topics: {
      mastered: ["Variables"],
      struggling: ["React State", "Props"],
      inProgress: ["Functions", "Basic React"],
    },
  },
];

// Cohort sample data generators
export const generateSampleCohorts = (): Cohort[] => [
  {
    id: 1,
    name: "Full-Stack Development - Spring 2024",
    description: "Comprehensive full-stack development program covering frontend, backend, and deployment",
    startDate: "2024-01-15",
    endDate: "2024-06-15",
    status: "Active",
    studentCount: 24,
    instructor: "Sarah Johnson",
    curriculum: ["HTML/CSS", "JavaScript", "React", "Node.js", "Database Design", "Deployment"],
    createdAt: "2024-01-01",
    updatedAt: "2024-02-01",
  },
  {
    id: 2,
    name: "Data Science Intensive - Winter 2024",
    description: "Data science and machine learning intensive program",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    status: "Active",
    studentCount: 18,
    instructor: "Dr. Michael Chen",
    curriculum: ["Python", "Pandas", "NumPy", "Machine Learning", "Data Visualization", "Statistics"],
    createdAt: "2024-01-15",
    updatedAt: "2024-02-01",
  },
  {
    id: 3,
    name: "Frontend Development - Fall 2023",
    description: "Modern frontend development with React and TypeScript",
    startDate: "2023-09-01",
    endDate: "2023-12-15",
    status: "Completed",
    studentCount: 32,
    instructor: "Alex Rodriguez",
    curriculum: ["HTML/CSS", "JavaScript", "React", "TypeScript", "Testing", "Deployment"],
    createdAt: "2023-08-15",
    updatedAt: "2023-12-20",
  },
  {
    id: 4,
    name: "Backend Development - Summer 2024",
    description: "Backend development with Node.js, Express, and databases",
    startDate: "2024-06-01",
    endDate: "2024-09-01",
    status: "Upcoming",
    studentCount: 0,
    instructor: "Emily Davis",
    curriculum: ["Node.js", "Express", "MongoDB", "PostgreSQL", "API Design", "Authentication"],
    createdAt: "2024-03-01",
    updatedAt: "2024-03-01",
  },
];

export const generateSampleCohortStudents = (cohortId: number): CohortStudent[] => {
  const baseStudents = generateSampleStudents();
  return baseStudents.map((student) => ({
    ...student,
    userId: `sample_${student.id}`, // Add userId for sample data
    cohortId,
    enrollmentDate: "2024-01-15",
    graduationDate: cohortId === 3 ? "2023-12-15" : undefined,
    cohortProgress: Math.floor(Math.random() * 100),
    assignmentsCompleted: Math.floor(Math.random() * 20),
    totalAssignments: 20,
  }));
};
