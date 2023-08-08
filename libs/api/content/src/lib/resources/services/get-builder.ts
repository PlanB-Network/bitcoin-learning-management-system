import { firstRow } from "@sovereign-university/database";
import { Dependencies } from "../../dependencies";
import { getBuilderQuery } from "../queries";
import { computeAssetCdnUrl } from "../../utils";

export const createGetBuilder =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const builder = await postgres
      .exec(getBuilderQuery(id, language))
      .then(firstRow);

    if (builder) {
      return {
        ...builder,
        logo: computeAssetCdnUrl(
          process.env['CDN_URL'] || 'http://localhost:8080',
          builder.last_commit,
          builder.path,
          'logo.jpeg'
        ),
      };
    }

    return;
  };