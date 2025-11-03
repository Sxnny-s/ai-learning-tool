"use client"
import React, { useEffect, useState } from "react"
import { Button } from "../components/ui/ButtonComponent"
import { StatsCard } from "../components/ui/StatsCard"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/CardComponent"
import { Badge } from "../components/ui/BadgeComponent"
import { Avatar } from "../components/ui/AvatarComponent"
import { CohortOverview } from "../components/instructor/CohortOverview"
import { TopicDifficultyAnalysis } from "../components/instructor/TopicDifficultyAnalysis"
import { StudentDifficultyInsights } from "../components/admin/StudentDifficultyInsights"
import { HotTopics } from "../components/instructor/HotTopics"
import { IconUsers, IconMessageCircle, IconTrendingUp, IconPlus } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"

interface Props {
  className?: string;
}

interface DashboardData {
  totalStudents: number;
  activeStudents: number;
  averageTimeSpent: string;
  totalSessions: number;
  completionRate: number;
  totalConversations: number;
  strugglingStudents: Array<{
    id: string;
    name: string;
    email: string;
    lastActive: string;
    progress: number;
    strugglingTopics: string[];
    riskLevel: 'High' | 'Medium' | 'Low';
    daysSinceLastSession: number;
  }>;
  topicDifficulties: Array<{
    name: string;
    difficulty: 'High' | 'Medium' | 'Low';
    studentsStruggling: number;
    averageTime: string;
    completionRate: number;
  }>;
  hotTopics: Array<{
    name: string;
    discussionCount: number;
    studentCount: number;
    trend: 'up' | 'down' | 'stable';
    difficulty: 'High' | 'Medium' | 'Low';
    lastActivity: string;
    strugglingCount?: number;
    isAddressed?: boolean;
    addressedAt?: string;
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
  }>;
  recentStudents: Array<{
    name: string;
    email: string;
    joined: string;
    status: string;
  }>;
}

