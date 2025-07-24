import type { Dependencies } from '../../dependencies.js';
import {
  type BasicCourse,
  getCoursesBasicQuery,
} from '../queries/get-courses-basic.js';

export const createGetCoursesBasic = ({ postgres }: Dependencies) => {
  return async (language = 'en'): Promise<BasicCourse[]> => {
    return postgres.exec(getCoursesBasicQuery(language));
  };
};
