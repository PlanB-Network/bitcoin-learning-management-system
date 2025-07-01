import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Loader, TableBody, TableCell, TableRow } from '@blms/ui';

import { trpcClient } from '#src/utils/trpc.js';
import {
  SharedTable,
  SharedTableHead,
  SharedTableHeader,
} from '../../-components/shared-table-header.tsx';
import { AssignCourseModal } from './assign-course-modal.tsx';
import { ReassignCourseModal } from './reassign-course-modal.tsx';

// Import filter icon
import FilterIcon from '#src/assets/icons/Filter.svg';

type SortField =
  | 'index'
  | 'courseName'
  | 'isAssigned'
  | 'assigneeDisplayName'
  | 'progress';
type SortDirection = 'asc' | 'desc';

export const ContentManagementTab = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('index');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // State for data
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [contributors, setContributors] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [contributorsLoading, setContributorsLoading] = useState(true);

  // Fetch available topics from the database
  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const data = await trpcClient.content.getContentManagementTopics.query();
      setAvailableTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
      setAvailableTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  };

  // Fetch courses with topic filtering
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const data =
        await trpcClient.content.getAdminContentManagementCourses.query({
          topic: selectedTopic,
        });
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Fetch available contributors
  const fetchContributors = async () => {
    try {
      setContributorsLoading(true);
      const data =
        await trpcClient.user.translation.getAvailableContributors.query();
      setContributors(data || []);
    } catch (error) {
      console.error('Error fetching contributors:', error);
      setContributors([]);
    } finally {
      setContributorsLoading(false);
    }
  };

  const refetchCourses = () => {
    fetchCourses();
  };

  // Initial data fetch
  useEffect(() => {
    fetchTopics();
    fetchContributors();
  }, []);

  // Refetch courses when topic changes
  useEffect(() => {
    fetchCourses();
  }, [selectedTopic]);

  // Filter and sort courses
  const filteredAndSortedCourses = courses
    ?.filter((course) => {
      const matchesSearch =
        searchQuery === '' ||
        course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.index?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'index':
          aValue = a.index || '';
          bValue = b.index || '';
          break;
        case 'courseName':
          aValue = a.courseName || a.courseId || '';
          bValue = b.courseName || b.courseId || '';
          break;
        case 'isAssigned':
          aValue = a.isAssigned || '';
          bValue = b.isAssigned || '';
          break;
        case 'assigneeDisplayName':
          aValue = a.assigneeDisplayName || a.assigneeUsername || '';
          bValue = b.assigneeDisplayName || b.assigneeUsername || '';
          break;
        case 'progress':
          aValue = a.progress || 0;
          bValue = b.progress || 0;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return '↕️'; // Both arrows when not sorted
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleAssign = (course: any) => {
    setSelectedCourse(course);
    setAssignModalOpen(true);
  };

  const handleReassign = (course: any) => {
    setSelectedCourse(course);
    setReassignModalOpen(true);
  };

  const handleAssignSuccess = () => {
    refetchCourses();
    setAssignModalOpen(false);
    setSelectedCourse(null);
  };

  const handleReassignSuccess = () => {
    refetchCourses();
    setReassignModalOpen(false);
    setSelectedCourse(null);
  };

  if (coursesLoading || contributorsLoading || topicsLoading) {
    return <Loader />;
  }

  // Create topic list with "all" option plus available topics from database
  const topicOptions = ['all', ...(availableTopics || [])];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <h2 className="title-large-sb-24px text-dashboardSectionTitle">
          {t('dashboard.adminPanel.translationPanel.contentManagement.title')}
        </h2>

        <p className="text-gray-600">
          {t(
            'dashboard.adminPanel.translationPanel.contentManagement.description',
          )}
        </p>

        {/* Topics Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 self-center mr-2">
            {t('filters.topics')}
          </span>
          {topicOptions.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedTopic === topic
                  ? 'bg-newOrange-1 text-white border-newOrange-1'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
              }`}
            >
              {topic === 'all'
                ? t('words.all')
                : topic === 'socialStudies'
                  ? t('words.socialStudies')
                  : topic}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(
                'dashboard.adminPanel.translationPanel.searchPlaceholder',
              )}
              className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-newOrange-1 focus:border-newOrange-1 outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
            >
              <img
                src={FilterIcon}
                alt={t('words.filter')}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="w-full">
        <SharedTable>
          <SharedTableHeader>
            <SharedTableHead
              className="w-24"
              sortable
              onSort={() => handleSort('index')}
              sortIcon={getSortIcon('index')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.index',
              )}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('courseName')}
              sortIcon={getSortIcon('courseName')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.course',
              )}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('isAssigned')}
              sortIcon={getSortIcon('isAssigned')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.status',
              )}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('assigneeDisplayName')}
              sortIcon={getSortIcon('assigneeDisplayName')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.contributor',
              )}
            </SharedTableHead>
            <SharedTableHead
              sortable
              onSort={() => handleSort('progress')}
              sortIcon={getSortIcon('progress')}
            >
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.progress',
              )}
            </SharedTableHead>
            <SharedTableHead>
              {t(
                'dashboard.adminPanel.translationPanel.contentManagement.table.actions',
              )}
            </SharedTableHead>
          </SharedTableHeader>
          <TableBody>
            {filteredAndSortedCourses && filteredAndSortedCourses.length > 0 ? (
              filteredAndSortedCourses.map((course) => (
                <TableRow
                  key={`${course.courseId}-${course.language}`}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <TableCell className="py-4 font-medium text-gray-900">
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md">
                      {course.index}
                    </span>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="text-sm font-medium text-gray-900 break-words">
                      {course.courseName || course.courseId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {course.language.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                        course.isAssigned === 'not_assigned'
                          ? 'bg-gray-100 text-gray-800'
                          : course.isAssigned === 'assigned'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {course.isAssigned === 'not_assigned'
                        ? t(
                            'dashboard.adminPanel.translationPanel.contentManagement.status.notAssigned',
                          )
                        : course.isAssigned === 'assigned'
                          ? t(
                              'dashboard.adminPanel.translationPanel.contentManagement.status.assigned',
                            )
                          : course.isAssigned}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 text-gray-900 break-words">
                    {course.assigneeDisplayName ||
                      course.assigneeUsername ||
                      ''}
                  </TableCell>
                  <TableCell className="py-4 text-gray-900">
                    {course.progress || 0}%
                  </TableCell>
                  <TableCell className="py-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        size="s"
                        onClick={() => {
                          navigate({
                            to: '/$lang/dashboard/administration/translation-panel/course/$courseId',
                            params: { courseId: course.courseId },
                            search: { language: course.language },
                          });
                        }}
                        className="text-xs"
                      >
                        {t(
                          'dashboard.adminPanel.translationPanel.contentManagement.actions.view',
                        )}
                      </Button>

                      {course.assigneeId ? (
                        <Button
                          variant="outline"
                          size="s"
                          onClick={() => handleReassign(course)}
                          className="text-xs"
                        >
                          {t(
                            'dashboard.adminPanel.translationPanel.contentManagement.actions.reassign',
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="s"
                          onClick={() => handleAssign(course)}
                          className="text-xs"
                        >
                          {t(
                            'dashboard.adminPanel.translationPanel.contentManagement.actions.assign',
                          )}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-gray-500"
                >
                  {searchQuery || selectedTopic !== 'all'
                    ? t(
                        'dashboard.adminPanel.translationPanel.contentManagement.noCoursesFiltered',
                      )
                    : t(
                        'dashboard.adminPanel.translationPanel.contentManagement.noCourses',
                      )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </SharedTable>
      </div>

      {/* Modals */}
      <AssignCourseModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        course={selectedCourse}
        contributors={contributors || []}
        onSuccess={handleAssignSuccess}
      />

      <ReassignCourseModal
        isOpen={reassignModalOpen}
        onClose={() => setReassignModalOpen(false)}
        course={selectedCourse}
        contributors={contributors || []}
        onSuccess={handleReassignSuccess}
      />
    </div>
  );
};
