import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .alterTable("meal_ingredient")
    .addColumn("meal_plan", "integer", (c) =>
        c.references("meal_plan.id").onDelete("cascade")
    )
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
        .alterTable("meal_inredient")
        .dropColumn("meal_plan")
        .execute()
}
