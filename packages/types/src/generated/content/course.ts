// @generated
// This file is automatically generated from our schemas by the command `pnpm types:generate`. Do not modify manually.

import { Level } from './resource.js';
import { FormattedProfessor } from './professor.js';
export interface Course {
  id: string;
  level: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  lastSync: Date;
}

export interface CourseLocalized {
  courseId: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
}

export interface CoursePart {
  courseId: string;
  partIndex: number;
  partId: string;
  lastSync: Date;
}

export interface CoursePartLocalized {
  courseId: string;
  partId: string;
  language: string;
  title: string;
  lastSync: Date;
}

export interface JoinedCoursePartLocalized {
  courseId: string;
  language: string;
  partId: string;
  title: string;
  partIndex: number;
}

export interface CourseChapter {
  courseId: string;
  chapterIndex: number;
  partId: string;
  chapterId: string;
  lastSync: Date;
}

export interface CourseChapterLocalized {
  courseId: string;
  chapterId: string;
  language: string;
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  startDate: Date | null;
  endDate: Date | null;
  timezone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  liveUrl: string | null;
  chatUrl: string | null;
  availableSeats: number | null;
  remainingSeats: number | null;
  liveLanguage: string | null;
  title: string;
  sections: string[];
  rawContent: string;
  lastSync: Date;
}

export interface JoinedCourseChapter {
  chapterId: string;
  language: string;
  title: string;
  sections: string[];
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  startDate: Date | null;
  endDate: Date | null;
  timezone: string | null;
  liveUrl: string | null;
  chatUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  availableSeats: number | null;
  remainingSeats: number | null;
  liveLanguage: string | null;
  rawContent: string;
  partId: string;
  chapterIndex: number;
  partIndex: number;
  partTitle: string;
}

export interface MinimalJoinedCourse {
  id: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
  level: Level;
  chaptersCount?: number | undefined;
}

export interface JoinedCourse {
  id: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
  level: Level;
  chaptersCount?: number | undefined;
  professors: FormattedProfessor[];
}

export interface JoinedCourseWithProfessors {
  id: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
  level: Level;
  chaptersCount?: number | undefined;
  professors: FormattedProfessor[];
}

export interface JoinedCourseWithAll {
  id: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
  level: Level;
  chaptersCount: number;
  professors: FormattedProfessor[];
  parts: {
    part?: number | undefined;
    language?: string | undefined;
    title?: string | undefined;
    chapters: (JoinedCourseChapter | undefined)[];
  }[];
  partsCount: number;
}

export interface JoinedCourseChapterWithContent {
  courseId: string;
  chapterId: string;
  language: string;
  title: string;
  sections: string[];
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  startDate: Date | null;
  endDate: Date | null;
  timezone: string | null;
  liveUrl: string | null;
  chatUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  availableSeats: number | null;
  remainingSeats: number | null;
  liveLanguage: string | null;
  rawContent: string;
  partId: string;
  chapterIndex: number;
  partIndex: number;
  lastUpdated: Date;
  lastCommit: string;
  professors: FormattedProfessor[];
}

export interface PartWithChapters {
  courseId: string;
  language: string;
  partId: string;
  title: string;
  partIndex: number;
  chapters: JoinedCourseChapter[];
}

export interface CourseResponse {
  id: string;
  hours: number;
  topic: string;
  subtopic: string;
  originalLanguage: string;
  requiresPayment: boolean;
  paidPriceDollars: number | null;
  paidDescription: string | null;
  paidVideoLink: string | null;
  paidStartDate: Date | null;
  paidEndDate: Date | null;
  contact: string | null;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  name: string;
  goal: string;
  objectives: string[];
  rawDescription: string;
  level: Level;
  chaptersCount: number;
  professors: FormattedProfessor[];
  parts: PartWithChapters[];
  partsCount: number;
}

export interface CourseChapterResponse {
  courseId: string;
  chapterId: string;
  language: string;
  title: string;
  sections: string[];
  releasePlace: string | null;
  isOnline: boolean;
  isInPerson: boolean;
  isCourseReview: boolean;
  isCourseExam: boolean;
  isCourseConclusion: boolean;
  startDate: Date | null;
  endDate: Date | null;
  timezone: string | null;
  liveUrl: string | null;
  chatUrl: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  addressLine3: string | null;
  availableSeats: number | null;
  remainingSeats: number | null;
  liveLanguage: string | null;
  rawContent: string;
  partId: string;
  chapterIndex: number;
  partIndex: number;
  lastUpdated: Date;
  lastCommit: string;
  professors?: FormattedProfessor[] | undefined;
  course: CourseResponse;
  part: PartWithChapters;
}

export interface CourseReviewsExtended {
  general: number[];
  difficulty: number[];
  length: number[];
  faithful: number[];
  recommand: number[];
  quality: number[];
  feedbacks: {
    date: string;
    user: string;
    publicComment: string;
    teacherComment: string | null;
    adminComment: string | null;
  }[];
}
