// @generated
// This file is automatically generated from our schemas by the command `pnpm types:generate`. Do not modify manually.

export interface Tutorial {
  id: number;
  path: string;
  name: string;
  category: string;
  subcategory: string | null;
  originalLanguage: string;
  level: string;
  builder: string | null;
  lastUpdated: Date;
  lastCommit: string;
  lastSync: Date;
}

export interface TutorialLocalized {
  tutorialId: number;
  language: string;
  title: string;
  description: string | null;
  rawContent: string;
}

export interface TutorialCredit {
  tutorialId: number;
  contributorId: string | null;
  name: string | null;
  link: string | null;
  lightningAddress: string | null;
  lnurlPay: string | null;
  paynym: string | null;
  silentPayment: string | null;
  tipsUrl: string | null;
}

export interface TutorialLikeDislike {
  tutorialId: number;
  uid: string;
  liked: boolean;
}

export interface JoinedTutorialLight {
  id: number;
  path: string;
  name: string;
  level: string;
  category: string;
  subcategory: string | null;
  originalLanguage: string;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  title: string;
  description: string | null;
  likeCount: number;
  dislikeCount: number;
  tags: string[];
  builder?:
    | (
        | {
            lastCommit: string;
            path: string;
          }
        | undefined
      )
    | null;
}

export interface JoinedTutorial {
  id: number;
  path: string;
  name: string;
  level: string;
  category: string;
  subcategory: string | null;
  originalLanguage: string;
  lastUpdated: Date;
  lastCommit: string;
  language: string;
  title: string;
  description: string | null;
  likeCount: number;
  dislikeCount: number;
  tags: string[];
  builder?:
    | (
        | {
            lastCommit: string;
            path: string;
          }
        | undefined
      )
    | null;
  rawContent: string;
}

export interface JoinedTutorialCredit {
  tutorialId: number;
  contributorId: string | null;
  name: string | null;
  link: string | null;
  lightningAddress: string | null;
  lnurlPay: string | null;
  paynym: string | null;
  silentPayment: string | null;
  tipsUrl: string | null;
  professor?:
    | {
        id: number;
        path: string;
        name: string;
        company: string | null;
        affiliations: string[] | null;
        contributorId: string;
        websiteUrl: string | null;
        twitterUrl: string | null;
        githubUrl: string | null;
        nostr: string | null;
        lightningAddress: string | null;
        lnurlPay: string | null;
        paynym: string | null;
        silentPayment: string | null;
        tipsUrl: string | null;
        lastUpdated: Date;
        lastCommit: string;
        lastSync: Date;
        language: string;
        bio: string | null;
        shortBio: string | null;
        tags: string[];
        picture: string;
        coursesCount: number;
        tutorialsCount: number;
      }
    | undefined;
}
