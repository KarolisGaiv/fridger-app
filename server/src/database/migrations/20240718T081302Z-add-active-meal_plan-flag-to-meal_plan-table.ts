import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('meal_plan')
    .addColumn('isActive', 'boolean', (c) => c.defaultTo(true))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('meal_plan').dropColumn('isActive').execute()
}
