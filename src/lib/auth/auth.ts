import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';

import { db } from '@/lib/db';
import * as schema from '@/schema';
import { AppConfig } from '@/utils/appConfig';

export const auth = betterAuth({
  appName: AppConfig.name,
  plugins: [
    organization(),
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,
      organization: schema.organization,
      member: schema.member,
      invitation: schema.invitation,
    },
  }),
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session: any) => {
          const member = await db.query.member.findFirst({
            where: (member, { eq }) => eq(member.userId, session.userId),
          });
          return {
            data: {
              ...session,
              activeOrganizationId: member?.organizationId || null,
            },
          };
        },
      },
    },
  },
});
