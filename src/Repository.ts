import {
  getBibleModuleIdKey,
  getBibleModuleInfoItemKey,
  getBibleModuleInfoKey,
  getBibleModuleKey,
} from "./keys.ts";
import { BibleModuleId } from "./types.ts";

export class Repository {
  constructor(private db: Deno.Kv) {}

  public existsBibleModule(bibleModuleId: BibleModuleId): Promise<boolean> {
    return this.db
      .get(getBibleModuleIdKey(bibleModuleId))
      .then((entry) => entry.value != null);
  }

  public getBibleModuleInfoItem(
    bibleModuleId: BibleModuleId,
    name: string
  ): Promise<string | null> {
    return this.db
      .get(getBibleModuleInfoItemKey(bibleModuleId, name))
      .then((entry) => (typeof entry.value === "string" ? entry.value : null));
  }

  public async getBibleModuleInfo(
    bibleModuleId: BibleModuleId
  ): Promise<Record<string, string>> {
    const res: Record<string, string> = {};

    for await (const entry of this.db.list({
      prefix: getBibleModuleInfoKey(bibleModuleId),
    })) {
      const key = entry.key as ReturnType<typeof getBibleModuleInfoItemKey>;
      const name = key[3];
      const value = entry.value as string;
      res[name] = value;
    }

    return res;
  }

  async removeBibleModule(bibleModuleId: BibleModuleId): Promise<void> {
    for await (const { key } of this.db.list({
      prefix: getBibleModuleKey(bibleModuleId),
    })) {
      await this.db.delete(key);
    }

    return;
  }

  setBibleModuleInfo(
    bibleModuleId: BibleModuleId,
    name: string,
    value: string
  ): Promise<Deno.KvCommitResult> {
    return this.db.set(getBibleModuleInfoItemKey(bibleModuleId, name), value);
  }
  async createBibleModule(bibleModuleId: BibleModuleId): Promise<boolean> {
    const bibleModuleIdKey = getBibleModuleIdKey(bibleModuleId);
    const bibleModuleIdEntry = await this.db.get(bibleModuleIdKey);
    if (bibleModuleIdEntry.value != null) {
      return false;
    }

    const atomic = this.db
      .atomic()
      .check({
        key: bibleModuleIdEntry.key,
        versionstamp: bibleModuleIdEntry.versionstamp,
      })
      .set(bibleModuleIdKey, bibleModuleId);

    return atomic.commit().then((response) => response.ok);
  }
}
