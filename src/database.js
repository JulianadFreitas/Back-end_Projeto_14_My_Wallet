import pg from "pg"

const { Pool } = pg;

const connection = new Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database:  process.env.NODE_ENV === "test" ? "test" : "db_mywallet",
});

export default connection;