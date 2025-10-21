"use client";

import React, { useState } from "react";
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

interface CreateCohortModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cohortName: string) => void;
  loading?: boolean;
  error?: string;
}

export const CreateCohortModal: React.FC<CreateCohortModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  error
}) => {
  const [cohortName, setCohortName] = useState("");
  const [validationError, setValidationError] = useState("");

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

    onSubmit(cohortName.trim());
  };

  const handleClose = () => {
    setCohortName("");
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
          <DialogTitle>Create New Cohort</DialogTitle>
          <DialogDescription>
            Enter a name for the new cohort. Students can be added to this
            cohort after creation.
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
              disabled={loading || !cohortName.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Creating..." : "Create Cohort"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
