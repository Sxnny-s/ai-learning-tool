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

interface DeleteCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  cohortName: string;
  studentCount: number;
  loading?: boolean;
}

export const DeleteCohortModal: React.FC<DeleteCohortModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  cohortName,
  studentCount,
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
          <AlertDialogTitle>Delete Cohort &quot;{cohortName}&quot;</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span>
              Are you sure you want to delete this cohort? This action cannot be
              undone.
            </span>
            {studentCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <span className="text-yellow-800 font-medium">
                  ⚠️ Warning: This cohort has {studentCount} student
                  {studentCount !== 1 ? "s" : ""} enrolled.
                </span>
                <span className="text-yellow-700 text-sm mt-1">
                  All students will be removed from this cohort when it&apos;s
                  deleted.
                </span>
              </div>
            )}
            {studentCount === 0 && (
              <span className="text-gray-600">
                This cohort is currently empty and can be safely deleted.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {loading ? "Deleting..." : "Delete Cohort"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
