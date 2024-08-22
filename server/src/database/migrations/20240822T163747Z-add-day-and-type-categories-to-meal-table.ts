import { sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
    await db.schema
        .alterTable("meal")
        .addColumn("assigned_day", "integer", (c) => 
            c.check(sql`assigned_day >= 1 AND assigned_day <= 7`)
        )
        .addColumn("type", "text", (c) => 
            c.check(sql`type IN ('breakfast', 'lunch', 'dinner', 'snack')`)
        )
        .execute()
}

export async function down(db: Kysely<any>) {
    await db.schema
        .alterTable("meal")
        .dropColumn("assigned_day")
        .dropColumn("type")
        .execute()
}