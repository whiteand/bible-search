import { DB } from "sqlite";
import { parseBibleModuleFromDB } from "./parseBibleModuleFromDB.ts";
import { BibleModuleId, RC } from "./types.ts";

export async function parseBibleModule(
  context: RC<
    "/api/parse-my-bible-module/:bibleModuleId",
    { bibleModuleId: string }
  >
) {
  const {
    state: { repo },
  } = context;
  const bibleModuleId = context?.params?.bibleModuleId as BibleModuleId | null;

  if (!bibleModuleId) {
    context.response.body = "bibleModuleId is absent";
    context.response.status = 400;
    return;
  }

  if (await repo.existsBibleModule(bibleModuleId)) {
    context.response.body = `Module with id ${JSON.stringify(
      bibleModuleId
    )} already exists`;
    context.response.status = 400;
    return;
  }

  const created = repo.createBibleModule(bibleModuleId);

  if (!created) {
    context.response.body =
      `Failed to atomically create bible module: ` +
      JSON.stringify(bibleModuleId);
    context.response.status = 500;
    return;
  }

  const requestBody = await context.request.body({
    type: "bytes",
    limit: 1e9,
  }).value;

  const tempFilePath = await Deno.makeTempFile().catch((error) => {
    console.error("Cannot create temporary file: " + (error as any)?.message);
    throw error;
  });

  await Deno.writeFile(tempFilePath, requestBody);

  const db = new DB(tempFilePath, { mode: "read" });

  try {
    await parseBibleModuleFromDB(repo, bibleModuleId, db);
    context.response.status = 200;
    context.response.body = JSON.stringify({
      result: "success",
    });
  } catch (error) {
    context.response.status = 400;
    context.response.body = JSON.stringify({
      error:
        `Failed to parse bible module: ` +
        (error as { message: string }).message,
    });

    console.log(error);
  } finally {
    db.close();

    await Deno.remove(tempFilePath);
  }
}
