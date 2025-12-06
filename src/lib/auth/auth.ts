import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';

import { db } from '@/lib/db';
import * as schema from '@/schema';
import { AppConfig } from '@/utils/appConfig';
import { ac, admin, member, owner } from './permissions';

export const auth = betterAuth({
  appName: AppConfig.name,
  plugins: [
    organization({
      ac,
      roles: {
        owner,
        admin,
        member,
      },
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      // auth.ts
      user: schema.userTable,
      session: schema.sessionTable,
      account: schema.accountTable,
      verification: schema.verificationTable,

      // organization.ts
      organization: schema.organizationTable,
      organizationRole: schema.organizationRoleTable,
      member: schema.memberTable,
      invitation: schema.invitationTable,
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
          const member = await db.query.memberTable.findFirst({
            where: (member, { eq }) => eq(member.userId, session.userId),
          });
          return {
            data: {
              ...session,
              activeOrganizationId: member?.organizationId || null,
              role: member?.role || null,
            },
          };
        },
      },
    },
  },
  trustedOrigins: [
    'https://*.vercel.app', // trust all HTTPS subdomains of vercel.app, for preview deployments
  ],
});
