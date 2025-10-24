"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { AlertCircle, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { DIFFICULTY_TOPICS, DifficultyFeedback } from "@/types/data";
import { useUser } from "@clerk/nextjs";
import { Alert, AlertDescription } from "../ui/alert";

interface Props {
  cohortId?: string;
  className?: string;
}

export const DifficultyFeedbackCard: React.FC<Props> = ({
  cohortId,
  className = "",
}) => {
  const { user } = useUser();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [includeOther, setIncludeOther] = useState(false);
  const [customOther, setCustomOther] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [existingFeedback, setExistingFeedback] =
    useState<DifficultyFeedback | null>(null);

  // Fetch existing feedback on mount
  useEffect(() => {
    const fetchExistingFeedback = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingData(true);
        const response = await fetch("/api/student/difficulty-feedback");

        if (response.ok) {
          const data = await response.json();
          if (data.feedback) {
            setExistingFeedback(data.feedback);
            setSelectedTopics(data.feedback.selectedTopics || []);
            if (data.feedback.customOther) {
              setIncludeOther(true);
              setCustomOther(data.feedback.customOther);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchExistingFeedback();
  }, [user]);

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleOtherToggle = () => {
    setIncludeOther(!includeOther);
    if (includeOther) {
      setCustomOther("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (selectedTopics.length === 0 && !customOther.trim()) {
      setMessage({
        type: "error",
        text: "Please select at least one topic or provide custom feedback.",
      });
      return;
    }

    if (customOther.length > 200) {
      setMessage({
        type: "error",
        text: "Custom feedback must be 200 characters or less.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/student/difficulty-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedTopics,
          customOther: customOther.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setExistingFeedback(data.feedback);
        setMessage({
          type: "success",
          text: existingFeedback
            ? "Your feedback has been updated successfully!"
            : "Your feedback has been submitted successfully!",
        });
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Failed to submit feedback. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove all your difficulty feedback?")) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/student/difficulty-feedback", {
        method: "DELETE",
      });

      if (response.ok) {
        setExistingFeedback(null);
        setSelectedTopics([]);
        setCustomOther("");
        setIncludeOther(false);
        setMessage({
          type: "success",
          text: "Your feedback has been removed successfully!",
        });
        
        // Auto-dismiss success message after 5 seconds
        setTimeout(() => setMessage(null), 5000);
      } else {
        const errorData = await response.json();
        setMessage({
          type: "error",
          text: errorData.error || "Failed to remove feedback. Please try again.",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Learning Difficulties</CardTitle>
          <CardDescription>Loading your feedback...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Learning Difficulties
            </CardTitle>
            <CardDescription>
              Let us know which topics you're struggling with so we can provide
              better support
            </CardDescription>
          </div>
          {existingFeedback && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Predefined Topics */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Topics I'm Having Trouble With:
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DIFFICULTY_TOPICS.map((topic) => (
                <div key={topic} className="flex items-start space-x-2">
                  <Checkbox
                    id={`topic-${topic}`}
                    checked={selectedTopics.includes(topic)}
                    onCheckedChange={() => handleTopicToggle(topic)}
                    disabled={isLoading}
                  />
                  <label
                    htmlFor={`topic-${topic}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {topic}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Other Option */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="other-toggle"
                checked={includeOther}
                onCheckedChange={handleOtherToggle}
                disabled={isLoading}
              />
              <label
                htmlFor="other-toggle"
                className="text-sm font-medium cursor-pointer"
              >
                Other (Please specify)
              </label>
            </div>

            {includeOther && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe specific areas you need help with... (max 200 characters)"
                  value={customOther}
                  onChange={(e) => setCustomOther(e.target.value)}
                  disabled={isLoading}
                  maxLength={200}
                  className="resize-none"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {customOther.length} / 200 characters
                </p>
              </div>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
              className={
                message.type === "success"
                  ? "bg-green-50 text-green-900 border-green-200"
                  : ""
              }
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : existingFeedback ? (
                "Update Feedback"
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>

        {existingFeedback && (
          <p className="text-xs text-muted-foreground mt-4">
            Last updated:{" "}
            {new Date(existingFeedback.updatedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

