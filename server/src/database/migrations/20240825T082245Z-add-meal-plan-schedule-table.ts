import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('meal_plan_schedule')
    .addColumn('meal_id', 'integer', (c) =>
      c.references('meal.id').notNull().onDelete('cascade')
    )
    .addColumn('meal_plan_id', 'integer', (c) =>
      c.references('meal_plan.id').notNull().onDelete('cascade')
    )
    .addColumn('assigned_day', 'integer', (c) =>
      c.notNull().check(sql`assigned_day >= 1 AND assigned_day <= 7`)
    )
    .addColumn('type', 'text', (c) =>
      c.notNull().check(sql`type IN ('breakfast', 'lunch', 'dinner', 'snack')`)
    )
    .addPrimaryKeyConstraint('unique_meal_plan_schedule', [
      'meal_id',
      'meal_plan_id',
      'assigned_day',
      'type',
    ])
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('meal_plan_schedule').execute()
}
