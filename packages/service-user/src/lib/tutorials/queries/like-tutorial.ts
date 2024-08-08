import { sql } from '@blms/database';

export const getExistingLikeTutorialQuery = (
  uid: string,
  tutorialId: number,
) => {
  return sql`
    SELECT tld.tutorial_id, tld.uid, tld.liked
    FROM content.tutorial_likes_dislikes tld
    WHERE tld.tutorial_id = ${tutorialId} AND tld.uid = ${uid}
  `;
};

export const deleteLikeTutorialQuery = (uid: string, tutorialId: number) => {
  return sql`
    DELETE FROM content.tutorial_likes_dislikes
    WHERE tutorial_id = ${tutorialId} AND uid = ${uid}
    RETURNING *;
  `;
};

export const updateLikeTutorialQuery = (
  uid: string,
  tutorialId: number,
  liked: boolean,
) => {
  return sql`
    UPDATE content.tutorial_likes_dislikes
    SET liked = ${liked}
    WHERE tutorial_id = ${tutorialId} AND uid = ${uid}
    RETURNING *;
  `;
};

export const insertLikeTutorialQuery = (
  uid: string,
  tutorialId: number,
  liked: boolean,
) => {
  return sql`
    INSERT INTO content.tutorial_likes_dislikes (tutorial_id, uid, liked)
    VALUES (${tutorialId}, ${uid}, ${liked})
    RETURNING *;
  `;
};