const AdminDashboard: React.FC<Props> = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCohortId, setSelectedCohortId] = useState<string>("")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        console.log('Admin page: Fetching dashboard data for cohort:', selectedCohortId || 'all')
        
        // Build URL with optional cohort filter
        const url = selectedCohortId 
          ? `/api/admin/dashboard-stats?cohortId=${encodeURIComponent(selectedCohortId)}`
          : '/api/admin/dashboard-stats'
        
        const response = await fetch(url)
        console.log('Admin page: Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Admin page: API error:', errorData)
          
          // Handle authorization errors specifically
          if (response.status === 403) {
            throw new Error('Access Denied: Admin access required. Please contact your administrator.')
          } else if (response.status === 401) {
            throw new Error('Authentication required. Please sign in again.')
          } else {
            throw new Error(errorData.error || `Failed to load dashboard (${response.status})`)
          }
        }
        
        const result = await response.json()
        console.log('Admin page: Dashboard data received:', result)
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedCohortId])

  // Fetch cohorts for the difficulty insights component
  useEffect(() => {
    async function fetchCohorts() {
      try {
        console.log('Admin page: Fetching cohorts...')
        const response = await fetch('/api/admin/cohorts')
        console.log('Admin page: Cohorts response status:', response.status)
        
        if (response.ok) {
          const result = await response.json()
          console.log('Admin page: Cohorts data:', result)
          
          // The API returns data in result.data
          const cohortsData = result.data ||  []
          
          if (cohortsData && cohortsData.length > 0) {
            const mappedCohorts = cohortsData.map((c: { name: string }) => ({ id: c.name, name: c.name }))
            console.log('Admin page: Mapped cohorts:', mappedCohorts)
            setCohorts(mappedCohorts)
            
            // Set the most recent cohort as default
            const defaultCohort = cohortsData[0].name
            console.log('Admin page: Setting default cohort:', defaultCohort)
            setSelectedCohortId(defaultCohort)
          } else {
            console.log('Admin page: No cohorts found in response')
          }
        } else {
          console.error('Admin page: Failed to fetch cohorts, status:', response.status)
        }
      } catch (err) {
        console.error('Admin page: Error fetching cohorts:', err)
      }
    }
    fetchCohorts()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto mt-12">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700 font-medium mb-4">{error}</p>
          <p className="text-red-600 text-sm mb-6">
            This page is restricted to administrators only. If you believe you should have access, please contact your system administrator.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-1">
            Monitor your AI learning platform performance
            <span className="ml-2 text-red-600 font-semibold">
              • {selectedCohortId 
                  ? `Viewing: ${cohorts.find(c => c.id === selectedCohortId)?.name || selectedCohortId}`
                  : 'Viewing: All Cohorts'}
            </span>
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <IconPlus className="w-4 h-4 mr-2" />
              Quick Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Select Cohort</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                console.log('All cohorts selected');
                setSelectedCohortId('');
              }}
              className={!selectedCohortId ? "bg-red-50 text-red-600 font-semibold" : ""}
            >
              {!selectedCohortId && "✓ "}
              All Cohorts
            </DropdownMenuItem>
            {cohorts.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                {cohorts.slice(0, 5).map((cohort) => (
                  <DropdownMenuItem
                    key={cohort.id}
                    onClick={() => {
                      console.log('Cohort selected:', cohort.id);
                      setSelectedCohortId(cohort.id);
                    }}
                    className={selectedCohortId === cohort.id ? "bg-red-50 text-red-600 font-semibold" : ""}
                  >
                    {selectedCohortId === cohort.id && "✓ "}
                    {cohort.name}
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-gray-500">
              Other Actions
            </DropdownMenuLabel>
            <DropdownMenuItem>
              <IconPlus className="w-4 h-4 mr-2" />
              Create New Cohort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={data.totalStudents.toLocaleString()}
          icon={<IconUsers className="w-6 h-6" />}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Active Students"
          value={data.activeStudents.toLocaleString()}
          icon={<IconUsers className="w-6 h-6" />}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Conversations"
          value={data.totalConversations.toLocaleString()}
          icon={<IconMessageCircle className="w-6 h-6" />}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Completion Rate"
          value={`${data.completionRate}%`}
          icon={<IconTrendingUp className="w-6 h-6" />}
          iconColor="text-red-600"
        />
      </div>

      {/* Instructor-Specific Components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CohortOverview
          cohortName={selectedCohortId}
          key={`cohort-overview-${selectedCohortId}`}
        />
        
        <StudentDifficultyInsights
          cohorts={[]}
          defaultCohortId={selectedCohortId}
          key={`difficulty-insights-${selectedCohortId}`}
        />
      </div>

      {/* Topic Analysis and Hot Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicDifficultyAnalysis topics={data.topicDifficulties} />
        <HotTopics topics={data.hotTopics} />
      </div>


      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>Latest student registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentStudents.length > 0 ? (
                data.recentStudents.map((student, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{student.joined}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent students</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Requested Help Topics</CardTitle>
            <CardDescription>Topics students are requesting help with via difficulty feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.hotTopics.slice(0, 3).length > 0 ? (
                data.hotTopics.slice(0, 3).map((topic, index) => (
                  <div key={index} className={`flex items-start justify-between p-3 rounded-lg border-2 ${
                    topic.isAddressed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{topic.name}</p>
                        {topic.isAddressed && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">
                            ✓ Addressed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="text-red-600 font-semibold">
                          {topic.strugglingCount} {topic.strugglingCount === 1 ? 'student' : 'students'} requesting help
                        </span>
                      </p>
                      {topic.isAddressed && topic.addressedAt && (
                        <p className="text-xs text-green-700 mt-1">
                          Addressed {new Date(topic.addressedAt).toLocaleDateString()}
                        </p>
                      )}
                      {!topic.isAddressed && (
                        <p className="text-xs text-red-600 mt-1 font-medium">
                          ⚠️ Needs attention
                        </p>
                      )}
                    </div>
                    <Badge variant={topic.difficulty === "High" ? "secondary" : topic.difficulty === "Medium" ? "secondary" : "default"}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No student difficulty feedback yet</p>
                  <p className="text-gray-400 text-xs mt-1">Students can submit feedback via the difficulty form</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
