import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import * as uuid from "uuid";
import joi from "joi";
import connection from "./database.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/user/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const schema = joi.object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
  });

  const isValid = schema.validate(req.body);
  if (isValid.error) return res.sendStatus(404);

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const userExists = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (!userExists.rows[0]) {
      const user = await connection.query(
        `INSERT INTO users (name , email, password) VALUES ($1 ,$2, $3)`,
        [name, email, `${passwordHash}`]
      );
      console.log(users.rows);
      res.sendStatus(201);
    } else {
      res.sendStatus(409);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.post("/user/login", async (req, res) => {
  const { email, password } = req.body;

  const schema = joi.object({
    email: joi.string().required(),
    password: joi.string().required(),
  });
  const isValid = schema.validate(req.body);
  if (isValid.error) return res.sendStatus(404);

  try {
    const userResult = await connection.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (
      userResult.rows[0] &&
      bcrypt.compareSync(password, userResult.rows[0].password)
    ) {
      const token = uuid.v4();
      const userId = userResult.rows[0].id;
      const username = userResult.rows[0].name;

      await connection.query(
        `INSERT INTO "sessionUsers" ("userId", token) VALUES ($1 ,$2)`,
        [userId, token]
      );
      return res.send({ username, token });
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

app.post("/home/signout", async (req, res) => {
  const authorization = req.headers["authorization"];
  const token = authorization?.replace("Bearer ", "");
  if (!token) return res.sendStatus(401);
  try {
    await connection.query(
      `DELETE FROM "sessionUsers" 
       WHERE token = $1`,
      [token]
    );
    return res.sendStatus(204);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.post("/home/registries", async (req, res) => {
  const authorization = req.headers["authorization"];
  const token = authorization?.replace("Bearer ", "");
  const { value, description, type } = req.body;
  const date = new Date();
  const schema = joi.object({
    value: joi.string().required(),
    description: joi.string().required(),
    type: joi.string().valid("revenue", "expense").required(),
  });
  const isValid = schema.validate(req.body);

  if (!token) {
    return res.sendStatus(401);
  } else if (isValid.error) {
    return res.sendStatus(404);
  }
  try {
    const user = await connection.query(
      `SELECT * FROM "sessionUsers"
      JOIN users
      ON "sessionUsers"."userId" = users.id
      WHERE "sessionUsers".token = $1`,
      [token]
    );

    const id = user.rows[0].userId;

    if (id) {
      await connection.query(
        'INSERT INTO records (value, description, type, "userId", date) VALUES ($1, $2, $3, $4, $5)',
        [value, description, type, id, date]
      );
      return res.sendStatus(204);
    } else {
      res.sendStatus(401);
    }
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
});

app.get("/home/registries", async (req, res) => {
  const authorization = req.headers["authorization"];
  const token = authorization?.replace("Bearer ", "");

  try {
    const validateUser = await connection.query(
      `SELECT * 
      FROM "sessionUsers"
      WHERE token = $1`,
      [token]
    );

    const user = validateUser.rows[0];
    const id = user.userId;
    const test = id.toString();
    if (!validateUser.rows[0]) return res.sendStatus(401);

    const registries = await connection.query(
      `SELECT * FROM records WHERE records."userId" = $1 `,
      [id]
    );

    return res.send(registries.rows);
  } catch (e) {
    console.log(e);
    return res.sendStatus(500);
  }
  
});

app.get("/user/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await connection.query("SELECT * FROM users");
    console.log(user.rows);
    res.sendStatus(user.rows);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

export default app;