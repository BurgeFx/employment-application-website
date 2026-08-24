import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config({quiet: true});

const pgp = pgPromise({
    noWarnings: true
});

const dbName = process.env.NODE_ENV === "development"
? process.env.development