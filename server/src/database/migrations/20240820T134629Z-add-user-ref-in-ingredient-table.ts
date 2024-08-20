import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('ingredient')
    .addColumn('user', 'integer', (c) =>
      c.references('user.id').notNull().onDelete('cascade')
    )
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.alterTable('ingredient').dropColumn('user').execute()
}
