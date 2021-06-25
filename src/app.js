import express from "express";
import cors from "cors";
import pg from "pg";
import joi from "joi";
import dayjs from "dayjs";

const app = express();
app.use(cors());
app.use(express.json());

const { Pool } = pg;

const connection = new Pool({
  user: "postgres",
  password: "1234",
  host: "localhost",
  port: 5432,
  database: "db_mywallet",
});

app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;
  try {
    const categories = await connection.query("SELECT * FROM categories");
    res.send(categories.rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.post("/categories", async (req, res) => {
  const { name } = req.body;
  try {
    const categories = await connection.query("SELECT * FROM categories");
    const data = categories.rows;
    const findCategorie = data.find((e) => e.name === name);
    if (name === "") {
      return res.sendStatus(400);
    } else if (findCategorie) {
      return res.sendStatus(409);
    }
    await connection.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    res.sendStatus(201);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});