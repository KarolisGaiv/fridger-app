import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('ingredient')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('name', 'text', (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('ingredient').execute()
}
