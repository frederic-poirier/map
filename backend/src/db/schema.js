import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
});

export const location = sqliteTable("location", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),

    name: text("name").notNull(),

    OSM_object: text("osm_object").notNull(),
    OSM_version: integer("osm_version").notNull(),
    timestamp: integer("timestamp").notNull(),
});