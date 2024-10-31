import { Request, Response } from 'express';

const express = require('express')
const app = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the RESTful API!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
})