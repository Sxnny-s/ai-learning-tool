"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";

interface CohortFormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  instructor: string;
}

interface EditCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CohortFormData) => void;
  currentCohortName: string;
  currentStartDate?: string;
  currentEndDate?: string;
  currentIsActive?: boolean;
  currentInstructor?: string;
  loading?: boolean;
  error?: string;
}

export const EditCohortModal: React.FC<EditCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentCohortName,
  currentStartDate,
  currentEndDate,
  currentIsActive,
  currentInstructor,
  loading = false,
  error
}) => {
  const [cohortName, setCohortName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(false);
  const [instructor, setInstructor] = useState("");
  const [validationError, setValidationError] = useState("");

  // Update all fields when props change
  useEffect(() => {
    setCohortName(currentCohortName);
    if (currentStartDate) setStartDate(currentStartDate);
    if (currentEndDate) setEndDate(currentEndDate);
    if (currentIsActive !== undefined) setIsActive(currentIsActive);
    if (currentInstructor) setInstructor(currentInstructor);
  }, [currentCohortName, currentStartDate, currentEndDate, currentIsActive, currentInstructor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset validation error
    setValidationError("");

    // Validate cohort name
    if (!cohortName.trim()) {
      setValidationError("Cohort name is required");
      return;
    }

    if (cohortName.trim().length < 2) {
      setValidationError("Cohort name must be at least 2 characters");
      return;
    }

    if (cohortName.trim().length > 50) {
      setValidationError("Cohort name must be less than 50 characters");
      return;
    }

    // Check for special characters (allow letters, numbers, spaces, hyphens, underscores)
    const validNameRegex = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validNameRegex.test(cohortName.trim())) {
      setValidationError(
        "Cohort name can only contain letters, numbers, spaces, hyphens, and underscores"
      );
      return;
    }

    // Validate dates
    if (!startDate) {
      setValidationError("Start date is required");
      return;
    }

    if (!endDate) {
      setValidationError("End date is required");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setValidationError("End date must be after start date");
      return;
    }

    // Pass all form data to onSubmit
    onSubmit({
      name: cohortName.trim(),
      startDate,
      endDate,
      isActive,
      instructor: instructor.trim() || ""
    });
  };

  const handleClose = () => {
    setCohortName(currentCohortName);
    if (currentStartDate) setStartDate(currentStartDate);
    if (currentEndDate) setEndDate(currentEndDate);
    if (currentIsActive !== undefined) setIsActive(currentIsActive);
    if (currentInstructor) setInstructor(currentInstructor);
    setValidationError("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Edit Cohort</DialogTitle>
          <DialogDescription>
            Update the details for the cohort &quot;{currentCohortName}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">

            <Label htmlFor="cohortName">Cohort Name</Label>
            <Input
              id="cohortName"
              type="text"
              placeholder="e.g., 2025-Fall, 2026A, etc."
              value={cohortName}
              onChange={(e) => setCohortName(e.target.value)}
              disabled={loading}
              className={validationError ? "border-red-500" : ""}
              autoFocus
            />

            <Label htmlFor="instructor">Instructor</Label>
            <Input
              id="instructor"
              type="text"
              placeholder="e.g., John Doe"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              disabled={loading}
            />

            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              placeholder="e.g., 2025-01-01"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
              className={validationError ? "border-red-500" : ""}
            />

            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              placeholder="e.g., 2025-01-01"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
              className={validationError ? "border-red-500" : ""}
            />

            <Label htmlFor="isActive">Is Active</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={loading}
            />


            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !cohortName.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Updating..." : "Update Cohort"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
