// @generated
// This file is automatically generated by Kanel. Do not modify manually.

import type { CoursesId } from './Courses';

/** Identifier type for content.course_parts */
export type CoursePartsPart = number;

/** Represents the table content.course_parts */
export default interface CourseParts {
  course_id: CoursesId;

  part: CoursePartsPart;
}

/** Represents the initializer for the table content.course_parts */
export interface CoursePartsInitializer {
  course_id: CoursesId;

  part: CoursePartsPart;
}

/** Represents the mutator for the table content.course_parts */
export interface CoursePartsMutator {
  course_id?: CoursesId;

  part?: CoursePartsPart;
}