import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
});

export const location = sqliteTable("location", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull().references(() => users.id),
    latitude: text("latitude").notNull(),
    longitude: text("longitude").notNull(),
    timestamp: integer("timestamp").notNull(),
    name: text("name").notNull(),
});