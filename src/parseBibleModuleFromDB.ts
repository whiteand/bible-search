import { DB, PreparedQuery } from "sqlite";
import { BibleModuleId } from "./types.ts";
import { Repository } from "./Repository.ts";

function prepareInfoQuery(db: DB): PreparedQuery<
  [string, string],
  {
    name: string;
    value: string;
  },
  []
> {
  return db.prepareQuery<[string, string], { name: string; value: string }, []>(
    "SELECT name, value FROM info"
  );
}

export async function parseBibleModuleFromDB(
  repo: Repository,
  bibleModuleId: BibleModuleId,
  bibleModuleDB: DB
): Promise<BibleModuleId> {
  const query = prepareInfoQuery(bibleModuleDB);

  for (const record of query.iterEntries()) {
    await repo.setBibleModuleInfo(bibleModuleId, record.name, record.value);
  }

  query.finalize();

  return bibleModuleId;
}
