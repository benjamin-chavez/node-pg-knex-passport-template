import { Knex } from 'knex';

const TABLE_NAME = 'federated_credentials';

exports.up = function (knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id');
    // table.integer('user_id').notNullable();
    // table.foreign('user_id').references('id').inTable('users').notNullable();
    // .onDelete('CASCADE');
    table.integer('user_id').references('id').inTable('users').notNullable();

    table.string('provider').notNullable();
    table.string('subject').notNullable();

    table.primary(['provider', 'subject']);

    table.index('user_id');
  });
};

exports.down = function (knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists(TABLE_NAME);
};
