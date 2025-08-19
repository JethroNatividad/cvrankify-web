import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import bcrypt from "bcryptjs";

export const setupRouter = createTRPCRouter({
  userCount: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.user.count();
  }),

  createUser: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user email already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new Error("email:User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          isAdmin: true,
        },
      });
      return user;
    }),
});
