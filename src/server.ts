// src/server.ts

import app from './app';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server listening on port! ${PORT}`);
});
