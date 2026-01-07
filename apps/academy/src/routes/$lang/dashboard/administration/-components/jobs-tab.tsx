import { cn } from '@blms/ui';
import { useEffect, useState } from 'react';

interface TranslationJob {
  id: string;
  courseId: string;
  type: 'upload' | 'translation';
  status:
    | 'pending'
    | 'starting'
    | 'processing'
    | 'polling'
    | 'converting'
    | 'completed'
    | 'failed';
  languages?: string[];
  progress?: string;
  error?: string;
  taskId?: string;
  uploadId?: string;
  totalFiles?: number;
  processedFiles?: number;
  currentFile?: string;
  startedAt: string;
  completedAt?: string;
  lastUpdate: string;
}

const getStatusColor = (status: TranslationJob['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'starting':
    case 'processing':
    case 'polling':
    case 'converting':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return date.toLocaleDateString();
};

async function startTranslation(uploadId: string, languages: string[]) {
  if (!confirm('Start translation for this course?')) return;

  try {
    const response = await fetch(`/api/start-translation/${uploadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languages }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to start translation');
    }

    alert(
      'Translation started successfully! Check the Jobs tab to monitor progress.',
    );
  } catch (error) {
    alert(
      error instanceof Error ? error.message : 'Failed to start translation',
    );
  }
}

async function retryTranslation(courseId: string, languages: string[]) {
  if (!confirm('Retry translation for this course?')) return;

  try {
    const response = await fetch(`/api/retry-translation/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languages }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to retry translation');
    }

    alert('Translation retry started successfully!');
  } catch (error) {
    alert(
      error instanceof Error ? error.message : 'Failed to retry translation',
    );
  }
}

export const JobsTab = () => {
  const [jobs, setJobs] = useState<TranslationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs
  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        if (cancelled) return;

        const response = await fetch('/api/translation-jobs?limit=100', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();

        if (!cancelled) {
          setJobs(data.jobs || []);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching jobs:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
          setLoading(false);
        }
      }
    };

    fetchJobs();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchJobs, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">No translation jobs found</p>
        <p className="text-sm text-gray-500 mt-2">
          Jobs will appear here when uploads or translations are in progress
        </p>
      </div>
    );
  }

  // Separate active and completed jobs
  const activeJobs = jobs.filter(
    (job) =>
      job.status === 'pending' ||
      job.status === 'starting' ||
      job.status === 'processing' ||
      job.status === 'polling' ||
      job.status === 'converting',
  );
  const completedJobs = jobs.filter(
    (job) => job.status === 'completed' || job.status === 'failed',
  );

  // Helper to check if a translation job exists for a course
  const hasTranslationJob = (courseId: string) => {
    return jobs.some(
      (job) => job.type === 'translation' && job.courseId === courseId,
    );
  };

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Auto-refreshing every 5 seconds • Showing last 100 jobs
        </p>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Active Jobs ({activeJobs.length})
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Course ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Files
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activeJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {job.courseId.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                          job.type === 'upload'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800',
                        )}
                      >
                        {job.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                          getStatusColor(job.status),
                        )}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs">
                      <div className="space-y-1">
                        <p className="text-gray-900 truncate">
                          {job.progress || 'Processing...'}
                        </p>
                        {job.currentFile && (
                          <p className="text-xs text-gray-500 truncate">
                            {job.currentFile}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.totalFiles !== undefined &&
                      job.processedFiles !== undefined ? (
                        <div className="space-y-1">
                          <p className="text-gray-900">
                            {job.processedFiles} / {job.totalFiles}
                          </p>
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-blue-500 h-1.5 rounded-full transition-all"
                              style={{
                                width: `${(job.processedFiles / job.totalFiles) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatRelativeTime(job.startedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completed Jobs */}
      {completedJobs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Completed Jobs ({completedJobs.length})
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Course ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Languages
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {completedJobs.map((job) => {
                  const duration =
                    job.completedAt &&
                    Math.floor(
                      (new Date(job.completedAt).getTime() -
                        new Date(job.startedAt).getTime()) /
                        1000,
                    );

                  return (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {job.courseId.substring(0, 8)}...
                        </code>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                            job.type === 'upload'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800',
                          )}
                        >
                          {job.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
                            getStatusColor(job.status),
                          )}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {job.languages && job.languages.length > 0 ? (
                          <span className="text-gray-900">
                            {job.languages.join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {duration ? `${duration}s` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {job.completedAt
                          ? formatRelativeTime(job.completedAt)
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {/* Start Translation button for completed upload jobs */}
                          {job.status === 'completed' &&
                            job.type === 'upload' &&
                            job.uploadId &&
                            !hasTranslationJob(job.courseId) && (
                              <button
                                type="button"
                                onClick={() =>
                                  startTranslation(
                                    job.uploadId!,
                                    job.languages || [],
                                  )
                                }
                                className="text-green-600 hover:text-green-700 text-xs font-medium"
                              >
                                Start Translation
                              </button>
                            )}

                          {/* Retry button for failed translation jobs */}
                          {job.status === 'failed' &&
                            job.type === 'translation' && (
                              <button
                                type="button"
                                onClick={() =>
                                  retryTranslation(
                                    job.courseId,
                                    job.languages || [],
                                  )
                                }
                                className="text-orange-600 hover:text-orange-700 text-xs font-medium"
                              >
                                Retry
                              </button>
                            )}

                          {/* Error details button */}
                          {job.error && (
                            <button
                              type="button"
                              onClick={() => alert(job.error)}
                              className="text-gray-600 hover:text-gray-700 text-xs font-medium"
                            >
                              Error
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
