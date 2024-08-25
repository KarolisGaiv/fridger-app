import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .alterTable("meal_plan_schedule")
    .addColumn("user_id", "integer", (c) =>
        c.references("user.id").notNull().onDelete("cascade")
    )
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.alterTable("meal_plan_schedule").dropColumn("user_id").execute()
}
