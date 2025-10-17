"use client"

import React, { useState, useEffect } from "react"
import { Cohort, CohortStudent } from "@/types/data"
import { 
  fetchCohorts, 
  fetchCohortStudents, 
  createCohort, 
  updateCohort, 
  deleteCohort, 
  addStudentToCohort, 
  removeStudentFromCohort 
} from "@/lib/cohortService"
import { Button } from "@/components/ui/ButtonComponent"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/CardComponent"
import { Badge } from "@/components/ui/BadgeComponent"
import { Avatar } from "@/components/ui/AvatarComponent"
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

  // CRUD Operations Handlers
  const handleCreateCohort = async () => {
    try {
      const cohortName = prompt('Enter cohort name:');
      if (!cohortName?.trim()) return;

      const studentIdsInput = prompt('Enter student IDs (comma-separated):');
      if (!studentIdsInput?.trim()) return;

      const studentIds = studentIdsInput.split(',').map(id => id.trim()).filter(id => id);
      
      if (studentIds.length === 0) {
        alert('Please enter at least one student ID');
        return;
      }

      await createCohort({ name: cohortName.trim(), studentIds });
      
      // Refresh cohorts list
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);
      
      alert(`Cohort "${cohortName}" created successfully!`);
    } catch (error) {
      console.error('Error creating cohort:', error);
      alert('Failed to create cohort. Please try again.');
    }
  };

  const handleEditCohort = async (cohortName: string) => {
    try {
      const newName = prompt('Enter new cohort name:', cohortName);
      if (!newName?.trim() || newName.trim() === cohortName) return;

      await updateCohort(cohortName, newName.trim());
      
      // Refresh cohorts list
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);
      
      // Update selected cohort if it was the one being edited
      if (selectedCohort?.name === cohortName) {
        const updatedCohort = updatedCohorts.find(c => c.name === newName.trim());
        if (updatedCohort) {
          setSelectedCohort(updatedCohort);
        }
      }
      
      alert(`Cohort renamed from "${cohortName}" to "${newName}" successfully!`);
    } catch (error) {
      console.error('Error updating cohort:', error);
      alert('Failed to update cohort. Please try again.');
    }
  };

  const handleDeleteCohort = async (cohortName: string) => {
    try {
      const confirmed = confirm(`Delete cohort "${cohortName}"? This will remove all students from this cohort.`);
      if (!confirmed) return;

      await deleteCohort(cohortName);
      
      // Refresh cohorts list
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);
      
      // Clear selected cohort if it was the one being deleted
      if (selectedCohort?.name === cohortName) {
        setSelectedCohort(null);
        setCohortStudents([]);
      }
      
      alert(`Cohort "${cohortName}" deleted successfully!`);
    } catch (error) {
      console.error('Error deleting cohort:', error);
      alert('Failed to delete cohort. Please try again.');
    }
  };

  const handleAddStudent = async (cohortName: string) => {
    try {
      const studentId = prompt('Enter student ID to add to cohort:');
      if (!studentId?.trim()) return;

      await addStudentToCohort(cohortName, studentId.trim());
      
      // Refresh students list if this cohort is selected
      if (selectedCohort?.name === cohortName) {
        const updatedStudents = await fetchCohortStudents(selectedCohort.id);
        setCohortStudents(updatedStudents);
      }
      
      // Refresh cohorts list to update student count
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);
      
      alert(`Student ${studentId} added to cohort "${cohortName}" successfully!`);
    } catch (error) {
      console.error('Error adding student to cohort:', error);
      alert('Failed to add student to cohort. Please try again.');
    }
  };

  const handleEditStudent = async (studentId: string) => {
    try {
      const newName = prompt('Enter new student name:');
      if (!newName?.trim()) return;

      // Note: This would need a PUT /api/users/[userId] route for student updates
      // For now, we'll just show a message
      alert('Student editing functionality requires a separate API endpoint. This feature will be implemented in a future update.');
    } catch (error) {
      console.error('Error editing student:', error);
      alert('Failed to edit student. Please try again.');
    }
  };

  const handleDeleteStudent = async (cohortName: string, studentId: string) => {
    try {
      const confirmed = confirm('Remove student from cohort?');
      if (!confirmed) return;

      await removeStudentFromCohort(cohortName, studentId);
      
      // Refresh students list
      if (selectedCohort) {
        const updatedStudents = await fetchCohortStudents(selectedCohort.id);
        setCohortStudents(updatedStudents);
      }
      
      // Refresh cohorts list to update student count
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);
      
      alert(`Student removed from cohort "${cohortName}" successfully!`);
    } catch (error) {
      console.error('Error removing student from cohort:', error);
      alert('Failed to remove student from cohort. Please try again.');
    }
  };

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
        <Button 
          className="bg-red-600 hover:bg-red-700"
          onClick={handleCreateCohort}
        >
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
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedCohort?.id === cohort.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => handleCohortSelect(cohort)}
                      >
                        <h3 className="font-semibold text-gray-900">{cohort.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(cohort.status)}>
                          {cohort.status}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditCohort(cohort.name)}
                            className="h-6 w-6 p-0"
                          >
                            <IconEdit className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCohort(cohort.name)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <IconTrash className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleCohortSelect(cohort)}
                    >
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
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(selectedCohort.status)}>
                      {selectedCohort.status}
                    </Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddStudent(selectedCohort.name)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <IconPlus className="w-4 h-4 mr-1" />
                      Add Student
                    </Button>
                  </div>
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
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  // View student details - could open a modal or navigate to student page
                                  alert(`View details for ${student.name} (${student.email})`);
                                }}
                              >
                                <IconEye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditStudent(student.id.toString())}
                              >
                                <IconEdit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteStudent(selectedCohort.name, student.id.toString())}
                                className="text-red-600 hover:text-red-700"
                              >
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
