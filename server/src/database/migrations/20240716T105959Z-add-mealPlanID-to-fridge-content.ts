import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .addColumn('meal_plan', 'integer', (c) =>
      c.references('meal_plan.id').notNull().onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .dropColumn('meal_plan')
    .execute()
}
