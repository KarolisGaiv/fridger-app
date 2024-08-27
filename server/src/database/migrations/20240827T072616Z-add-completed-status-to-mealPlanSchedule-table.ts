import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('meal_plan_schedule')
    .addColumn('completed', 'boolean', (c) => c.defaultTo(false).notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('meal_plan_schedule')
    .dropColumn('completed')
    .execute()
}
