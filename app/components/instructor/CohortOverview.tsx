import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/CardComponent';
import { IconUsers, IconClock, IconTrendingUp, IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  cohortName?: string;
  className?: string;
}

interface CohortStats {
  cohortName: string;
  totalStudents: number;
  activeStudents: number;
  averageTimeSpent: string;
  totalSessions: number;
  completionRate: number;
  strugglingStudents: number;
  hotTopics: string[];
}

export const CohortOverview: React.FC<Props> = (props) => {
  const { cohortName, className = "" } = props;
  
  const [stats, setStats] = useState<CohortStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cohortName) {
      setStats(null);
      return;
    }

    async function fetchCohortStats() {
      if (!cohortName) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`CohortOverview: Fetching stats for cohort ${cohortName}`);
        const response = await fetch(`/api/admin/cohorts/${encodeURIComponent(cohortName)}/stats`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cohort statistics');
        }
        
        const result = await response.json();
        console.log(`CohortOverview: Received stats for ${cohortName}:`, result.data);
        setStats(result.data);
      } catch (err) {
        console.error('Error fetching cohort stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchCohortStats();
  }, [cohortName]);

  const activePercentage = stats && stats.totalStudents > 0 
    ? Math.round((stats.activeStudents / stats.totalStudents) * 100) 
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <IconUsers className="w-5 h-5 mr-2 text-red-600" />
          Cohort Overview
          {cohortName && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({cohortName})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-red-600 font-semibold">Error loading cohort data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* No Cohort Selected */}
        {!cohortName && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>Select a cohort to view statistics</p>
          </div>
        )}

        {/* Data Display */}
        {stats && !isLoading && (
          <>
            {/* Student Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <IconUsers className="w-4 h-4 mr-1" />
                  Students
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                <div className="text-xs text-gray-500">
                  {stats.activeStudents} active ({activePercentage}%)
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <IconClock className="w-4 h-4 mr-1" />
                  Avg Time
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.averageTimeSpent}</div>
                <div className="text-xs text-gray-500">per session</div>
              </div>
            </div>

            {/* Sessions and Completion */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center text-sm text-gray-600">
                  <IconTrendingUp className="w-4 h-4 mr-1" />
                  Sessions
                </div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
                <div className="text-xs text-gray-500">this week</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Completion</div>
                <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
                <div className="text-xs text-gray-500">overall progress</div>
              </div>
            </div>

            {/* Struggling Students Alert */}
            {stats.strugglingStudents > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <IconAlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-sm font-medium text-red-800">
                    {stats.strugglingStudents} students need attention
                  </span>
                </div>
              </div>
            )}

            {/* Hot Topics */}
            {stats.hotTopics && stats.hotTopics.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">🔥 Hot Topics</div>
                <div className="flex flex-wrap gap-1">
                  {stats.hotTopics.slice(0, 3).map((topic, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
