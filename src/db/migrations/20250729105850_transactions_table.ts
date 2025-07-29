import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary()
    table.uuid('reference').notNullable().unique()

    table
      .integer('sender_account_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('accounts')
      .onDelete('SET NULL')

    table
      .integer('receiver_account_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('accounts')
      .onDelete('SET NULL')

    table.enu('type', ['funding', 'transfer', 'withdrawal']).notNullable()
    table.decimal('amount', 14, 2).notNullable()
    table.enu('status', ['pending', 'success', 'failed']).defaultTo('success')
    table.string('description').nullable()
    table.string('narration').nullable()
    table.enu('channel', ['wallet', 'card', 'bank', 'ussd']).defaultTo('wallet')
    table.string('currency', 3).defaultTo('NGN')
    table.boolean('is_reversed').defaultTo(false)
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('transactions')
}
