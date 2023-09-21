// src/app.ts

import ConnectSessionKnex from 'connect-session-knex';
import cookieParser from 'cookie-parser';
import express from 'express';
import listEndpoints from 'express-list-endpoints';
import session from 'express-session';
import morgan from 'morgan';
import passport from 'passport';
import knex from './database/db';
import indexRoutes from './routes/index';
import userRoutes from './routes/users';
import authRoutes from './routes/auth';
import {
  generalErrorHandler,
  notFoundHandler,
} from './middleware/errorMiddleware';
import flash from 'express-flash';

const KnexSessionStore = ConnectSessionKnex(session);

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(flash());

app.use(
  session({
    store: new KnexSessionStore({
      knex: knex,
      tablename: 'sessions',
      createtable: true,
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

// app.use(passport.authenticate('session'));
app.use(passport.initialize());
app.use(passport.session());

app.use('/api', indexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// app.use('/api/products', requiresAuth, productRoutes);

app.get('/api/routes', (req, res) => {
  res.status(200).send(listEndpoints(app));
});

// /**
//  * @description:    Log out the current user
//  * @route:          GET /api/users/login/google
//  * @access:         Public
//  */
// app.get('/login/google', passport.authenticate('google'));

// /**
//  * @description:    Log out the current user
//  * @route:          POST /api/users/oauth2/redirect/google
//  * @access:         Public
//  */
// app.get(
//   '/auth/google/callback',
//   // '/oauth2/redirect/google',
//   passport.authenticate('google', {
//     failureRedirect: '/login',
//     failureMessage: true,
//   }),
//   function (req, res) {
//     res.redirect('/');
//   }
// );

app.use(notFoundHandler);
app.use(generalErrorHandler);

export default app;
