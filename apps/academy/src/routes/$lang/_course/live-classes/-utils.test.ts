/// <reference types="mocha" />

import assert from 'node:assert';
import { findActivePlanbSchoolCourse } from './-utils.ts';

const now = new Date('2026-09-09T00:00:00.000Z');

describe('findActivePlanbSchoolCourse', () => {
  it('returns undefined when every Plan B School course has ended', () => {
    assert.equal(
      findActivePlanbSchoolCourse(
        [
          {
            endDate: new Date('2026-07-31T00:00:00.000Z'),
            isArchived: false,
            isPlanbSchool: true,
          },
        ],
        now,
      ),
      undefined,
    );
  });

  it('returns the current Plan B School course', () => {
    const course = {
      endDate: new Date('2026-12-31T00:00:00.000Z'),
      isArchived: false,
      isPlanbSchool: true,
    };

    assert.equal(
      findActivePlanbSchoolCourse(
        [
          {
            endDate: new Date('2026-07-31T00:00:00.000Z'),
            isArchived: false,
            isPlanbSchool: true,
          },
          course,
        ],
        now,
      ),
      course,
    );
  });
});
