import React from "react";
import { CohortOverview } from "../../../app/components/instructor/CohortOverview";

describe("CohortOverview Component", () => {
  // Mock cohort stats data for testing
  const mockCohortStats = {
    cohortName: "2025A",
    totalStudents: 25,
    activeStudents: 20,
    averageTimeSpent: "45 min",
    totalSessions: 120,
    completionRate: 78,
    strugglingStudents: 3,
    hotTopics: ["React Hooks", "JavaScript Closures", "API Integration"],
  };

  const mockEmptyCohortStats = {
    cohortName: "2025A",
    totalStudents: 0,
    activeStudents: 0,
    averageTimeSpent: "0 hours",
    totalSessions: 0,
    completionRate: 0,
    strugglingStudents: 0,
    hotTopics: [],
  };

  // Helper to mock successful API response
  const mockSuccessfulApiResponse = (data = mockCohortStats) => {
    cy.intercept("GET", "/api/admin/cohorts/*/stats", {
      statusCode: 200,
      body: {
        success: true,
        data: data,
      },
    }).as("getCohortStats");
  };

  // Helper to mock failed API response
  const mockFailedApiResponse = () => {
    cy.intercept("GET", "/api/admin/cohorts/*/stats", {
      statusCode: 500,
      body: {
        error: "Internal server error",
      },
    }).as("getCohortStatsFailed");
  };

  // 1. Fundamental Structure
  describe("Component Structure", () => {
    it("should render as a card", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.get("div").should("exist").should("be.visible");
    });

    it("should display cohort overview title", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("Cohort Overview").should("exist");
    });

    it("should display cohort name in title", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("(2025A)").should("exist");
    });

    it("should accept custom className", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" className="custom-class" />);
      cy.wait("@getCohortStats");

      cy.get("div").should("exist");
    });
  });

  // 2. Loading State
  describe("Loading State", () => {
    it("should display loading spinner while fetching data", () => {
      cy.intercept("GET", "/api/admin/cohorts/*/stats", (req) => {
        // Delay the response to test loading state
        req.reply((res) => {
          res.delay = 1000;
          res.send({
            statusCode: 200,
            body: {
              success: true,
              data: mockCohortStats,
            },
          });
        });
      }).as("getCohortStatsDelayed");

      cy.mount(<CohortOverview cohortName="2025A" />);

      // Should show loading spinner
      cy.get(".animate-spin").should("exist");
    });
  });

  // 3. No Cohort Selected State
  describe("No Cohort Selected", () => {
    it("should display message when no cohort is selected", () => {
      cy.mount(<CohortOverview />);

      cy.contains("Select a cohort to view statistics").should("exist");
    });

    it("should not make API call when no cohort is selected", () => {
      cy.intercept("GET", "/api/admin/cohorts/*/stats").as("getCohortStats");
      cy.mount(<CohortOverview />);

      cy.get("@getCohortStats.all").should("have.length", 0);
    });
  });

  // 4. Error State
  describe("Error State", () => {
    it("should display error message when API fails", () => {
      mockFailedApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStatsFailed");

      cy.contains("Error loading cohort data").should("exist");
    });
  });

  // 5. Student Metrics Display
  describe("Student Metrics", () => {
    beforeEach(() => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");
    });

    it("should display total students", () => {
      cy.contains("25").should("exist");
      cy.contains("Students").should("exist");
    });

    it("should display active students count and percentage", () => {
      cy.contains("20 active (80%)").should("exist");
    });
  });

  // 6. Time and Session Metrics
  describe("Time and Session Metrics", () => {
    beforeEach(() => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");
    });

    it("should display average time spent", () => {
      cy.contains("45 min").should("exist");
      cy.contains("Avg Time").should("exist");
      cy.contains("per session").should("exist");
    });

    it("should display total sessions", () => {
      cy.contains("120").should("exist");
      cy.contains("Sessions").should("exist");
      cy.contains("this week").should("exist");
    });

    it("should display completion rate", () => {
      cy.contains("78%").should("exist");
      cy.contains("Completion").should("exist");
      cy.contains("overall progress").should("exist");
    });
  });

  // 7. Struggling Students Alert
  describe("Struggling Students Alert", () => {
    it("should display struggling students alert when count > 0", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("3 students need attention").should("exist");
    });

    it("should not display alert when no struggling students", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        strugglingStudents: 0,
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("students need attention").should("not.exist");
    });

    it("should handle different struggling student counts", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        strugglingStudents: 10,
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("10 students need attention").should("exist");
    });
  });

  // 8. Hot Topics Display
  describe("Hot Topics", () => {
    it("should display hot topics when available", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("🔥 Hot Topics").should("exist");
      cy.contains("React Hooks").should("exist");
      cy.contains("JavaScript Closures").should("exist");
      cy.contains("API Integration").should("exist");
    });

    it("should not display hot topics section when empty", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        hotTopics: [],
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("🔥 Hot Topics").should("not.exist");
    });

    it("should limit hot topics to first 3", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        hotTopics: [
          "React Hooks",
          "JavaScript Closures",
          "API Integration",
          "CSS Grid",
          "TypeScript",
          "Node.js",
        ],
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("React Hooks").should("exist");
      cy.contains("JavaScript Closures").should("exist");
      cy.contains("API Integration").should("exist");
      cy.contains("CSS Grid").should("not.exist");
      cy.contains("TypeScript").should("not.exist");
    });
  });

  // 9. Edge Cases
  describe("Edge Cases", () => {
    it("should handle zero values", () => {
      mockSuccessfulApiResponse(mockEmptyCohortStats);
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("0").should("exist");
      cy.contains("0 active (0%)").should("exist");
      cy.contains("students need attention").should("not.exist");
      cy.contains("🔥 Hot Topics").should("not.exist");
    });

    it("should handle 100% completion rate", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        completionRate: 100,
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("100%").should("exist");
    });

    it("should handle all students active", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        totalStudents: 20,
        activeStudents: 20,
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("20 active (100%)").should("exist");
    });

    it("should handle large numbers", () => {
      mockSuccessfulApiResponse({
        cohortName: "2025A",
        totalStudents: 1000,
        activeStudents: 850,
        averageTimeSpent: "120 min",
        totalSessions: 5000,
        completionRate: 95,
        strugglingStudents: 50,
        hotTopics: ["Advanced React", "System Design"],
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      cy.contains("1000").should("exist");
      cy.contains("850 active (85%)").should("exist");
      cy.contains("120 min").should("exist");
      cy.contains("5000").should("exist");
      cy.contains("95%").should("exist");
      cy.contains("50 students need attention").should("exist");
    });
  });

  // 10. Cohort Switching
  describe("Cohort Switching", () => {
    it("should fetch data for different cohorts", () => {
      // First cohort
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");
      cy.contains("(2025A)").should("exist");
      cy.contains("25").should("exist");

      // Second cohort
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        cohortName: "2025B",
        totalStudents: 30,
      });
      cy.mount(<CohortOverview cohortName="2025B" />);
      cy.wait("@getCohortStats");
      cy.contains("(2025B)").should("exist");
      cy.contains("30").should("exist");
    });
  });

  // 11. Integration Testing
  describe("Full Integration", () => {
    it("should display all data correctly together", () => {
      mockSuccessfulApiResponse();
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      // Verify title
      cy.contains("Cohort Overview").should("exist");
      cy.contains("(2025A)").should("exist");

      // Verify student metrics
      cy.contains("25").should("exist");
      cy.contains("20 active (80%)").should("exist");

      // Verify time and session metrics
      cy.contains("45 min").should("exist");
      cy.contains("120").should("exist");
      cy.contains("78%").should("exist");

      // Verify struggling students alert
      cy.contains("3 students need attention").should("exist");

      // Verify hot topics
      cy.contains("🔥 Hot Topics").should("exist");
      cy.contains("React Hooks").should("exist");
      cy.contains("JavaScript Closures").should("exist");
      cy.contains("API Integration").should("exist");
    });

    it("should handle minimal data display", () => {
      mockSuccessfulApiResponse({
        ...mockCohortStats,
        strugglingStudents: 0,
        hotTopics: [],
      });
      cy.mount(<CohortOverview cohortName="2025A" />);
      cy.wait("@getCohortStats");

      // Should still show core metrics
      cy.contains("Cohort Overview").should("exist");
      cy.contains("25").should("exist");
      cy.contains("20 active (80%)").should("exist");
      cy.contains("45 min").should("exist");
      cy.contains("120").should("exist");
      cy.contains("78%").should("exist");

      // Should not show optional sections
      cy.contains("students need attention").should("not.exist");
      cy.contains("🔥 Hot Topics").should("not.exist");
    });
  });
});
