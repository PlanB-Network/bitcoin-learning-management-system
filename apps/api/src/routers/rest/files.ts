import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { UserPermission, UserRole } from '@blms/constants';
import { NoSuchKey } from '@blms/s3';
import {
  createCheckCoordinator,
  createGetEducatorContent,
} from '@blms/service-content';

import {
  createExamTimestampService,
  createGetAssignmentSubmitter,
  createGetCareerProfileId,
  createSetProfilePicture,
} from '@blms/service-user';
import { formatNameForURL } from '@blms/shared';
import { canAccess } from '@blms/shared/auth';
import type { Request, Response, Router } from 'express';
import formidable from 'formidable';
import JSZip from 'jszip';
import type { ResizeOptions } from 'sharp';
import sharp from 'sharp';

import type { Dependencies } from '#src/dependencies.js';
import { BadRequest, Forbidden, InternalServerError } from '#src/errors.js';
import { expressAuthMiddleware } from '#src/middlewares/auth.js';

// Files under /api/files are uploaded by users and served from the
// application origin. Only these types may be rendered by the browser; any
// other type (HTML, SVG, XML, JavaScript...) is sent as an opaque download.
const inlineContentTypes: Record<string, true> = {
  'application/pdf': true,
  'audio/mpeg': true,
  'image/gif': true,
  'image/jpeg': true,
  'image/png': true,
  'image/webp': true,
};

const defaultResizeOptions: ResizeOptions = {
  height: 200,
  width: 200,
  withoutEnlargement: true,
};

const zipStream = (zip: JSZip) => {
  return zip.generateNodeStream({
    streamFiles: true,
    type: 'nodebuffer',
  });
};

// formidable calls the parse callback from a stream event, outside of any
// try/catch: an exception thrown there is uncaught and stops the process.
// Turn it into a rejection of the upload promise (then a 4xx/5xx response).
const rejectOnThrow = <A extends unknown[]>(
  reject: (error: unknown) => void,
  callback: (...args: A) => void,
) => {
  return (...args: A) => {
    try {
      callback(...args);
    } catch (error) {
      reject(error);
    }
  };
};

