import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('accounts', (table) => {
    table.increments('id').primary()
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
    table.string('account_number', 20).unique().notNullable()
    table.string('account_type').defaultTo('wallet')
    table.decimal('balance', 14, 2).defaultTo(0.0)
    table.string('status').defaultTo('active') // active, suspended, closed
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('accounts')
}
