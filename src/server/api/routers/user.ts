import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { createToken } from "~/lib/auth";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { loginFormSchema } from "~/schema/loginFormsSchema";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        const otp = Math.floor(10000000 + Math.random() * 90000000).toString();

        const user = await ctx.db.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            otp,
            isVerified: false,
          },
        });

        const sentFrom = new Sender(
          "kuldeep@trial-0r83ql3vrovgzw1j.mlsender.net",
          "Kuldeep",
        );
        const recipients = [new Recipient(input.email, input.name)];
        const emailParams = new EmailParams()
          .setFrom(sentFrom)
          .setTo(recipients)
          .setSubject("Verify your email")
          .setHtml(`<p>Your verification code is: <strong>${otp}</strong></p>`)
          .setText(`Your verification code is: ${otp}`);

        await mailerSend.email.send(emailParams);

        return { userId: user.id };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An error occurred during registration",
          cause: error,
        });
      }
    }),

  verifyEmail: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        otp: z.string().length(8),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user || user.otp !== input.otp) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid OTP" });
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { isVerified: true, otp: null },
      });

      const token = await createToken({ id: user.id });
      return { token };
    }),

  login: publicProcedure
    .input(loginFormSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user || !(await bcrypt.compare(input.password, user?.password))) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const token = await createToken({ id: user.id });
      return { token };
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({ where: { id: ctx.user.id } });
    return user;
  }),

  updateInterests: protectedProcedure
    .input(
      z.object({
        categoryId: z.string(),
        interested: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.interested) {
        await ctx.db.userCategory.create({
          data: {
            userId: ctx.user.id,
            categoryId: input.categoryId,
          },
        });
      } else {
        await ctx.db.userCategory.delete({
          where: {
            userId_categoryId: {
              userId: ctx.user.id,
              categoryId: input.categoryId,
            },
          },
        });
      }
      return { success: true };
    }),

  getCategories: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(6),
      }),
    )
    .query(async ({ ctx, input }) => {
      const total = await ctx.db.category.count();
      const categories = await ctx.db.category.findMany({
        take: input.pageSize,
        skip: (input.page - 1) * input.pageSize,
        include: {
          interestedUsers: {
            where: { userId: ctx.user.id },
            select: { userId: true },
          },
        },
      });

      return {
        categories: categories.map((cat) => ({
          ...cat,
          isInterested: cat.interestedUsers.length > 0,
        })),
        total,
        page: input.page,
        pageSize: input.pageSize,
      };
    }),

  getUserEmail: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: input.userId },
        select: { email: true },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { email: user.email };
    }),
});
