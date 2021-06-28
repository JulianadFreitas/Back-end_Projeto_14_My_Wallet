import pg from "pg"

const { Pool } = pg;

const connection = new Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "db_mywallet",
});

export default connection;