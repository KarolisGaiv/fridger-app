import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('meal_ingredient')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('mealId', 'integer', (c) =>
      c.notNull().references('meal.id').onDelete('cascade')
    )
    .addColumn('ingredientId', 'integer', (c) =>
      c.notNull().references('ingredient.id').onDelete('cascade')
    )
    .addColumn('quantity', 'integer', (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('meal_ingredient').execute()
}
