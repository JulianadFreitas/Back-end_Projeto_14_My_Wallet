 import app from "../src/app.js"
 import supertest from "supertest";
 import connection from "../src/database.js"

 beforeEach(async () => {
     await connection.query('DELETE FROM users');
 });

 afterAll(() => {
     connection.end();
   });

 describe("/user/signup", () =>{
     it('returns 201 for validate params', async() => {
         const body = {
             name: 'Test',
             email: 'test@test.br',
             password: '1234'
         }    
         const result = await supertest(app).post("/user/signup").send(body);
         expect(result.status).toEqual(201)
     });

     it('returns 409 for duplicate email', async() => {
         const body = {
             name: 'Test',
             email: 'test@test.br',
             password: '1234'
         }
         const result = await supertest(app).post("/user/signup").send(body);
         expect(result.status).toEqual(201);

         const secondTry = await supertest(app).post("/user/signup").send(body);
         expect(secondTry.status).toEqual(409);
     });

     it('returns 404 for invalidate email', async() => {
         const body = {
             name: 'Test',
             email: 'test',
             password: '1234'
         }
         const result = await supertest(app).post("/user/signup").send(body);
         expect(result.status).toEqual(404);
     });

     it('returns 404 for invalidate name', async() => {
         const body = {
             name: 1234,
             email: 'test',
             password: '1234'
     }
     const result = await supertest(app).post("/user/signup").send(body);
     expect(result.status).toEqual(404);
     });
 });

