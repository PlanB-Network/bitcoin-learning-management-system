import { sql } from '@sovereign-university/database';

export const calculateCourseChapterSeats = () => {
  return sql`
  UPDATE content.course_chapters_localized c 
  SET remaining_seats = c.available_seats - 
    (select count(*) 
    FROM users.course_user_chapter 
    WHERE course_id = c.course_id 
      AND booked=true 
      AND part = c.part 
      AND chapter = c.chapter
    );
  `;
};
