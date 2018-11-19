var LocalStrategy = require('passport-local').Strategy;
var LoginModel =  require('../models/users');
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var githubStrategy =require('passport-github2');
var passport = require('passport');
var session = require('express-session');
var mongoose=require('mongoose');

module.exports  = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

// used to deserialize the user
    passport.deserializeUser(function (id, done) {
        LoginModel.findById(id, function (err, user) {
            done(err, user);
        })
    });

    passport.use('local-login', new LocalStrategy({ // toLowerCase() is used bcz username/email is not case sendsitive
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, username, password, done) {
        LoginModel.findOne({'username': username.toLowerCase(), 'password': password}, function (err, user) {
            if (err)
                return done(err, req.flash('error', err));
            if (!user)
                return done(null, false, req.flash('error', 'Username/Password Incorrect.'));
            req.session.user = username;
            return done(null, user);
        })
    }));

    passport.use(new googleStrategy({
        clientID:'301084404752-m15e4li5p9etvq3g2hmp3v3862pv3q6d.apps.googleusercontent.com',
        clientSecret:'rwK04lw3w5G1c2e9ju6ATAyL',
        callbackURL:'http://localhost:3000/auth/google/callback'
    },function(accessToken,tokenSecret,profile,done){
        console.log(profile);
        LoginModel.findOne({'googleId':profile.id},function(err,user){
            if(err)
                return done(err);
            if(user){
                return done(null,user);
            }else
            {
                var login = new LoginModel();
                login.googleId     = profile.id;
                login.username     = profile.emails[0].value;
                login.fullname     = profile.displayName;
                login.save(function(err){
                    if(err)
                    {
                        console.log(err);
                        return done(err);
                    }
                    return done(null,login);
                });
            }
        });
    }));
}
