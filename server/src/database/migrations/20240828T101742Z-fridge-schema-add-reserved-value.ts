import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .addColumn('reserved_quantity', 'integer', (c) => c.defaultTo(0).notNull())
    .dropColumn('grocery_list_id')
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('fridge_content')
    .dropColumn('reserved_quantity')
    .addColumn('grocery_list_id', 'integer')
    .execute()
}
