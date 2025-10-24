"use client"
import React, { useState, useEffect } from "react"
import { Button } from "../../components/ui/ButtonComponent"
import { Input } from "../../components/ui/InputComponent"
import { StatsCard } from "../../components/ui/StatsCard"
import { StudentCard } from "../../components/admin/StudentCard"
import { StudentTable } from "../../components/admin/StudentTable"
import { Student, generateSampleStudentProgress } from "@/types/data"
import { StudentProgressTracker } from "../../components/instructor/StudentProgressTracker"
import { IconSearch, IconUsers, IconBook, IconTrendingUp, IconClock } from "@tabler/icons-react"

interface Props {
  className?: string;
}

interface StudentsResponse {
  students: Student[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    pending: number;
    averageProgress: number;
    completionRate: number;
  };
}

const StudentsPage: React.FC<Props> = () => {
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [searchTerm, setSearchTerm] = useState("")
  const [students, setStudents] = useState<Student[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    averageProgress: 0,
    completionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const studentProgress = generateSampleStudentProgress()

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        console.log('Fetching students from API...')
        const response = await fetch('/api/admin/students', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Prevent caching
        })
        
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API error:', errorData)
          throw new Error(errorData.error || `Failed to fetch students (${response.status})`)
        }
        
        const data: StudentsResponse = await response.json()
        console.log('Fetched students:', data)
        setStudents(data.students)
        setStats(data.stats)
        setError(null)
      } catch (err) {
        console.error('Error fetching students:', err)
        setError(err instanceof Error ? err.message : 'Failed to load students. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleStudentView = (student: Student) => {
    console.log('View student:', student);
  };

  const handleStudentEdit = (student: Student) => {
    console.log('Edit student:', student);
  };

  const handleStudentDelete = (student: Student) => {
    console.log('Delete student:', student);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Students</h2>
          <p className="text-gray-600 mt-1">Manage and monitor student progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button 
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className={viewMode === "cards" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-200"}
            >
              Cards
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={viewMode === "table" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-200"}
            >
              Table
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <IconSearch className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Students"
          value={stats.total.toString()}
          icon={<IconUsers className="w-6 h-6" />}
          iconColor="text-red-600"
        />
        <StatsCard
          title="Active Students"
          value={stats.active.toString()}
          icon={<IconTrendingUp className="w-6 h-6" />}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Avg. Progress"
          value={`${stats.averageProgress}%`}
          icon={<IconBook className="w-6 h-6" />}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={<IconClock className="w-6 h-6" />}
          iconColor="text-purple-600"
        />
      </div>

      {/* Students Display */}
      {filteredStudents.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <IconUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-600">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "No students have been added to the system yet"}
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onView={handleStudentView}
              onEdit={handleStudentEdit}
              onMore={handleStudentDelete}
            />
          ))}
        </div>
      ) : (
        <StudentTable
          students={filteredStudents}
          onView={handleStudentView}
          onEdit={handleStudentEdit}
          onDelete={handleStudentDelete}
        />
      )}

      {/* Student Progress Tracker */}
      <StudentProgressTracker
        students={studentProgress}
        onViewStudent={(student) => console.log('View student:', student.name)}
      />
    </div>
  );
};

export default StudentsPage;

