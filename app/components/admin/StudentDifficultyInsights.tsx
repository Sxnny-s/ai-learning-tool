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
import { Badge } from "../ui/badge";
import {
  ChartContainer,
  ChartTooltip,
} from "../ui/chart";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { DifficultyInsight } from "@/types/data";

interface Props {
  className?: string;
  defaultCohortId?: string;
  cohorts?: Array<{ id: string; name: string }>;
}

interface ChartDataItem extends DifficultyInsight {
  fill: string;
  [key: string]: string | number | string[] | undefined;
}

const CHART_COLORS = [
  "hsl(0, 85%, 60%)",    // Red/Coral
  "hsl(210, 85%, 55%)",  // Blue
  "hsl(150, 70%, 45%)",  // Green
  "hsl(280, 75%, 60%)",  // Purple
  "hsl(35, 90%, 55%)",   // Orange
  "hsl(190, 80%, 50%)",  // Cyan
  "hsl(330, 85%, 60%)",  // Pink/Magenta
  "hsl(60, 80%, 55%)",   // Yellow
  "hsl(260, 70%, 60%)",  // Indigo
  "hsl(20, 85%, 55%)",   // Burnt Orange
  "hsl(170, 70%, 45%)",  // Teal
  "hsl(300, 65%, 55%)",  // Violet
];

