import type { Context } from "@netlify/functions";
// @ts-expect-error — bundled at deploy time
import handler from "../../dist/server/main.mjs";

export default async (request: Request, _context: Context): Promise<Response> => {
  return await (handler as (req: Request) => Promise<Response>)(request);
};

export const config = {
  path: "/*",
  preferStatic: true,
};
