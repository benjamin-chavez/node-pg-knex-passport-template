import { Knex } from 'knex';
import argon2 from 'argon2';

const TABLE_NAME = 'users';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex(TABLE_NAME).del();

  // Inserts seed entries
  const hashedPassword = await argon2.hash('password');
  await knex(TABLE_NAME).insert([
    { username: 'adminUser', hashedPassword: hashedPassword, isAdmin: true },
  ]);
}
