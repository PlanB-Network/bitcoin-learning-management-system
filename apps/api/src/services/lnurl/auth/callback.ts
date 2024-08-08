import { createHmac } from 'node:crypto';

import * as secp256k1 from 'secp256k1';

import { createGetUser, createNewLnurlUser } from '@blms/service-user';

import type { Dependencies } from '../../../dependencies.js';

export const createCallbackLnurlAuth =
  (dependencies: Dependencies) =>
  async ({
    tag,
    k1,
    sig,
    key,
    hmac,
  }: {
    tag: string;
    k1: string;
    sig: string;
    key: string;
    hmac: string;
  }) => {
    const { events, redis } = dependencies;

    const getUser = createGetUser(dependencies);
    const newLnurlUser = createNewLnurlUser(dependencies);

    const findOrCreateUser = async () => {
      const user = await getUser({ lud4PublicKey: key });

      if (!user) {
        return newLnurlUser({ publicKey: key });
      }
      return user;
    };

    console.log({ k1Received: k1 });

    const challenge = await redis.get(`lnurl-auth:${k1}`);
    if (!challenge) {
      return {
        status: 'ERROR',
        reason: "This challenge doesn't exist or has already been used",
      };
    }

    // Verify the parameters integrity
    const parametersSig = createHmac('sha256', 'secret')
      .update(`${tag}${k1}`)
      .digest('hex');

    if (parametersSig !== hmac) {
      return {
        status: 'ERROR',
        reason: 'Invalid parameters: signature mismatch',
      };
    }

    const signatureOk = secp256k1.ecdsaVerify(
      secp256k1.signatureImport(Buffer.from(sig, 'hex')),
      Buffer.from(k1, 'hex'),
      Buffer.from(key, 'hex'),
    );

    if (!signatureOk) {
      return {
        status: 'ERROR',
        reason: 'Invalid signature',
      };
    }

    const { uid } = await findOrCreateUser();

    await redis.del(`lnurl-auth:${k1}`);

    await redis.set(`session:${challenge.sessionId}`, {
      ...challenge.session,
      uid,
    });

    events.emit('lnurl-auth:logged', { sessionId: challenge.sessionId, uid });

    console.log(`Callback ${challenge.sessionId}`);

    return {
      status: 'OK',
    };
  };
