import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
        .alterTable("meal")
        .addColumn("meal_plan", "integer", (c) => 
            c.references("meal_plan.id")
        )
        .addColumn("user", "integer", (c) => 
            c.references("user.id").notNull().onDelete("cascade")
        )
        .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.alterTable("meal")
    .dropColumn("meal_plan")
    .dropColumn("user")
    .execute()
}
