const express = require('express');
const passport = require('./middleware');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../models/user');

const router = express.Router();

const app = express();

app.use(passport.initialize());
app.use(passport.session());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));


passport.serializeUser((user, done) => {
 done(null, user.id);
});

passport.deserializeUser((id, done) => {
 User.findById(id, (err, user) => {
    done(err, user);
 });
});


passport.use(new LocalStrategy({ usernameField: 'email' },
 async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Correo electrónico incorrecto.' });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
 }
));


passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
 },
 async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ githubId: profile.id });
      if (!user) {
        const newUser = await User.create({
          githubId: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          email: profile.emails[0].value
        });
        return done(null, newUser);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
 }
));


app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
   }));

   passport.use(new LocalStrategy(User.authenticate()));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
}, async (payload, done) => {
    try {
        const user = await User.findById(payload.sub);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
}));

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.send({ user: req.user });
});

router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send({ user: req.user });
});

module.exports = router;

app.listen(3000, () => {
  console.log('Servidor ejecutándose en el puerto 3000');
});