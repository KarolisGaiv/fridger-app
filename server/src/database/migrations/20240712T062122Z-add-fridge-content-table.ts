import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable("fridge_content")
    .addColumn("id", "integer", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("userId", "integer", (c) => c.references("user.id").notNull())
    .addColumn("grocery_list_id", "integer", (c) => c.references("grocery_list.id"))
    .addColumn("existing_quantity", "integer")
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("fridge_content").execute()
}
