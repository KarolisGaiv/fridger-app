import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .addColumn('ingredientId', 'integer', (c) =>
      c.references('ingredient.id').notNull().onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .dropColumn('ingredientId')
    .execute()
}