export const StudentDifficultyInsights: React.FC<Props> = ({
  className = "",
  defaultCohortId,
}) => {
  const [selectedCohortId, setSelectedCohortId] = useState<string>(
    defaultCohortId || ""
  );
  const [insights, setInsights] = useState<DifficultyInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showAddressed, setShowAddressed] = useState(false);
  const [addressedTopics, setAddressedTopics] = useState<string[]>([]);
  const [markingTopic, setMarkingTopic] = useState<string | null>(null);

  // Sync with defaultCohortId prop changes
  useEffect(() => {
    if (defaultCohortId && defaultCohortId !== selectedCohortId) {
      console.log("Syncing selectedCohortId with defaultCohortId:", defaultCohortId);
      setSelectedCohortId(defaultCohortId);
    }
  }, [defaultCohortId, selectedCohortId]);

  const fetchInsights = React.useCallback(async () => {
    setIsLoading(true);

    console.log("Fetching insights for cohort:", selectedCohortId);

    try {
      const response = await fetch(
        `/api/admin/difficulty-insights?cohortId=${selectedCohortId}`
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Insights response:", data);
        setInsights(data.insights || []);
        setLastUpdated(data.lastUpdated || null);
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch insights:", errorData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCohortId]);

  const fetchAddressedTopics = React.useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/difficulty-insights/addressed?cohortId=${selectedCohortId}`
      );

      if (response.ok) {
        const data = await response.json();
        setAddressedTopics(
          data.addressedTopics?.map((t: { topicName: string }) => t.topicName) || []
        );
      }
    } catch (err) {
      console.error("Error fetching addressed topics:", err);
    }
  }, [selectedCohortId]);

  // Fetch insights when cohort changes
  useEffect(() => {
    if (!selectedCohortId) {
      setIsLoading(false);
      return;
    }

    fetchInsights();
    fetchAddressedTopics();
  }, [selectedCohortId, fetchInsights, fetchAddressedTopics]);

  const handleMarkAsAddressed = async (topicName: string) => {
    if (
      !confirm(
        `Mark "${topicName}" as addressed? This will remove it from the chart.`
      )
    ) {
      return;
    }

    setMarkingTopic(topicName);

    try {
      const response = await fetch(
        "/api/admin/difficulty-insights/mark-addressed",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cohortId: selectedCohortId,
            topicName,
          }),
        }
      );

      if (response.ok) {
        // Refresh insights and addressed topics
        await Promise.all([fetchInsights(), fetchAddressedTopics()]);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to mark topic as addressed");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setMarkingTopic(null);
    }
  };

  const handleUnmarkAsAddressed = async (topicName: string) => {
    if (
      !confirm(
        `Unmark "${topicName}" as addressed? This will show it in the chart again if students report it.`
      )
    ) {
      return;
    }

    setMarkingTopic(topicName);

    try {
      const response = await fetch(
        "/api/admin/difficulty-insights/mark-addressed",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cohortId: selectedCohortId,
            topicName,
            unmark: true,
          }),
        }
      );

      if (response.ok) {
        await Promise.all([fetchInsights(), fetchAddressedTopics()]);
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to unmark topic");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setMarkingTopic(null);
    }
  };

  // Filter out addressed topics unless showAddressed is true
  const displayedInsights = showAddressed
    ? insights
    : insights.filter((insight) => !addressedTopics.includes(insight.topicName));

  // Prepare chart data
  const chartData: ChartDataItem[] = displayedInsights.map((insight, index) => ({
    ...insight,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const totalResponses = displayedInsights.reduce(
    (sum, insight) => sum + insight.count,
    0
  );

  // Render loading state
  if (isLoading && !insights.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Student Difficulty Insights
          </CardTitle>
          <CardDescription>Loading difficulty data...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!selectedCohortId || displayedInsights.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Student Difficulty Insights
            </CardTitle>
            <CardDescription>
              View aggregated feedback from students
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-lg font-medium text-gray-900">
              No difficulty feedback submitted yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {selectedCohortId
                ? "Students haven't submitted feedback for this cohort yet."
                : "Select a cohort to view student difficulty insights."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Student Difficulty Insights
              <Badge variant="secondary">{totalResponses} responses</Badge>
            </CardTitle>
            <CardDescription>
              Topics students are struggling with
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  • Last updated:{" "}
                  {new Date(lastUpdated).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pie Chart */}
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <ChartContainer
              config={chartData.reduce(
                (acc, item, index) => ({
                  ...acc,
                  [`topic${index}`]: {
                    label: item.topicName,
                    color: item.fill,
                  },
                }),
                {}
              )}
              className="h-[300px] w-full"
            >
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) =>
                      `${(entry as unknown as ChartDataItem).topicName} (${(entry as unknown as ChartDataItem).percentage.toFixed(1)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as ChartDataItem;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="font-semibold">{data.topicName}</div>
                            <div className="text-sm text-muted-foreground">
                              {data.count} student{data.count !== 1 ? "s" : ""} (
                              {data.percentage.toFixed(1)}%)
                            </div>
                            {data.customResponses && data.customResponses.length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <div className="text-xs font-medium mb-1">
                                  Custom Responses:
                                </div>
                                <ul className="text-xs space-y-1">
                                  {data.customResponses.slice(0, 3).map((response, i) => (
                                    <li key={i} className="truncate max-w-[200px]">
                                      • {response}
                                    </li>
                                  ))}
                                  {data.customResponses.length > 3 && (
                                    <li className="text-muted-foreground italic">
                                      +{data.customResponses.length - 3} more...
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Topic List with Actions */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">Topics ({displayedInsights.length})</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddressed(!showAddressed)}
                className="text-xs"
              >
                {showAddressed ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Hide Addressed
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Show Addressed
                  </>
                )}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayedInsights.map((insight, index) => {
                  const isAddressed = addressedTopics.includes(insight.topicName);
                  const color = CHART_COLORS[index % CHART_COLORS.length];
                  return (
                    <div
                      key={insight.topicName}
                      className={`p-3 rounded-lg border ${
                        isAddressed ? "bg-green-50 border-green-200" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: color }}
                            />
                            <p className="text-sm font-medium truncate">
                              {insight.topicName}
                            </p>
                            {isAddressed && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 ml-5">
                            {insight.count} student{insight.count !== 1 ? "s" : ""} •{" "}
                            {insight.percentage.toFixed(1)}%
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            isAddressed
                              ? handleUnmarkAsAddressed(insight.topicName)
                              : handleMarkAsAddressed(insight.topicName)
                          }
                          disabled={markingTopic === insight.topicName}
                          className="text-xs h-7 px-2"
                        >
                          {markingTopic === insight.topicName ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : isAddressed ? (
                            "Unmark"
                          ) : (
                            "Mark Done"
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {displayedInsights.length}
              </p>
              <p className="text-xs text-muted-foreground">Active Topics</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{totalResponses}</p>
              <p className="text-xs text-muted-foreground">Total Responses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {addressedTopics.length}
              </p>
              <p className="text-xs text-muted-foreground">Addressed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {insights.find((i) => i.topicName === "Other/Custom")?.count || 0}
              </p>
              <p className="text-xs text-muted-foreground">Custom Requests</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

