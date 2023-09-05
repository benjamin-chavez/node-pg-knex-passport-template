// @types/types.d.ts

// import { Request } from 'express';
import { User } from './user';

declare module 'express' {
  interface Request {
    user?: User;
  }
}

// declare namespace Express {
//   export interface Request {
//     user?: User;
//   }
// }
