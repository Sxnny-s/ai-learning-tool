import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import {
  IconUser,
  IconMail,
  IconCalendar,
  IconTrendingUp,
  IconClock,
  IconTarget,
  IconBook,
  IconCheck
} from "@tabler/icons-react";
import { CohortStudent } from "@/types/data";

interface ViewStudentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: CohortStudent | null;
}

export const ViewStudentDetailsModal: React.FC<
  ViewStudentDetailsModalProps
> = ({ isOpen, onClose, student }) => {
  if (!student) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "Yesterday";
    return formatDate(dateString);
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return "text-green-600";
    if (streak >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="w-5 h-5" />
            Student Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {student.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-blue-600 border-blue-200"
                  >
                    Cohort {student.cohortId}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconMail className="w-4 h-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <IconMail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{student.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <IconCalendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  Joined: {formatDate(student.enrollmentDate)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <IconClock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  Last active: {formatLastActive(student.lastActive)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconTarget className="w-4 h-4" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Course Progress</span>
                      <span className="font-medium">{student.progress}%</span>
                    </div>
                    <Progress value={student.progress} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Cohort Progress</span>
                      <span className="font-medium">
                        {student.cohortProgress}%
                      </span>
                    </div>
                    <Progress value={student.cohortProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconTrendingUp className="w-4 h-4" />
                  Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Current Streak
                    </span>
                    <span
                      className={`font-bold ${getStreakColor(student.streak)}`}
                    >
                      {student.streak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lessons & Assignments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconBook className="w-4 h-4" />
                  Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">
                      {student.lessonsCompleted}/{student.totalLessons}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">
                        {Math.round(
                          (student.lessonsCompleted / student.totalLessons) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (student.lessonsCompleted / student.totalLessons) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconCheck className="w-4 h-4" />
                  Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium">
                      {student.assignmentsCompleted}/{student.totalAssignments}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span className="font-medium">
                        {Math.round(
                          (student.assignmentsCompleted /
                            student.totalAssignments) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (student.assignmentsCompleted /
                          student.totalAssignments) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Student ID:</span>
                  <span className="ml-2 font-mono text-xs">
                    {student.userId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Internal ID:</span>
                  <span className="ml-2 font-mono">{student.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Join Date:</span>
                  <span className="ml-2">{formatDate(student.joinDate)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Enrollment Date:</span>
                  <span className="ml-2">
                    {formatDate(student.enrollmentDate)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
