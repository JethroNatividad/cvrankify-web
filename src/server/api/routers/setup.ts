import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const setupRouter = createTRPCRouter({
  userCount: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.count();
  }),
});
