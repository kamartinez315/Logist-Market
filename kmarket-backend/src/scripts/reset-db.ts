import { AppDataSource } from "../config/database";

async function reset() {
    console.log("Conectando a la base de datos...");

    // Override synchronize to false so we can connect and clean up manually
    (AppDataSource.options as any).synchronize = false;

    if (AppDataSource.isInitialized) {
        await AppDataSource.destroy();
    }
    await AppDataSource.initialize();

    console.log("Eliminando todas las tablas...");
    await AppDataSource.query(`
        DO $$ DECLARE
            r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
    `);

    console.log("Recreando tablas...");
    await AppDataSource.destroy();
    (AppDataSource.options as any).synchronize = true;
    await AppDataSource.initialize();
    await AppDataSource.synchronize();

    console.log("¡Base de datos restablecida con éxito!");
    await AppDataSource.destroy();
}

reset().catch(err => {
    console.error("Error al restablecer la base de datos:", err);
    process.exit(1);
});
