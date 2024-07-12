/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

// Import Routes

import { Route as rootRoute } from './routes/__root';
import { Route as DashboardImport } from './routes/dashboard';
import { Route as IndexImport } from './routes/index';
import { Route as DashboardProfileImport } from './routes/dashboard/profile';
import { Route as DashboardCoursesImport } from './routes/dashboard/courses';
import { Route as DashboardCalendarImport } from './routes/dashboard/calendar';
import { Route as DashboardBookingsImport } from './routes/dashboard/bookings';
import { Route as ContentTutorialsIndexImport } from './routes/_content/tutorials/index';
import { Route as ContentResourcesIndexImport } from './routes/_content/resources/index';
import { Route as ContentEventsIndexImport } from './routes/_content/events/index';
import { Route as ContentCoursesIndexImport } from './routes/_content/courses/index';
import { Route as ContentTutorialsCategoryImport } from './routes/_content/tutorials/$category';
import { Route as ContentResourcesPodcastsImport } from './routes/_content/resources/podcasts';
import { Route as ContentResourcesGlossaryImport } from './routes/_content/resources/glossary';
import { Route as ContentResourcesConferencesImport } from './routes/_content/resources/conferences';
import { Route as ContentResourcesBuildersImport } from './routes/_content/resources/builders';
import { Route as ContentResourcesBooksImport } from './routes/_content/resources/books';
import { Route as ContentResourcesBetImport } from './routes/_content/resources/bet';
import { Route as ContentEventsEventIdImport } from './routes/_content/events/$eventId';
import { Route as ContentCoursesCourseIdImport } from './routes/_content/courses/$courseId';
import { Route as ContentMiscUnderConstructionImport } from './routes/_content/_misc/under-construction';
import { Route as ContentMiscTermsAndConditionsImport } from './routes/_content/_misc/terms-and-conditions';
import { Route as ContentMiscProfessorsImport } from './routes/_content/_misc/professors';
import { Route as ContentMiscNodeNetworkImport } from './routes/_content/_misc/node-network';
import { Route as ContentMiscManifestoImport } from './routes/_content/_misc/manifesto';
import { Route as ContentMiscBCertificateImport } from './routes/_content/_misc/b-certificate';
import { Route as ContentMiscAboutImport } from './routes/_content/_misc/about';
import { Route as ContentTutorialsCategoryIndexImport } from './routes/_content/tutorials/$category/index';
import { Route as ContentCoursesCourseIdIndexImport } from './routes/_content/courses/$courseId/index';
import { Route as ContentTutorialsCategoryNameImport } from './routes/_content/tutorials/$category/$name';
import { Route as ContentResourcesPodcastPodcastIdImport } from './routes/_content/resources/podcast.$podcastId';
import { Route as ContentResourcesGlossaryWordIdImport } from './routes/_content/resources/glossary.$wordId';
import { Route as ContentResourcesConferenceConferenceIdImport } from './routes/_content/resources/conference.$conferenceId';
import { Route as ContentResourcesBuilderBuilderIdImport } from './routes/_content/resources/builder.$builderId';
import { Route as ContentResourcesBookBookIdImport } from './routes/_content/resources/book.$bookId';
import { Route as ContentCoursesCourseIdChapterIdImport } from './routes/_content/courses/$courseId/$chapterId';
import { Route as ContentMiscValidateEmailTokenImport } from './routes/_content/_misc/validate-email.$token';
import { Route as ContentMiscResetPasswordTokenImport } from './routes/_content/_misc/reset-password.$token';
import { Route as ContentMiscProfessorProfessorIdImport } from './routes/_content/_misc/professor.$professorId';

// Create/Update Routes

const DashboardRoute = DashboardImport.update({
  path: '/dashboard',
  getParentRoute: () => rootRoute,
} as any);

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const DashboardProfileRoute = DashboardProfileImport.update({
  path: '/profile',
  getParentRoute: () => DashboardRoute,
} as any);

const DashboardCoursesRoute = DashboardCoursesImport.update({
  path: '/courses',
  getParentRoute: () => DashboardRoute,
} as any);

const DashboardCalendarRoute = DashboardCalendarImport.update({
  path: '/calendar',
  getParentRoute: () => DashboardRoute,
} as any);

const DashboardBookingsRoute = DashboardBookingsImport.update({
  path: '/bookings',
  getParentRoute: () => DashboardRoute,
} as any);

