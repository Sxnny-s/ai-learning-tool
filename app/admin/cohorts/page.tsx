"use client"

import React, { useState, useEffect } from "react"
import { Cohort, CohortStudent } from "@/types/data"
import { fetchCohorts, fetchCohortStudents } from "@/lib/cohortService"
import { Button } from "../components/ui/ButtonComponent"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "../components/ui/CardComponent"
import { Badge } from "../components/ui/BadgeComponent"
import { Avatar } from "../components/ui/AvatarComponent"
import { IconUsers, IconCalendar, IconEye, IconEdit, IconTrash, IconPlus, IconSchool } from "@tabler/icons-react"

const CohortsPage: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [cohortStudents, setCohortStudents] = useState<CohortStudent[]>([])
  const [loading, setLoading] = useState(true)

  // Load cohorts on component mount
  useEffect(() => {
    const loadCohorts = async () => {
      try {
        setLoading(true)
        const cohortsData = await fetchCohorts()
        setCohorts(cohortsData)
      } catch (error) {
        console.error('Error loading cohorts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCohorts()
  }, [])

  // TODO: Replace with actual API call when backend route is available
  // Backend ticket: [ticket-number] - Cohort route implementation
  // Expected endpoint: GET /api/admin/cohorts/{cohortId}/students
  const handleCohortSelect = async (cohort: Cohort) => {
    try {
      setSelectedCohort(cohort)
      setLoading(true)
      const students = await fetchCohortStudents(cohort.id)
      setCohortStudents(students)
    } catch (error) {
      console.error('Error loading cohort students:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Upcoming":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Cohorts Management</h2>
          <p className="text-gray-600 mt-1">View and manage all student cohorts</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <IconPlus className="w-4 h-4 mr-2" />
          Create Cohort
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cohorts List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>All Cohorts</CardTitle>
              <CardDescription>Select a cohort to view students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto mb-2"></div>
                    Loading cohorts...
                  </div>
                ) : (
                  cohorts.map((cohort) => (
                  <div
                    key={cohort.id}
                    onClick={() => handleCohortSelect(cohort)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedCohort?.id === cohort.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                      <Badge className={getStatusColor(cohort.status)}>
                        {cohort.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{cohort.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <IconUsers className="w-4 h-4 mr-1" />
                        {cohort.studentCount} students
                      </div>
                      <div className="flex items-center">
                        <IconCalendar className="w-4 h-4 mr-1" />
                        {cohort.startDate}
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Selected Cohort Students */}
        <div className="lg:col-span-2">
          {selectedCohort ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Students in {selectedCohort.name}</span>
                  <Badge className={getStatusColor(selectedCohort.status)}>
                    {selectedCohort.status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {cohortStudents.length} students enrolled • Instructor: {selectedCohort.instructor}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                      Loading students...
                    </div>
                  ) : cohortStudents.length > 0 ? (
                    cohortStudents.map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar name={student.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span>Enrolled: {student.enrollmentDate}</span>
                              {student.graduationDate && (
                                <span>Graduated: {student.graduationDate}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">{student.cohortProgress}%</p>
                              <p className="text-xs text-gray-500">Progress</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {student.assignmentsCompleted}/{student.totalAssignments}
                              </p>
                              <p className="text-xs text-gray-500">Assignments</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <IconEye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconEdit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <IconTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <IconUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No students enrolled in this cohort</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <IconSchool className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a cohort to view students</p>
                  <p className="text-sm">Choose a cohort from the list to see enrolled students</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default CohortsPage
