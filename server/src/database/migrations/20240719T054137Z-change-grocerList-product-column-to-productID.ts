import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('grocery_list')
    .addColumn('ingredientId', 'integer', (c) =>
      c.references('ingredient.id').notNull().onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('grocery_list')
    .dropColumn('ingredientId')
    .execute()
}
