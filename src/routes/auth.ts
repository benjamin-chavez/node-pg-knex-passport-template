// src/routes/auth.ts

import argon2 from 'argon2';
import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../../@types/user';
import knex from '../database/db';
import asyncHandler from 'express-async-handler';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(
  new LocalStrategy(async function verify(username, password, done) {
    try {
      const user = await knex('users').where({ username: username }).first();
      if (!user) {
        return done(null, false, {
          message: 'Incorrect username or password.',
        });
      }

      const isMatch = await argon2.verify(user.hashedPassword, password);

      if (!isMatch) {
        return done(null, false, {
          message: 'Incorrect username or password.',
        });
      }

      return done(null, user);
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env['GOOGLE_CLIENT_ID'],
      clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
      callbackURL: 'http://localhost:5000/api/auth/google/redirect',
      scope: ['profile', 'email'],
      state: true,
      passReqToCallback: true,
    },

    async function verify(request, accessToken, refreshToken, profile, done) {
      try {
        let user;
        const provider = 'https://accounts.google.com';

        const credential = await knex('federated_credentials')
          .select('*')
          .where({ provider: provider, subject: profile.id })
          .first();

        if (!credential) {
          [user] = await knex('users')
            .insert({
              username: profile.emails[0].value || profile.displayName,
            })
            .returning('*');

          await knex('federated_credentials').insert({
            user_id: user.id,
            provider,
            subject: profile.id,
          });
        } else {
          user = await knex('users')
            .select('*')
            .where({ id: credential.user_id })
            .first();
        }
        return done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.serializeUser((user: User, done) => {
  process.nextTick(() => {
    done(null, user);
  });
});

passport.deserializeUser((user: User, done) => {
  process.nextTick(() => {
    return done(null, user);
  });
});

const router = Router();

/**
 * @description:    Register a new user then Log in the new user
 * @route:          POST /api/auth/register
 * @access:         Public
 */
router.post(
  '/register',
  asyncHandler(async (req, res, next) => {
    try {
      const { username, password, isAdmin } = req.body;
      const hashedPassword = await argon2.hash(password);

      const [user] = await knex('users')
        .insert({
          username,
          hashedPassword,
          isAdmin,
        })
        .returning('*');

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({
            message: `An error occurred during login after signup.: ${err}`,
          });
        }

        return res
          .status(201)
          .json({ message: 'User signed up and logged in successfully', user });
      });
    } catch (err) {
      res.status(500).json({
        message: 'An error occurred during signup.',
        error: err.message,
      });
    }
  })
);

/**
 * @description:    Log in an existing user
 * @route:          POST /api/auth/login
 * @access:         Public
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: 'An error occurred during authentication.',
      });
    }

    if (!user) {
      return res.status(401).json({ message: info.message || 'Login failed' });
    }

    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'An error occurred during login.' });
      }

      return res
        .status(200)
        .json({ message: 'User logged in successfully', user });
    });
  })(req, res, next);
});

/**
 * @description:    Log out the current user
 * @route:          POST /api/auth/logout
 * @access:         Public
 */
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      res
        .status(500)
        .json({ message: 'An error occurred during authentication.' });
    }
    res.status(200).json({ message: 'User logged out successfully' });
  });
});

/**
 * @description:    Redirect the user to Google for authentication.
 * @route:          POST /api/auth/google
 * @access:         Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['email', 'profile'],
  })
);

/**
 * @description:    Handle callback after Google has authenticated the user.
 * @route:          POST /api/auth/google/redirect
 * @access:         Public
 */
router.get(
  '/google/redirect',
  passport.authenticate('google', {
    // failureRedirect: '/api/auth/failed',
    failureFlash: true,
  }),
  function (req, res) {
    // if (req.flash('error').length > 0) {
    if (req.flash('error')) {
      return res.status(401).json({ message: req.flash('error')[0] });
    }

    res.status(200).json({ message: 'Authentication successful' });
    // res.redirect('/api/users');
    // res.redirect('/api/auth/success');
  }
);

export default router;
