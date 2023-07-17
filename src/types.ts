import { RouteParams, RouterContext } from "oak";
import { Repository } from "./Repository.ts";

export type Nominal<T, B extends string> = T & { [key in B]: key };

export interface IBibleSearchContextState {
  repo: Repository;
}

export type BibleModuleId = Nominal<string, "Bible Module Id">;

// RouterContext
export type RC<P extends string, Params extends RouteParams<P>> = RouterContext<
  P,
  Params & Record<string | number, string | undefined>,
  IBibleSearchContextState
>;
