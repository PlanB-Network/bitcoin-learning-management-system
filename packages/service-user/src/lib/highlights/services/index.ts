import type { Dependencies } from '../../../dependencies.js';
import { deleteHighlight } from '../queries/delete-highlight.js';
import {
  type CourseHighlight,
  getHighlightsByChapter,
} from '../queries/get-highlights.js';
import { insertHighlight } from '../queries/insert-highlight.js';

interface CreateHighlightOptions {
  uid: string;
  chapterId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  startContainerPath: string;
  endContainerPath: string;
}

export const createGetHighlights = ({ postgres }: Dependencies) => {
  return async (options: {
    uid: string;
    chapterId: string;
  }): Promise<CourseHighlight[]> => {
    return postgres.exec(getHighlightsByChapter(options));
  };
};

export const createAddHighlight = ({ postgres }: Dependencies) => {
  return async (options: CreateHighlightOptions): Promise<CourseHighlight> => {
    const result = await postgres.exec(insertHighlight(options));
    return result[0];
  };
};

export const createDeleteHighlight = ({ postgres }: Dependencies) => {
  return async (options: {
    uid: string;
    highlightId: string;
  }): Promise<void> => {
    await postgres.exec(deleteHighlight(options));
  };
};
