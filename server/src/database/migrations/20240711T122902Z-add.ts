import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .createTable("grocery_list")
    .addColumn("id", "integer", (c) => c.primaryKey().generatedAlwaysAsIdentity())
    .addColumn("meal_plan_id", "integer", (c) => c.references("meal_plans.id"))
    .addColumn("product", "text", (c) => c.notNull())
    .addColumn("quantity", "integer", (c) => c.notNull())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.dropTable("grocery_list").execute()
}
