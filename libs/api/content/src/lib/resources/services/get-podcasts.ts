import { Dependencies } from "../../dependencies";
import { getPodcastsQuery } from "../queries";
import { computeAssetCdnUrl } from "../../utils";

export const createGetPodcasts =
  (dependencies: Dependencies) => async (language?: string) => {
    const { postgres } = dependencies;

    const result = await postgres.exec(getPodcastsQuery(language));

    return result.map((row) => ({
      ...row,
      logo: computeAssetCdnUrl(
        process.env['CDN_URL'] || 'http://localhost:8080',
        row.last_commit,
        row.path,
        'logo.jpeg'
      ),
    }));
  };