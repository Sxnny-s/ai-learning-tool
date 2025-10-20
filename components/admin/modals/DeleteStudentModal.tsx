"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface DeleteStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  studentName: string;
  studentEmail: string;
  cohortName: string;
  loading?: boolean;
}

export const DeleteStudentModal: React.FC<DeleteStudentModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  studentName,
  studentEmail,
  cohortName,
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent onKeyDown={handleKeyDown}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Student from Cohort</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <span>
              Are you sure you want to remove this student from the &quot;
              {cohortName}&quot; cohort?
            </span>

            <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p className="font-medium text-gray-900">{studentName}</p>
              <p className="text-sm text-gray-600">{studentEmail}</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <p className="text-yellow-800 font-medium">
                ⚠️ Note: This will only remove the student from this cohort.
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                The student account will remain active and can be added to other
                cohorts.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Removing..." : "Remove from Cohort"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
