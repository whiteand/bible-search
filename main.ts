import { Application, Router } from "oak";
import { oakCors } from "oakCors";
import data from "./data.json" assert { type: "json" };
import { Repository } from "./src/Repository.ts";
import { parseBibleModule } from "./src/parseBibleModule.ts";
import { BibleModuleId, IBibleSearchContextState } from "./src/types.ts";

const router = new Router<IBibleSearchContextState>();
router
  .get("/", (context) => {
    context.response.body = "Welcome to dinosaur API!";
  })
  .get("/api", (context) => {
    context.response.body = data;
  })
  .get("/api/bible-module/:bibleModuleId/info", async (context) => {
    const bibleModuleId = context.params.bibleModuleId as BibleModuleId;
    if (!(await context.state.repo.existsBibleModule(bibleModuleId))) {
      context.response.body = JSON.stringify({
        error:
          "There is no bible module with id " + JSON.stringify(bibleModuleId),
      });
      context.response.status = 404;
      return;
    }

    const info = await context.state.repo.getBibleModuleInfo(bibleModuleId);

    context.response.body = JSON.stringify({
      result: info,
    });
    context.response.status = 200;
  })
  .get("/api/bible-module/:bibleModuleId/info/:infoParam", async (context) => {
    const bibleModuleId = context.params.bibleModuleId as BibleModuleId;
    if (!(await context.state.repo.existsBibleModule(bibleModuleId))) {
      context.response.body = JSON.stringify({
        error:
          "There is no bible module with id " + JSON.stringify(bibleModuleId),
      });
      context.response.status = 404;
      return;
    }

    const info = await context.state.repo.getBibleModuleInfoItem(
      bibleModuleId,
      context.params.infoParam
    );

    context.response.body = JSON.stringify({
      result: info,
    });
    context.response.status = 200;
  })
  .delete("/api/bible-module/:bibleModuleId", async (context) => {
    const bibleModuleId = context.params.bibleModuleId as BibleModuleId;
    await context.state.repo.removeBibleModule(bibleModuleId).then(
      () => {
        context.response.body = JSON.stringify({
          result: {
            status: "success",
            bibleModuleId: context.params.bibleModuleId,
          },
        });
        context.response.status = 200;
      },
      () => {
        context.response.body = JSON.stringify({
          error: "failed to remove bible module id, something intercepted",
        });
        context.response.status = 500;
      }
    );
  })
  .post("/api/parse-my-bible-module/:bibleModuleId", parseBibleModule);

const kv = await Deno.openKv();

const state: IBibleSearchContextState = {
  repo: new Repository(kv),
};

const app = new Application({
  contextState: "prototype",
  state,
});

app.use(oakCors()); // Enable CORS for All Routes
app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
