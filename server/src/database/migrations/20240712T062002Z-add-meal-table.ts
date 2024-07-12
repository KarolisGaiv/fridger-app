import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable("meal")
    .addColumn("id", "integer", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("name", "text", (c) => c.notNull())
    .addColumn("calories", "integer", (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("meal").execute()
}