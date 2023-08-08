import { firstRow } from "@sovereign-university/database";
import { Dependencies } from "../../dependencies";
import { getBookQuery } from "../queries";
import { computeAssetCdnUrl } from "../../utils";

export const createGetBook =
  (dependencies: Dependencies) => async (id: number, language?: string) => {
    const { postgres } = dependencies;

    const book = await postgres.exec(getBookQuery(id, language)).then(firstRow);

    if (book) {
      return {
        ...book,
        cover: book.cover
          ? computeAssetCdnUrl(
              process.env['CDN_URL'] || 'http://localhost:8080',
              book.last_commit,
              book.path,
              book.cover
            )
          : undefined,
      };
    }

    return;
  };