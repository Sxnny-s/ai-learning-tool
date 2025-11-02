"use client"
import React, { useState, useEffect } from "react";
import { Cohort, CohortStudent } from "@/types/data";
import {
  fetchCohorts,
  fetchCohortStudents,
  createCohort,
  updateCohort,
  deleteCohort,
  removeStudentFromCohort,
  createStudent,
  updateStudent
} from "@/lib/cohortService";
import { Button } from "../../components/ui/ButtonComponent";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from "../../components/ui/CardComponent";
import { Badge } from "../../components/ui/BadgeComponent";
import { Avatar } from "../../components/ui/AvatarComponent";
import {
  IconUsers,
  IconCalendar,
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconSchool
} from "@tabler/icons-react";
import {
  CreateCohortModal,
  EditCohortModal,
  DeleteCohortModal,
  AddStudentModal,
  EditStudentModal,
  DeleteStudentModal,
  ViewStudentDetailsModal
} from "../../components/admin/modals";


const CohortsPage: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [cohorts, setCohorts] = useState<Cohort[]>([]);
  const [cohortStudents, setCohortStudents] = useState<CohortStudent[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state management (Phase 4)
  const [createCohortModalOpen, setCreateCohortModalOpen] = useState(false);
  const [editCohortModalOpen, setEditCohortModalOpen] = useState(false);
  const [deleteCohortModalOpen, setDeleteCohortModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [editStudentModalOpen, setEditStudentModalOpen] = useState(false);
  const [deleteStudentModalOpen, setDeleteStudentModalOpen] = useState(false);
  const [viewStudentDetailsModalOpen, setViewStudentDetailsModalOpen] =
    useState(false);

  // Form data state
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);
  const [deletingCohort, setDeletingCohort] = useState<Cohort | null>(null);
  const [editingStudent, setEditingStudent] = useState<CohortStudent | null>(
    null
  );
  const [deletingStudent, setDeletingStudent] = useState<CohortStudent | null>(
    null
  );
  const [viewingStudent, setViewingStudent] = useState<CohortStudent | null>(
    null
  );

  // Loading and error states
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  // Load cohorts on component mount
  useEffect(() => {
    const loadCohorts = async () => {
      try {
        setLoading(true);
        const cohortsData = await fetchCohorts();
        setCohorts(cohortsData);
      } catch (error) {
        console.error("Error loading cohorts:", error);
      } finally {
        setLoading(false);
      }
    };
    loadCohorts();
  }, []);

  // TODO: Replace with actual API call when backend route is available
  // Backend ticket: [ticket-number] - Cohort route implementation
  // Expected endpoint: GET /api/admin/cohorts/{cohortId}/students
  const handleCohortSelect = async (cohort: Cohort) => {
    try {
      setSelectedCohort(cohort);
      setLoading(true);
      const students = await fetchCohortStudents(cohort.name);
      console.log("Students data:", students);
      setCohortStudents(students);
    } catch (error) {
      console.error("Error loading cohort students:", error);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations Handlers
  const handleCreateCohort = () => {
    setModalError("");
    setCreateCohortModalOpen(true);
  };

  const handleCreateCohortSubmit = async (cohortData: {
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    instructor: string;
  }) => {
    try {
      setModalLoading(true);
      setModalError("");

      // Create cohort with all provided data - students can be added later
      await createCohort({ 
        name: cohortData.name, 
        studentIds: [],
        startDate: cohortData.startDate,
        endDate: cohortData.endDate,
        isActive: cohortData.isActive,
        instructor: cohortData.instructor
      });

      // Immediately add the new cohort to local state (Option 3 fix)
      const newCohort: Cohort = {
        id: Date.now(), // Generate unique numeric ID
        name: cohortData.name,
        description: `Cohort starting ${cohortData.startDate}`,
        startDate: cohortData.startDate,
        endDate: cohortData.endDate,
        status: cohortData.isActive ? "Active" : "Upcoming",
        studentCount: 0,
        instructor: cohortData.instructor,
        curriculum: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCohorts((prevCohorts) => [...prevCohorts, newCohort]);

      setCreateCohortModalOpen(false);
      // Note: Success feedback will be handled by the modal or toast system
    } catch (error) {
      console.error("Error creating cohort:", error);
      setModalError("Failed to create cohort. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditCohort = (cohortName: string) => {
    const cohort = cohorts.find((c) => c.name === cohortName);
    if (cohort) {
      setEditingCohort(cohort);
      setModalError("");
      setEditCohortModalOpen(true);
    }
  };

  const handleEditCohortSubmit = async (cohortData: {
    name: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    instructor: string;
  }) => {
    if (!editingCohort) return;

    try {
      setModalLoading(true);
      setModalError("");

      // Update all cohort fields via API
      await updateCohort(editingCohort.name, {
        name: cohortData.name,
        startDate: cohortData.startDate,
        endDate: cohortData.endDate,
        isActive: cohortData.isActive,
        instructor: cohortData.instructor
      });
      
      // Refresh cohorts list
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);

      // Update selected cohort if it was the one being edited
      if (selectedCohort?.name === editingCohort.name || selectedCohort?.name === cohortData.name) {
        const updatedCohort = updatedCohorts.find(
          (c) => c.name === cohortData.name
        );
        if (updatedCohort) {
          setSelectedCohort(updatedCohort);
        }
      }

      setEditCohortModalOpen(false);
      setEditingCohort(null);
    } catch (error) {
      console.error("Error updating cohort:", error);
      setModalError("Failed to update cohort. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteCohort = (cohortName: string) => {
    const cohort = cohorts.find((c) => c.name === cohortName);
    if (cohort) {
      setDeletingCohort(cohort);
      setModalError("");
      setDeleteCohortModalOpen(true);
    }
  };

  const handleDeleteCohortConfirm = async () => {
    if (!deletingCohort) return;

    try {
      setModalLoading(true);
      setModalError("");

      await deleteCohort(deletingCohort.name);

      // Refresh cohorts list
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);

      // Clear selected cohort if it was the one being deleted
      if (selectedCohort?.name === deletingCohort.name) {
        setSelectedCohort(null);
        setCohortStudents([]);
      }

      setDeleteCohortModalOpen(false);
      setDeletingCohort(null);
    } catch (error) {
      console.error("Error deleting cohort:", error);
      setModalError("Failed to delete cohort. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddStudent = (cohortName: string) => {
    if (selectedCohort?.name === cohortName) {
      setModalError("");
      setAddStudentModalOpen(true);
    }
  };

  const handleAddStudentSubmit = async (studentData: {
    fullName: string;
    email: string;
  }) => {
    if (!selectedCohort) return;

    try {
      setModalLoading(true);
      setModalError("");

      // Create new student and add to cohort
      await createStudent({
        email: studentData.email,
        fullName: studentData.fullName,
        cohort: selectedCohort.name
      });

      // Refresh students list if this cohort is selected
      const updatedStudents = await fetchCohortStudents(selectedCohort.name);
      setCohortStudents(updatedStudents);

      // Refresh cohorts list to update student count
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);

      setAddStudentModalOpen(false);
    } catch (error) {
      console.error("Error adding student to cohort:", error);
      setModalError(
        "Failed to create and add student to cohort. Please try again."
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditStudent = (studentId: string) => {
    const student = cohortStudents.find((s) => s.userId === studentId);
    if (student) {
      setEditingStudent(student);
      setModalError("");
      setEditStudentModalOpen(true);
    }
  };

  const handleEditStudentSubmit = async (studentData: {
    fullName: string;
    email: string;
  }) => {
    if (!editingStudent) return;

    try {
      setModalLoading(true);
      setModalError("");

      // Update student using the new API
      await updateStudent(editingStudent.userId, {
        fullName: studentData.fullName
      });

      // Refresh students list
      if (selectedCohort) {
        const updatedStudents = await fetchCohortStudents(selectedCohort.name);
        setCohortStudents(updatedStudents);
      }

      setEditStudentModalOpen(false);
      setEditingStudent(null);
    } catch (error) {
      console.error("Error editing student:", error);
      setModalError("Failed to edit student. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteStudent = (cohortName: string, studentId: string) => {
    const student = cohortStudents.find((s) => s.userId === studentId);
    if (student) {
      setDeletingStudent(student);
      setModalError("");
      setDeleteStudentModalOpen(true);
    }
  };

  const handleDeleteStudentConfirm = async () => {
    if (!deletingStudent || !selectedCohort) return;

    try {
      setModalLoading(true);
      setModalError("");

      await removeStudentFromCohort(
        selectedCohort.name,
        deletingStudent.userId
      );

      // Refresh students list
      const updatedStudents = await fetchCohortStudents(selectedCohort.name);
      setCohortStudents(updatedStudents);

      // Refresh cohorts list to update student count
      const updatedCohorts = await fetchCohorts();
      setCohorts(updatedCohorts);

      setDeleteStudentModalOpen(false);
      setDeletingStudent(null);
    } catch (error) {
      console.error("Error removing student from cohort:", error);
      setModalError("Failed to remove student from cohort. Please try again.");
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewStudent = (studentId: string) => {
    const student = cohortStudents.find((s) => s.userId === studentId);
    if (student) {
      setViewingStudent(student);
      setViewStudentDetailsModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      case "Upcoming":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Cohorts Management
          </h2>
          <p className="text-gray-600 mt-1">
            View and manage all student cohorts
          </p>
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
              <CardDescription>
                Select a cohort to view students
              </CardDescription>
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
                          <h3 className="font-semibold text-gray-900">
                            {cohort.name}
                          </h3>
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
                        <p className="text-sm text-gray-600 mb-2">
                          {cohort.description}
                        </p>
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
                  {cohortStudents.length} students enrolled • Instructor:{" "}
                  {selectedCohort.instructor}
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
                      <div
                        key={student.userId}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <Avatar name={student.name} size="sm" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {student.email}
                            </p>
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
                              <p className="text-sm font-medium text-gray-900">
                                {student.cohortProgress}%
                              </p>
                              <p className="text-xs text-gray-500">Progress</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {student.assignmentsCompleted}/
                                {student.totalAssignments}
                              </p>
                              <p className="text-xs text-gray-500">
                                Assignments
                              </p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleViewStudent(student.userId)
                                }
                              >
                                <IconEye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleEditStudent(student.userId)
                                }
                              >
                                <IconEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteStudent(
                                    selectedCohort.name,
                                    student.userId
                                  )
                                }
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
                  <p className="text-lg font-medium">
                    Select a cohort to view students
                  </p>
                  <p className="text-sm">
                    Choose a cohort from the list to see enrolled students
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal Components */}
      <CreateCohortModal
        isOpen={createCohortModalOpen}
        onClose={() => setCreateCohortModalOpen(false)}
        onSubmit={handleCreateCohortSubmit}
        loading={modalLoading}
        error={modalError}
      />

      <EditCohortModal
        isOpen={editCohortModalOpen}
        onClose={() => {
          setEditCohortModalOpen(false);
          setEditingCohort(null);
        }}
        onSubmit={handleEditCohortSubmit}
        currentCohortName={editingCohort?.name || ""}
        currentStartDate={editingCohort?.startDate}
        currentEndDate={editingCohort?.endDate}
        currentIsActive={editingCohort?.status === "Active"}
        currentInstructor={editingCohort?.instructor}
        loading={modalLoading}
        error={modalError}
      />

      <DeleteCohortModal
        isOpen={deleteCohortModalOpen}
        onClose={() => {
          setDeleteCohortModalOpen(false);
          setDeletingCohort(null);
        }}
        onConfirm={handleDeleteCohortConfirm}
        cohortName={deletingCohort?.name || ""}
        studentCount={deletingCohort?.studentCount || 0}
        loading={modalLoading}
      />

      <AddStudentModal
        isOpen={addStudentModalOpen}
        onClose={() => setAddStudentModalOpen(false)}
        onSubmit={handleAddStudentSubmit}
        cohortName={selectedCohort?.name || ""}
        loading={modalLoading}
        error={modalError}
      />

      <EditStudentModal
        isOpen={editStudentModalOpen}
        onClose={() => {
          setEditStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={handleEditStudentSubmit}
        currentStudent={{
          name: editingStudent?.name || "",
          email: editingStudent?.email || ""
        }}
        loading={modalLoading}
        error={modalError}
      />

      <DeleteStudentModal
        isOpen={deleteStudentModalOpen}
        onClose={() => {
          setDeleteStudentModalOpen(false);
          setDeletingStudent(null);
        }}
        onConfirm={handleDeleteStudentConfirm}
        studentName={deletingStudent?.name || ""}
        studentEmail={deletingStudent?.email || ""}
        cohortName={selectedCohort?.name || ""}
        loading={modalLoading}
      />

      <ViewStudentDetailsModal
        isOpen={viewStudentDetailsModalOpen}
        onClose={() => {
          setViewStudentDetailsModalOpen(false);
          setViewingStudent(null);
        }}
        student={viewingStudent}
      />
    </div>
  );
};

export default CohortsPage;
