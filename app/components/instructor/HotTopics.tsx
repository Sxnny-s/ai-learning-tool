import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/CardComponent';
import { Badge } from '../ui/BadgeComponent';
import { HotTopic } from '@/types/data';
import { IconTrendingUp, IconMessageCircle, IconClock, IconUsers, IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface Props {
  topics: HotTopic[];
  className?: string;
}

export const HotTopics: React.FC<Props> = (props) => {
  const { topics, className = "" } = props;
  const [expandedTopicIndex, setExpandedTopicIndex] = useState<number | null>(null);

  const toggleTopicExpansion = (index: number) => {
    setExpandedTopicIndex(expandedTopicIndex === index ? null : index);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <IconTrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <IconTrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      case 'stable':
        return <IconClock className="w-4 h-4 text-gray-600" />;
      default:
        return <IconClock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <IconMessageCircle className="w-5 h-5 mr-2 text-red-600" />
          Hot Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topics.length === 0 ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-600">No trending topics yet</p>
          </div>
        ) : (
          topics.map((topic, index) => {
            const isExpanded = expandedTopicIndex === index;
            const hasStudentRatings = topic.difficultyRatings && 
              (topic.difficultyRatings.High > 0 || topic.difficultyRatings.Medium > 0 || topic.difficultyRatings.Low > 0);
            
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div 
                  className="p-3 cursor-pointer"
                  onClick={() => toggleTopicExpansion(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2 flex-wrap">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {topic.name}
                        </h4>
                        <Badge variant="outline" className={getDifficultyColor(topic.difficulty)}>
                          {topic.difficulty}
                        </Badge>
                        {topic.studentReportedDifficulty && (
                          <Badge variant="outline" className={`${getDifficultyColor(topic.studentReportedDifficulty)} text-xs`}>
                            Students: {topic.studentReportedDifficulty}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 flex-wrap">
                        <div className="flex items-center">
                          <IconMessageCircle className="w-3 h-3 mr-1" />
                          {topic.discussionCount} discussions
                        </div>
                        <div className="flex items-center">
                          <IconUsers className="w-3 h-3 mr-1" />
                          {topic.studentCount} students
                        </div>
                        <div className="flex items-center">
                          <IconClock className="w-3 h-3 mr-1" />
                          {topic.lastActivity}
                        </div>
                      </div>

                      {/* Student Difficulty Rating Breakdown */}
                      {hasStudentRatings && (
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                          <span className="text-gray-600">Ratings:</span>
                          {topic.difficultyRatings!.High > 0 && (
                            <Badge variant="outline" className="text-red-600 bg-red-50 text-xs">
                              🔴 {topic.difficultyRatings!.High} High
                            </Badge>
                          )}
                          {topic.difficultyRatings!.Medium > 0 && (
                            <Badge variant="outline" className="text-yellow-600 bg-yellow-50 text-xs">
                              🟡 {topic.difficultyRatings!.Medium} Med
                            </Badge>
                          )}
                          {topic.difficultyRatings!.Low > 0 && (
                            <Badge variant="outline" className="text-green-600 bg-green-50 text-xs">
                              🟢 {topic.difficultyRatings!.Low} Low
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-2">
                      <div className={`flex items-center ${getTrendColor(topic.trend)}`}>
                        {getTrendIcon(topic.trend)}
                      </div>
                      <div className="text-xs text-gray-500">
                        #{index + 1}
                      </div>
                      {isExpanded ? (
                        <IconChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <IconChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Student List */}
                {isExpanded && topic.studentsRequesting && topic.studentsRequesting.length > 0 && (
                  <div className="px-3 pb-3 border-t border-gray-200 mt-2 pt-2">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">Students Requesting Help:</h5>
                    <div className="space-y-2">
                      {topic.studentsRequesting.map((student, studentIndex) => (
                        <div 
                          key={studentIndex}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{student.name}</div>
                            <div className="text-gray-500 truncate">{student.email}</div>
                            {student.clerkUserId && (
                              <div className="text-gray-400 text-xs mt-0.5">
                                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">{student.clerkUserId}</span>
                              </div>
                            )}
                            <div className="text-gray-400 text-xs mt-1">
                              Submitted: {new Date(student.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {student.difficultyRating && (
                            <Badge 
                              variant="outline" 
                              className={`${getDifficultyColor(student.difficultyRating)} ml-2 text-xs flex-shrink-0`}
                            >
                              {student.difficultyRating}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        
        {/* Summary Stats */}
        {topics.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {topics.reduce((sum, topic) => sum + topic.discussionCount, 0)}
                </div>
                <div className="text-xs text-gray-500">Total Discussions</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {topics.reduce((sum, topic) => sum + topic.studentCount, 0)}
                </div>
                <div className="text-xs text-gray-500">Students Engaged</div>
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {topics.filter(topic => topic.trend === 'up').length}
                </div>
                <div className="text-xs text-gray-500">Trending Up</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
