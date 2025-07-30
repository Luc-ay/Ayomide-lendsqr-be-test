import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transactions', (table) => {
    table.enu('type', ['credit', 'debit']).notNullable()
    table.enu('category', ['funding', 'transfer', 'withdrawal']).notNullable()
    table.string('group_reference').nullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('transactions', (table) => {
    table.dropColumn('type')
    table.dropColumn('category')
    table.dropColumn('group_reference')
  })
}
