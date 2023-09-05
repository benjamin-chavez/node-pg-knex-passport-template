import { Knex } from 'knex';

exports.up = function (knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').unique();
    table.string('hashedPassword');
    table.boolean('isAdmin').notNullable().defaultTo(false);
  });
};

exports.down = function (knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users');
};
