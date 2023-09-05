// @types/tableTypes/usersTable.ts

import { Knex } from 'knex';
import { User } from '../user';

declare module 'knex/types/tables' {
  interface Tables {
    users: User;
    users_composite: Knex.CompositeTableType<
      User,
      Pick<User, 'username' | 'hashedPassword' | 'isAdmin'>,
      // &
      //   Partial<Pick<User, 'created_at' | 'updated_at'>>,
      Partial<Omit<User, 'id'>>
    >;
  }
}
