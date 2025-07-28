import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary()
    table.string('password').notNullable()
    table.string('username').notNullable().unique()
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
    table.string('phone_number').notNullable().unique()
    table.string('email').notNullable().unique()
    table.boolean('email_verified').notNullable().defaultTo(false)
    table.string('bvn', 20).nullable()
    table.date('dob').nullable()
    table.string('profile_pic').nullable()

    table.string('address').nullable()
    table.string('apartment_type').nullable()
    table.string('nearest_landmark').nullable()
    table.string('city').nullable()
    table.string('state').nullable()
    table.string('lga').nullable()

    table.string('country', 3).defaultTo('NGA')
    table.string('language', 5).defaultTo('en')
    table.string('locale', 10).defaultTo('en-US')
    table.string('timezone').defaultTo('Africa/Lagos')

    table.string('gender').nullable()
    table.string('marital_status').nullable()
    table.string('occupation').nullable()
    table.string('employment_status').nullable()

    table.boolean('verified').defaultTo(false)
    table.timestamp('verified_on').nullable()
    table.timestamp('last_login_date').nullable()

    table.boolean('blacklisted').defaultTo(false)

    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('users')
}