const ContentTutorialsIndexRoute = ContentTutorialsIndexImport.update({
  path: '/tutorials/',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesIndexRoute = ContentResourcesIndexImport.update({
  path: '/resources/',
  getParentRoute: () => rootRoute,
} as any);

const ContentEventsIndexRoute = ContentEventsIndexImport.update({
  path: '/events/',
  getParentRoute: () => rootRoute,
} as any);

const ContentCoursesIndexRoute = ContentCoursesIndexImport.update({
  path: '/courses/',
  getParentRoute: () => rootRoute,
} as any);

const ContentTutorialsCategoryRoute = ContentTutorialsCategoryImport.update({
  path: '/tutorials/$category',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesPodcastsRoute = ContentResourcesPodcastsImport.update({
  path: '/resources/podcasts',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesGlossaryRoute = ContentResourcesGlossaryImport.update({
  path: '/resources/glossary',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesConferencesRoute =
  ContentResourcesConferencesImport.update({
    path: '/resources/conferences',
    getParentRoute: () => rootRoute,
  } as any);

const ContentResourcesBuildersRoute = ContentResourcesBuildersImport.update({
  path: '/resources/builders',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesBooksRoute = ContentResourcesBooksImport.update({
  path: '/resources/books',
  getParentRoute: () => rootRoute,
} as any);

const ContentResourcesBetRoute = ContentResourcesBetImport.update({
  path: '/resources/bet',
  getParentRoute: () => rootRoute,
} as any);

const ContentEventsEventIdRoute = ContentEventsEventIdImport.update({
  path: '/events/$eventId',
  getParentRoute: () => rootRoute,
} as any);

const ContentCoursesCourseIdRoute = ContentCoursesCourseIdImport.update({
  path: '/courses/$courseId',
  getParentRoute: () => rootRoute,
} as any);

const ContentMiscUnderConstructionRoute =
  ContentMiscUnderConstructionImport.update({
    path: '/under-construction',
    getParentRoute: () => rootRoute,
  } as any);

const ContentMiscTermsAndConditionsRoute =
  ContentMiscTermsAndConditionsImport.update({
    path: '/terms-and-conditions',
    getParentRoute: () => rootRoute,
  } as any);

const ContentMiscProfessorsRoute = ContentMiscProfessorsImport.update({
  path: '/professors',
  getParentRoute: () => rootRoute,
} as any);

const ContentMiscNodeNetworkRoute = ContentMiscNodeNetworkImport.update({
  path: '/node-network',
  getParentRoute: () => rootRoute,
} as any);

const ContentMiscManifestoRoute = ContentMiscManifestoImport.update({
  path: '/manifesto',
  getParentRoute: () => rootRoute,
} as any);

const ContentMiscBCertificateRoute = ContentMiscBCertificateImport.update({
  path: '/b-certificate',
  getParentRoute: () => rootRoute,
} as any);

const ContentMiscAboutRoute = ContentMiscAboutImport.update({
  path: '/about',
  getParentRoute: () => rootRoute,
} as any);

const ContentTutorialsCategoryIndexRoute =
  ContentTutorialsCategoryIndexImport.update({
    path: '/',
    getParentRoute: () => ContentTutorialsCategoryRoute,
  } as any);

const ContentCoursesCourseIdIndexRoute =
  ContentCoursesCourseIdIndexImport.update({
    path: '/',
    getParentRoute: () => ContentCoursesCourseIdRoute,
  } as any);

const ContentTutorialsCategoryNameRoute =
  ContentTutorialsCategoryNameImport.update({
    path: '/$name',
    getParentRoute: () => ContentTutorialsCategoryRoute,
  } as any);

const ContentResourcesPodcastPodcastIdRoute =
  ContentResourcesPodcastPodcastIdImport.update({
    path: '/resources/podcast/$podcastId',
    getParentRoute: () => rootRoute,
  } as any);

const ContentResourcesGlossaryWordIdRoute =
  ContentResourcesGlossaryWordIdImport.update({
    path: '/$wordId',
    getParentRoute: () => ContentResourcesGlossaryRoute,
  } as any);

const ContentResourcesConferenceConferenceIdRoute =
  ContentResourcesConferenceConferenceIdImport.update({
    path: '/resources/conference/$conferenceId',
    getParentRoute: () => rootRoute,
  } as any);

const ContentResourcesBuilderBuilderIdRoute =
  ContentResourcesBuilderBuilderIdImport.update({
    path: '/resources/builder/$builderId',
    getParentRoute: () => rootRoute,
  } as any);

const ContentResourcesBookBookIdRoute = ContentResourcesBookBookIdImport.update(
  {
    path: '/resources/book/$bookId',
    getParentRoute: () => rootRoute,
  } as any,
);

const ContentCoursesCourseIdChapterIdRoute =
  ContentCoursesCourseIdChapterIdImport.update({
    path: '/$chapterId',
    getParentRoute: () => ContentCoursesCourseIdRoute,
  } as any);

const ContentMiscValidateEmailTokenRoute =
  ContentMiscValidateEmailTokenImport.update({
    path: '/validate-email/$token',
    getParentRoute: () => rootRoute,
  } as any);

const ContentMiscResetPasswordTokenRoute =
  ContentMiscResetPasswordTokenImport.update({
    path: '/reset-password/$token',
    getParentRoute: () => rootRoute,
  } as any);

const ContentMiscProfessorProfessorIdRoute =
  ContentMiscProfessorProfessorIdImport.update({
    path: '/professor/$professorId',
    getParentRoute: () => rootRoute,
  } as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    '/dashboard': {
      id: '/dashboard';
      path: '/dashboard';
      fullPath: '/dashboard';
      preLoaderRoute: typeof DashboardImport;
      parentRoute: typeof rootRoute;
    };
    '/dashboard/bookings': {
      id: '/dashboard/bookings';
      path: '/bookings';
      fullPath: '/dashboard/bookings';
      preLoaderRoute: typeof DashboardBookingsImport;
      parentRoute: typeof DashboardImport;
    };
    '/dashboard/calendar': {
      id: '/dashboard/calendar';
      path: '/calendar';
      fullPath: '/dashboard/calendar';
      preLoaderRoute: typeof DashboardCalendarImport;
      parentRoute: typeof DashboardImport;
    };
    '/dashboard/courses': {
      id: '/dashboard/courses';
      path: '/courses';
      fullPath: '/dashboard/courses';
      preLoaderRoute: typeof DashboardCoursesImport;
      parentRoute: typeof DashboardImport;
    };
    '/dashboard/profile': {
      id: '/dashboard/profile';
      path: '/profile';
      fullPath: '/dashboard/profile';
      preLoaderRoute: typeof DashboardProfileImport;
      parentRoute: typeof DashboardImport;
    };
    '/_content/_misc/about': {
      id: '/_content/_misc/about';
      path: '/about';
      fullPath: '/about';
      preLoaderRoute: typeof ContentMiscAboutImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/b-certificate': {
      id: '/_content/_misc/b-certificate';
      path: '/b-certificate';
      fullPath: '/b-certificate';
      preLoaderRoute: typeof ContentMiscBCertificateImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/manifesto': {
      id: '/_content/_misc/manifesto';
      path: '/manifesto';
      fullPath: '/manifesto';
      preLoaderRoute: typeof ContentMiscManifestoImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/node-network': {
      id: '/_content/_misc/node-network';
      path: '/node-network';
      fullPath: '/node-network';
      preLoaderRoute: typeof ContentMiscNodeNetworkImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/professors': {
      id: '/_content/_misc/professors';
      path: '/professors';
      fullPath: '/professors';
      preLoaderRoute: typeof ContentMiscProfessorsImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/terms-and-conditions': {
      id: '/_content/_misc/terms-and-conditions';
      path: '/terms-and-conditions';
      fullPath: '/terms-and-conditions';
      preLoaderRoute: typeof ContentMiscTermsAndConditionsImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/under-construction': {
      id: '/_content/_misc/under-construction';
      path: '/under-construction';
      fullPath: '/under-construction';
      preLoaderRoute: typeof ContentMiscUnderConstructionImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/courses/$courseId': {
      id: '/_content/courses/$courseId';
      path: '/courses/$courseId';
      fullPath: '/courses/$courseId';
      preLoaderRoute: typeof ContentCoursesCourseIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/events/$eventId': {
      id: '/_content/events/$eventId';
      path: '/events/$eventId';
      fullPath: '/events/$eventId';
      preLoaderRoute: typeof ContentEventsEventIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/bet': {
      id: '/_content/resources/bet';
      path: '/resources/bet';
      fullPath: '/resources/bet';
      preLoaderRoute: typeof ContentResourcesBetImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/books': {
      id: '/_content/resources/books';
      path: '/resources/books';
      fullPath: '/resources/books';
      preLoaderRoute: typeof ContentResourcesBooksImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/builders': {
      id: '/_content/resources/builders';
      path: '/resources/builders';
      fullPath: '/resources/builders';
      preLoaderRoute: typeof ContentResourcesBuildersImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/conferences': {
      id: '/_content/resources/conferences';
      path: '/resources/conferences';
      fullPath: '/resources/conferences';
      preLoaderRoute: typeof ContentResourcesConferencesImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/glossary': {
      id: '/_content/resources/glossary';
      path: '/resources/glossary';
      fullPath: '/resources/glossary';
      preLoaderRoute: typeof ContentResourcesGlossaryImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/podcasts': {
      id: '/_content/resources/podcasts';
      path: '/resources/podcasts';
      fullPath: '/resources/podcasts';
      preLoaderRoute: typeof ContentResourcesPodcastsImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/tutorials/$category': {
      id: '/_content/tutorials/$category';
      path: '/tutorials/$category';
      fullPath: '/tutorials/$category';
      preLoaderRoute: typeof ContentTutorialsCategoryImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/courses/': {
      id: '/_content/courses/';
      path: '/courses';
      fullPath: '/courses';
      preLoaderRoute: typeof ContentCoursesIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/events/': {
      id: '/_content/events/';
      path: '/events';
      fullPath: '/events';
      preLoaderRoute: typeof ContentEventsIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/': {
      id: '/_content/resources/';
      path: '/resources';
      fullPath: '/resources';
      preLoaderRoute: typeof ContentResourcesIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/tutorials/': {
      id: '/_content/tutorials/';
      path: '/tutorials';
      fullPath: '/tutorials';
      preLoaderRoute: typeof ContentTutorialsIndexImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/professor/$professorId': {
      id: '/_content/_misc/professor/$professorId';
      path: '/professor/$professorId';
      fullPath: '/professor/$professorId';
      preLoaderRoute: typeof ContentMiscProfessorProfessorIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/reset-password/$token': {
      id: '/_content/_misc/reset-password/$token';
      path: '/reset-password/$token';
      fullPath: '/reset-password/$token';
      preLoaderRoute: typeof ContentMiscResetPasswordTokenImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/_misc/validate-email/$token': {
      id: '/_content/_misc/validate-email/$token';
      path: '/validate-email/$token';
      fullPath: '/validate-email/$token';
      preLoaderRoute: typeof ContentMiscValidateEmailTokenImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/courses/$courseId/$chapterId': {
      id: '/_content/courses/$courseId/$chapterId';
      path: '/$chapterId';
      fullPath: '/courses/$courseId/$chapterId';
      preLoaderRoute: typeof ContentCoursesCourseIdChapterIdImport;
      parentRoute: typeof ContentCoursesCourseIdImport;
    };
    '/_content/resources/book/$bookId': {
      id: '/_content/resources/book/$bookId';
      path: '/resources/book/$bookId';
      fullPath: '/resources/book/$bookId';
      preLoaderRoute: typeof ContentResourcesBookBookIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/builder/$builderId': {
      id: '/_content/resources/builder/$builderId';
      path: '/resources/builder/$builderId';
      fullPath: '/resources/builder/$builderId';
      preLoaderRoute: typeof ContentResourcesBuilderBuilderIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/conference/$conferenceId': {
      id: '/_content/resources/conference/$conferenceId';
      path: '/resources/conference/$conferenceId';
      fullPath: '/resources/conference/$conferenceId';
      preLoaderRoute: typeof ContentResourcesConferenceConferenceIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/resources/glossary/$wordId': {
      id: '/_content/resources/glossary/$wordId';
      path: '/$wordId';
      fullPath: '/resources/glossary/$wordId';
      preLoaderRoute: typeof ContentResourcesGlossaryWordIdImport;
      parentRoute: typeof ContentResourcesGlossaryImport;
    };
    '/_content/resources/podcast/$podcastId': {
      id: '/_content/resources/podcast/$podcastId';
      path: '/resources/podcast/$podcastId';
      fullPath: '/resources/podcast/$podcastId';
      preLoaderRoute: typeof ContentResourcesPodcastPodcastIdImport;
      parentRoute: typeof rootRoute;
    };
    '/_content/tutorials/$category/$name': {
      id: '/_content/tutorials/$category/$name';
      path: '/$name';
      fullPath: '/tutorials/$category/$name';
      preLoaderRoute: typeof ContentTutorialsCategoryNameImport;
      parentRoute: typeof ContentTutorialsCategoryImport;
    };
    '/_content/courses/$courseId/': {
      id: '/_content/courses/$courseId/';
      path: '/';
      fullPath: '/courses/$courseId/';
      preLoaderRoute: typeof ContentCoursesCourseIdIndexImport;
      parentRoute: typeof ContentCoursesCourseIdImport;
    };
    '/_content/tutorials/$category/': {
      id: '/_content/tutorials/$category/';
      path: '/';
      fullPath: '/tutorials/$category/';
      preLoaderRoute: typeof ContentTutorialsCategoryIndexImport;
      parentRoute: typeof ContentTutorialsCategoryImport;
    };
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  DashboardRoute: DashboardRoute.addChildren({
    DashboardBookingsRoute,
    DashboardCalendarRoute,
    DashboardCoursesRoute,
    DashboardProfileRoute,
  }),
  ContentMiscAboutRoute,
  ContentMiscBCertificateRoute,
  ContentMiscManifestoRoute,
  ContentMiscNodeNetworkRoute,
  ContentMiscProfessorsRoute,
  ContentMiscTermsAndConditionsRoute,
  ContentMiscUnderConstructionRoute,
  ContentCoursesCourseIdRoute: ContentCoursesCourseIdRoute.addChildren({
    ContentCoursesCourseIdChapterIdRoute,
    ContentCoursesCourseIdIndexRoute,
  }),
  ContentEventsEventIdRoute,
  ContentResourcesBetRoute,
  ContentResourcesBooksRoute,
  ContentResourcesBuildersRoute,
  ContentResourcesConferencesRoute,
  ContentResourcesGlossaryRoute: ContentResourcesGlossaryRoute.addChildren({
    ContentResourcesGlossaryWordIdRoute,
  }),
  ContentResourcesPodcastsRoute,
  ContentTutorialsCategoryRoute: ContentTutorialsCategoryRoute.addChildren({
    ContentTutorialsCategoryNameRoute,
    ContentTutorialsCategoryIndexRoute,
  }),
  ContentCoursesIndexRoute,
  ContentEventsIndexRoute,
  ContentResourcesIndexRoute,
  ContentTutorialsIndexRoute,
  ContentMiscProfessorProfessorIdRoute,
  ContentMiscResetPasswordTokenRoute,
  ContentMiscValidateEmailTokenRoute,
  ContentResourcesBookBookIdRoute,
  ContentResourcesBuilderBuilderIdRoute,
  ContentResourcesConferenceConferenceIdRoute,
  ContentResourcesPodcastPodcastIdRoute,
});

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/dashboard",
        "/_content/_misc/about",
        "/_content/_misc/b-certificate",
        "/_content/_misc/manifesto",
        "/_content/_misc/node-network",
        "/_content/_misc/professors",
        "/_content/_misc/terms-and-conditions",
        "/_content/_misc/under-construction",
        "/_content/courses/$courseId",
        "/_content/events/$eventId",
        "/_content/resources/bet",
        "/_content/resources/books",
        "/_content/resources/builders",
        "/_content/resources/conferences",
        "/_content/resources/glossary",
        "/_content/resources/podcasts",
        "/_content/tutorials/$category",
        "/_content/courses/",
        "/_content/events/",
        "/_content/resources/",
        "/_content/tutorials/",
        "/_content/_misc/professor/$professorId",
        "/_content/_misc/reset-password/$token",
        "/_content/_misc/validate-email/$token",
        "/_content/resources/book/$bookId",
        "/_content/resources/builder/$builderId",
        "/_content/resources/conference/$conferenceId",
        "/_content/resources/podcast/$podcastId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/dashboard": {
      "filePath": "dashboard.tsx",
      "children": [
        "/dashboard/bookings",
        "/dashboard/calendar",
        "/dashboard/courses",
        "/dashboard/profile"
      ]
    },
    "/dashboard/bookings": {
      "filePath": "dashboard/bookings.tsx",
      "parent": "/dashboard"
    },
    "/dashboard/calendar": {
      "filePath": "dashboard/calendar.tsx",
      "parent": "/dashboard"
    },
    "/dashboard/courses": {
      "filePath": "dashboard/courses.tsx",
      "parent": "/dashboard"
    },
    "/dashboard/profile": {
      "filePath": "dashboard/profile.tsx",
      "parent": "/dashboard"
    },
    "/_content/_misc/about": {
      "filePath": "_content/_misc/about.tsx"
    },
    "/_content/_misc/b-certificate": {
      "filePath": "_content/_misc/b-certificate.tsx"
    },
    "/_content/_misc/manifesto": {
      "filePath": "_content/_misc/manifesto.tsx"
    },
    "/_content/_misc/node-network": {
      "filePath": "_content/_misc/node-network.tsx"
    },
    "/_content/_misc/professors": {
      "filePath": "_content/_misc/professors.tsx"
    },
    "/_content/_misc/terms-and-conditions": {
      "filePath": "_content/_misc/terms-and-conditions.tsx"
    },
    "/_content/_misc/under-construction": {
      "filePath": "_content/_misc/under-construction.tsx"
    },
    "/_content/courses/$courseId": {
      "filePath": "_content/courses/$courseId.tsx",
      "children": [
        "/_content/courses/$courseId/$chapterId",
        "/_content/courses/$courseId/"
      ]
    },
    "/_content/events/$eventId": {
      "filePath": "_content/events/$eventId.tsx"
    },
    "/_content/resources/bet": {
      "filePath": "_content/resources/bet.tsx"
    },
    "/_content/resources/books": {
      "filePath": "_content/resources/books.tsx"
    },
    "/_content/resources/builders": {
      "filePath": "_content/resources/builders.tsx"
    },
    "/_content/resources/conferences": {
      "filePath": "_content/resources/conferences.tsx"
    },
    "/_content/resources/glossary": {
      "filePath": "_content/resources/glossary.tsx",
      "children": [
        "/_content/resources/glossary/$wordId"
      ]
    },
    "/_content/resources/podcasts": {
      "filePath": "_content/resources/podcasts.tsx"
    },
    "/_content/tutorials/$category": {
      "filePath": "_content/tutorials/$category.tsx",
      "children": [
        "/_content/tutorials/$category/$name",
        "/_content/tutorials/$category/"
      ]
    },
    "/_content/courses/": {
      "filePath": "_content/courses/index.tsx"
    },
    "/_content/events/": {
      "filePath": "_content/events/index.tsx"
    },
    "/_content/resources/": {
      "filePath": "_content/resources/index.tsx"
    },
    "/_content/tutorials/": {
      "filePath": "_content/tutorials/index.tsx"
    },
    "/_content/_misc/professor/$professorId": {
      "filePath": "_content/_misc/professor.$professorId.tsx"
    },
    "/_content/_misc/reset-password/$token": {
      "filePath": "_content/_misc/reset-password.$token.tsx"
    },
    "/_content/_misc/validate-email/$token": {
      "filePath": "_content/_misc/validate-email.$token.tsx"
    },
    "/_content/courses/$courseId/$chapterId": {
      "filePath": "_content/courses/$courseId/$chapterId.tsx",
      "parent": "/_content/courses/$courseId"
    },
    "/_content/resources/book/$bookId": {
      "filePath": "_content/resources/book.$bookId.tsx"
    },
    "/_content/resources/builder/$builderId": {
      "filePath": "_content/resources/builder.$builderId.tsx"
    },
    "/_content/resources/conference/$conferenceId": {
      "filePath": "_content/resources/conference.$conferenceId.tsx"
    },
    "/_content/resources/glossary/$wordId": {
      "filePath": "_content/resources/glossary.$wordId.tsx",
      "parent": "/_content/resources/glossary"
    },
    "/_content/resources/podcast/$podcastId": {
      "filePath": "_content/resources/podcast.$podcastId.tsx"
    },
    "/_content/tutorials/$category/$name": {
      "filePath": "_content/tutorials/$category/$name.tsx",
      "parent": "/_content/tutorials/$category"
    },
    "/_content/courses/$courseId/": {
      "filePath": "_content/courses/$courseId/index.tsx",
      "parent": "/_content/courses/$courseId"
    },
    "/_content/tutorials/$category/": {
      "filePath": "_content/tutorials/$category/index.tsx",
      "parent": "/_content/tutorials/$category"
    }
  }
}
ROUTE_MANIFEST_END */
