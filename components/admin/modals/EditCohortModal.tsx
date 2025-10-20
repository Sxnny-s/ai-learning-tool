"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newCohortName: string) => void;
  currentCohortName: string;
  loading?: boolean;
  error?: string;
}

export const EditCohortModal: React.FC<EditCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentCohortName,
  loading = false,
  error
}) => {
  const [cohortName, setCohortName] = useState("");
  const [validationError, setValidationError] = useState("");

  // Update the input when currentCohortName changes
  useEffect(() => {
    setCohortName(currentCohortName);
  }, [currentCohortName]);

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

    // Check if the name actually changed
    if (cohortName.trim() === currentCohortName) {
      setValidationError("Please enter a different name");
      return;
    }

    onSubmit(cohortName.trim());
  };

  const handleClose = () => {
    setCohortName(currentCohortName);
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
            Update the name of the cohort &quot;{currentCohortName}&quot;.
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
              disabled={
                loading ||
                !cohortName.trim() ||
                cohortName.trim() === currentCohortName
              }
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
