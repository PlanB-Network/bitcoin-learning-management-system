import type { default as Professor } from '../sql/content/Professors.js';
import type { default as ProfessorLocalized } from '../sql/content/ProfessorsLocalized.js';

export type { default as Professor } from '../sql/content/Professors.js';
export type { default as ProfessorLocalized } from '../sql/content/ProfessorsLocalized.js';

export type JoinedProfessor = Professor &
  Pick<ProfessorLocalized, 'language' | 'bio' | 'short_bio'> & {
    tags: string[];
    picture: string;
    courses_count: number;
    tutorials_count: number;
  };
