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
import { IconUsers, IconBook, IconMessageCircle, IconTrendingUp, IconPlus, IconEye, IconEdit, IconTrash, IconChevronDown } from "@tabler/icons-react"
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
  strugglingStudents: Array<any>;
  topicDifficulties: Array<any>;
  hotTopics: Array<any>;
  recentStudents: Array<any>;
}

const AdminDashboard: React.FC<Props> = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [cohorts, setCohorts] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCohortId, setSelectedCohortId] = useState<string>("")

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        console.log('Admin page: Fetching dashboard data...')
        const response = await fetch('/api/admin/dashboard-stats')
        console.log('Admin page: Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Admin page: API error:', errorData)
          // Don't throw error - just log it and set default data
          console.warn('Dashboard stats unavailable, using default data')
          setData({
            totalStudents: 0,
            activeStudents: 0,
            averageTimeSpent: '0 hours',
            totalSessions: 0,
            completionRate: 0,
            totalConversations: 0,
            strugglingStudents: [],
            topicDifficulties: [],
            hotTopics: [],
            recentStudents: []
          })
        } else {
          const result = await response.json()
          console.log('Admin page: Dashboard data received:', result)
          setData(result)
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        // Don't block the page - use default data
        setData({
          totalStudents: 0,
          activeStudents: 0,
          averageTimeSpent: '0 hours',
          totalSessions: 0,
          completionRate: 0,
          totalConversations: 0,
          strugglingStudents: [],
          topicDifficulties: [],
          hotTopics: [],
          recentStudents: []
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
            const mappedCohorts = cohortsData.map((c: any) => ({ id: c.name, name: c.name }))
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
            {selectedCohortId && (
              <span className="ml-2 text-red-600 font-semibold">
                • Viewing: {cohorts.find(c => c.id === selectedCohortId)?.name || selectedCohortId}
              </span>
            )}
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
            {cohorts.length > 0 ? (
              cohorts.slice(0, 5).map((cohort) => (
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
              ))
            ) : (
              <DropdownMenuItem disabled>
                No cohorts available
              </DropdownMenuItem>
            )}
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
            <CardTitle>Top Topics</CardTitle>
            <CardDescription>Most discussed learning topics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.hotTopics.slice(0, 3).length > 0 ? (
                data.hotTopics.slice(0, 3).map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{topic.name}</p>
                      <p className="text-sm text-gray-500">
                        {topic.studentCount} students • {topic.discussionCount} discussions
                      </p>
                    </div>
                    <Badge variant={topic.difficulty === "High" ? "secondary" : topic.difficulty === "Medium" ? "secondary" : "default"}>
                      {topic.difficulty}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No topic data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
