import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.string('account_pin').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('accounts', (table) => {
    table.dropColumn('account_pin')
  })
}
