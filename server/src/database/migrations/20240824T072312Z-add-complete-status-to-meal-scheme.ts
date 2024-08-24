import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
    .alterTable("meal")
    .addColumn("completed", "boolean", (c) => 
        c.defaultTo(false).notNull()
    )
    .execute()

    await db.schema
    .alterTable('meal_plan')
    .alterColumn('isActive', (col) => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema.alterTable("meal").dropColumn("completed").execute()
}
