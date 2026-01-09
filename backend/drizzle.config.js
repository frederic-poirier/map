export default {
    schema: "./src/db/schema.js", // Chemin depuis la racine du projet
    out: "./drizzle", // Où les migrations seront générées
    dialect: "sqlite",
    dbCredentials: {
        url: "sqlite.db", // Le nom de ton fichier DB à la racine
    },
};
