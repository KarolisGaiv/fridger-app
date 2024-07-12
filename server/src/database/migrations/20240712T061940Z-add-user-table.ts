import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('user')
    .addColumn('id', 'integer', (c) =>
      c.primaryKey().generatedAlwaysAsIdentity()
    )
    .addColumn('first_name', 'text', (c) => c.notNull())
    .addColumn('last_name', 'text', (c) => c.notNull())
    .addColumn('email', 'text', (c) => c.unique().notNull())
    .addColumn('password', 'text', (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('user').execute()
}
