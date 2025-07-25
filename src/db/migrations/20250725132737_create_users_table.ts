import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('email').unique().notNullable()
    table.string('password').notNullable()
    table.boolean('isVerified').notNullable().defaultTo(false)
    table.boolean('isBlacklisted').notNullable().defaultTo(false)
    table.string('phoneNumber').nullable()
    table.string('profilePicture').nullable()
    table.string('address').nullable()
    table.timestamps(true, true) // this adds created_at and updated_at
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users')
}