const receiveImage = (
  req: Request,
  resizeOptions: ResizeOptions | null = defaultResizeOptions,
) => {
  return new Promise<Readable>((resolve, reject) => {
    let sharpStream = sharp();
    if (resizeOptions) {
      sharpStream = sharpStream.resize(resizeOptions);
    }
    sharpStream = sharpStream.webp();

    const form = formidable({
      fileWriteStreamHandler: () => sharpStream,
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(
        req,
        rejectOnThrow(reject, (err, _fields, files) => {
          if (err) {
            throw new BadRequest('Failed to parse form data');
          }

          if (files.file?.length !== 1) {
            throw new BadRequest('Invalid number of files');
          }

          const [file] = files.file;

          // Sanity check
          if (!req.session.uid) {
            throw new InternalServerError('Missing session uid');
          }

          if (!file.mimetype) {
            throw new InternalServerError('Missing file mimetype');
          }

          if (!file.originalFilename) {
            throw new InternalServerError('Missing file name');
          }

          resolve(sharpStream);
        }),
      );
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

const receivePdf = (req: Request) => {
  return new Promise<Readable>((resolve, reject) => {
    const form = formidable({
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(
        req,
        rejectOnThrow(reject, (err, _, files) => {
          if (err) {
            throw new BadRequest('Failed to parse form data');
          }

          if (files.file?.length !== 1) {
            throw new BadRequest('Invalid number of files');
          }

          const [file] = files.file;

          // Sanity check
          if (!req.session.uid) {
            throw new InternalServerError('Missing session uid');
          }

          if (!file.mimetype) {
            throw new InternalServerError('Missing file mimetype');
          }

          if (file.mimetype !== 'application/pdf') {
            throw new BadRequest('Invalid file type');
          }

          if (!file.originalFilename) {
            throw new InternalServerError('Missing file name');
          }

          // Size limit
          if (file.size > 10 * 1024 * 1024) {
            throw new BadRequest('File too large');
          }

          // Validate file is within the OS temp directory (formidable default)
          const tempDir = os.tmpdir();
          let resolvedPath: string;
          try {
            resolvedPath = fs.realpathSync(path.resolve(file.filepath));
          } catch (_e) {
            throw new BadRequest('Invalid file path');
          }
          if (!resolvedPath.startsWith(path.resolve(tempDir))) {
            throw new BadRequest('Disallowed file path');
          }
          const fileStream = fs.createReadStream(resolvedPath);
          resolve(fileStream);
        }),
      );
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

const receiveGenericFile = (req: Request) => {
  return new Promise<{
    stream: Readable;
    mimetype: string;
    originalFilename: string;
  }>((resolve, reject) => {
    const form = formidable({
      multiples: false,
    });

    try {
      form.parse<never, 'file'>(
        req,
        rejectOnThrow(reject, (err, _, files) => {
          if (err) {
            throw new BadRequest('Failed to parse form data');
          }

          if (files.file?.length !== 1) {
            throw new BadRequest('Invalid number of files');
          }

          const [file] = files.file;

          // Sanity check
          if (!req.session.uid) {
            throw new InternalServerError('Missing session uid');
          }

          if (!file.mimetype) {
            throw new InternalServerError('Missing file mimetype');
          }

          if (!file.originalFilename) {
            throw new InternalServerError('Missing file name');
          }

          // Size limit (50MB)
          if (file.size > 50 * 1024 * 1024) {
            throw new BadRequest('File too large');
          }

          // Validate file is within the OS temp directory (formidable default)
          const tempDir = os.tmpdir();
          let resolvedPath: string;
          try {
            resolvedPath = fs.realpathSync(path.resolve(file.filepath));
          } catch (_e) {
            throw new BadRequest('Invalid file path');
          }
          if (!resolvedPath.startsWith(path.resolve(tempDir))) {
            throw new BadRequest('Disallowed file path');
          }
          const fileStream = fs.createReadStream(resolvedPath);

          resolve({
            stream: fileStream,
            mimetype: file.mimetype,
            originalFilename: file.originalFilename,
          });
        }),
      );
    } catch (error) {
      req.log('Error:', error);
      reject(error);
    }
  });
};

export const createRestFilesRoutes = async (
  dependencies: Dependencies,
  router: Router,
) => {
  const setProfilePicture = createSetProfilePicture(dependencies);
  router.post(
    '/user-file/profile-picture',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveImage(req)
        .then((stream) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`user-files/${id}`, stream, { contentType: 'image/webp' })
            .then(() => id);
        })
        .then((fileId) => setProfilePicture(uid, fileId))
        .then((result) => res.json(result))
        .catch(next);
    },
  );

  router.post(
    '/educator-content/cover',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveImage(req, null)
        .then((stream) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`contribute/cover/${id}`, stream, {
              contentType: 'image/webp',
            })
            .then(() => id);
        })
        .then((fileId) => res.json({ id: fileId }))
        .catch(next);
    },
  );

  router.post(
    '/educator-content/file',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }

      receiveGenericFile(req)
        .then(({ stream, mimetype }) => {
          const id = randomUUID();

          return dependencies.s3
            .upload(`contribute/educator-content/${id}`, stream, {
              // Never store a client-declared type we would not serve as is
              contentType:
                inlineContentTypes[mimetype] === true
                  ? mimetype
                  : 'application/octet-stream',
            })
            .then(() => id);
        })
        .then((fileId) => res.json({ id: fileId }))
        .catch(next);
    },
  );

  router.get('/educator-content/download-all/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const getEducatorContent = createGetEducatorContent(dependencies as any);
      const content = await getEducatorContent(undefined, undefined, id);
      const item = content[0];

      if (!item || !item.files || item.files.length === 0) {
        res.status(404).send('No files found');
        return;
      }

      if (!item || !item.files || item.files.length === 0) {
        res.status(404).send('No files found');
        return;
      }

      const zip = new JSZip();
      await Promise.all(
        item.files.map(async (file) => {
          const blob = await dependencies.s3.getBlob(
            `contribute/educator-content/${file.path}`,
          );
          if (blob) {
            zip.file(file.name, blob);
          }
        }),
      );

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${item.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}_files.zip"`,
      );
      zipStream(zip).pipe(res);
    } catch (error) {
      next(error);
    }
  });

  const getCareerProfileId = createGetCareerProfileId(dependencies);
  const getAssignmentSubmitter = createGetAssignmentSubmitter(dependencies);
  const checkCoordinator = createCheckCoordinator(dependencies);

  const isAdmin = (req: Request, permission?: UserPermission) => {
    const { role, permissions } = req.session;
    return (
      !!role && canAccess(UserRole.Admin, permission)({ permissions, role })
    );
  };

  // CVs and submitted assignments are personal data: only the authenticated
  // routes below serve them, never /files/:dir/*.
  const sendPrivatePdf = async (
    res: Response,
    key: string,
    fileName: string,
  ) => {
    const stream = await dependencies.s3.getStream(key);
    if (!stream) {
      res.status(404).send('Not found');
      return;
    }

    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    );
    stream.pipe(res);
  };

  // A user uploads the CV of their own career profile only
  router.post('/career/cvs/:key', expressAuthMiddleware, (req, res, next) => {
    const uid = req.session.uid;

    // Sanity check
    if (!uid) {
      throw new InternalServerError('Missing session uid');
    }

    getCareerProfileId({ uid })
      .then((profileId) => {
        if (!profileId || profileId !== req.params.key) {
          throw new Forbidden('This is not your career profile');
        }

        return receivePdf(req).then((stream) =>
          dependencies.s3.upload(`cvs/${profileId}`, stream, {
            contentType: 'application/pdf',
          }),
        );
      })
      .then(() => res.json())
      .catch(next);
  });

  // A CV is readable by the owner of the career profile and career admins
  router.get(
    '/files/cvs/:profileId',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const uid = req.session.uid;
        const { profileId } = req.params;

        // Sanity check
        if (!uid) {
          throw new InternalServerError('Missing session uid');
        }

        const ownProfileId = await getCareerProfileId({ uid });
        if (
          profileId !== ownProfileId &&
          !isAdmin(req, UserPermission.Career)
        ) {
          throw new Forbidden();
        }

        await sendPrivatePdf(res, `cvs/${profileId}`, 'cv.pdf');
      } catch (error) {
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }

        next(error);
      }
    },
  );

  const submissionKey = (courseId: string, assignmentId: string, uid: string) =>
    `course-assignments/${courseId}/submitted/${assignmentId}/${uid}.pdf`;

  // The object key comes from the caller and the assignment they were given
  // in this course, never from the client. Academy builds released before
  // this change still append their own file name: it is ignored.
  router.post(
    '/course-assignments/submit/:courseId/:ignoredKey?',
    expressAuthMiddleware,
    (req, res, next) => {
      const uid = req.session.uid;
      const { courseId } = req.params as { courseId: string };

      // Sanity check
      if (!uid) {
        throw new InternalServerError('Missing session uid');
      }
      if (!courseId) {
        throw new BadRequest('Missing courseId');
      }

      getAssignmentSubmitter({ courseId, uid })
        .then((submitter) => {
          if (!submitter) {
            throw new Forbidden('No assignment to submit in this course');
          }

          return receivePdf(req).then((stream) =>
            dependencies.s3.upload(
              submissionKey(courseId, submitter.assignmentId, uid),
              stream,
              { contentType: 'application/pdf' },
            ),
          );
        })
        .then(() => res.json())
        .catch(next);
    },
  );

  // A submission is readable by its author, the coordinators of the course
  // and admins
  router.get(
    '/course-assignments/:courseId/submissions/:uid',
    expressAuthMiddleware,
    async (req, res, next) => {
      try {
        const callerUid = req.session.uid;
        const { courseId, uid } = req.params as {
          courseId: string;
          uid: string;
        };

        // Sanity check
        if (!callerUid) {
          throw new InternalServerError('Missing session uid');
        }

        const allowed =
          callerUid === uid ||
          isAdmin(req) ||
          (await checkCoordinator({ courseId, userId: callerUid }));
        if (!allowed) {
          throw new Forbidden();
        }

        const submitter = await getAssignmentSubmitter({ courseId, uid });
        if (!submitter) {
          res.status(404).send('Not found');
          return;
        }

        // Readable name, and the key the academy itself chose for
        // submissions uploaded before keys were derived by the server
        const fileName = `${formatNameForURL(submitter.assignmentName ?? '')}_${formatNameForURL(submitter.username)}.pdf`;

        try {
          await sendPrivatePdf(
            res,
            submissionKey(courseId, submitter.assignmentId, uid),
            fileName,
          );
        } catch (error) {
          if (!(error instanceof NoSuchKey)) {
            throw error;
          }

          await sendPrivatePdf(
            res,
            `course-assignments/${courseId}/submitted/${fileName}`,
            fileName,
          );
        }
      } catch (error) {
        if (error instanceof NoSuchKey) {
          res.status(404).send('Not found');
          return;
        }

        next(error);
      }
    },
  );

  // Get all B-Cert files in a zip; typical key will be <exam-id>/<user-id>
  router.get('/files/zip/bcert/:edition/:username', async (req, res, next) => {
    try {
      const { edition, username } = req.params;
      const key = `${edition}/${username}`;

      const keys = [
        `bcertresults/${key}/bitcoin_certificate-signed.pdf`,
        `bcertresults/${key}/bitcoin_certificate-signed.txt`,
        `bcertresults/${key}/bitcoin_certificate-signed.txt.ots`,
      ];

      const [pdfFile, txtFile, otsFile] = await Promise.all(
        keys.map((key) => dependencies.s3.getBlob(key)),
      );

      if (!pdfFile || !txtFile || !otsFile) {
        res.status(404).send('Not found');
        return;
      }

      const zip = new JSZip();

      zip.file('certificate.pdf', pdfFile);
      zip.file('certificate.txt', txtFile);
      zip.file('certificate.txt.ots', otsFile);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="bcert.zip"`);

      zipStream(zip).pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });

  const timeStampService = await createExamTimestampService(dependencies);

  // Get zip for certificates
  router.get('/files/zip/diplomas/:key', async (req, res, next) => {
    try {
      const { key } = req.params;

      const timestamp = await timeStampService!.getExamTimestamp(key);

      let pdfFile: any;
      try {
        pdfFile = await dependencies.s3.getBlob(
          `certificates/${timestamp.id}.pdf`,
        );
      } catch (error) {
        if (error instanceof NoSuchKey) {
          pdfFile = await dependencies.s3.getBlob(
            `certificates/${timestamp.examAttemptId}.pdf`,
          );
        } else {
          throw error;
        }
      }

      const otsFile = timestamp.ots;
      const txtFile = timestamp.txt;

      if (!pdfFile || !otsFile || !txtFile) {
        res.status(404).send('Not found');
        return;
      }

      const zip = new JSZip();

      zip.file('diploma.pdf', pdfFile);
      zip.file('diploma.txt', txtFile);
      zip.file('diploma.txt.ots', otsFile);

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="diploma.zip"`,
      );

      zipStream(zip).pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });

  // Fetch single file from S3
  router.get('/files/:dir/*', async (req, res, next) => {
    try {
      const params = req.params as unknown as { dir: string; 0: string };
      const dir = params.dir;
      const key = params[0];

      const allowedBuckets = [
        'certificates',
        'course-assignments',
        'bcertresults',
        'user-files',
        'contribute',
        'resources',
      ];
      if (!allowedBuckets.includes(dir)) {
        res.status(401).send('Unauthorized');
        return;
      }

      // Submitted assignments are only served by the route that checks who
      // is asking. S3 collapses repeated slashes, and dot segments could be
      // resolved by a proxy or the storage provider: refuse them.
      const segments = key.split('/');
      if (
        segments.includes('.') ||
        segments.includes('..') ||
        (dir === 'course-assignments' && segments.includes('submitted'))
      ) {
        res.status(404).send('Not found');
        return;
      }

      const head = await dependencies.s3.head(`${dir}/${key}`);
      const inline =
        !!head.contentType && inlineContentTypes[head.contentType] === true;

      res.setHeader(
        'Content-Type',
        inline && head.contentType
          ? head.contentType
          : 'application/octet-stream',
      );
      res.setHeader('X-Content-Type-Options', 'nosniff');
      // Chrome refuses to open a PDF in its viewer under a sandbox policy;
      // a PDF served with nosniff cannot run script on this origin anyway.
      if (head.contentType !== 'application/pdf') {
        res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      }

      const { fileName } = req.query;
      const fileNameParam =
        typeof fileName === 'string' && fileName
          ? `; filename*=UTF-8''${encodeURIComponent(fileName)}`
          : '';
      res.setHeader(
        'Content-Disposition',
        `${inline ? 'inline' : 'attachment'}${fileNameParam}`,
      );

      const stream = await dependencies.s3.getStream(`${dir}/${key}`);
      if (!stream) {
        res.status(404).send('Not found');
        return;
      }

      stream.pipe(res);
    } catch (error) {
      req.log('Error:', error);
      if (error instanceof NoSuchKey) {
        res.status(404).send('Not found');
        return;
      }

      next(error);
    }
  });
};
