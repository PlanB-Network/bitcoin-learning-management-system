import type { default as Professor } from '../sql/content/Professors';
import type { default as ProfessorLocalized } from '../sql/content/ProfessorsLocalized';

export type { default as Professor } from '../sql/content/Professors';
export type { default as ProfessorLocalized } from '../sql/content/ProfessorsLocalized';

export type JoinedProfessor = Professor &
  Pick<ProfessorLocalized, 'language' | 'bio' | 'short_bio'> & {
    tags: string[];
    picture: string;
    courses_count: number;
    tutorials_count: number;
  };
