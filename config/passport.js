require('dotenv').config();

// A PASSPORT STRATEGY FOR AUTHENTICATING WITH A JSON WEB TOKEN
// This allows you to authenticate endpoints
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const db = require('../models')
const User = mongoose.model('User');


// options is an object literal containing options to control 
//how the token is extracted from the request or verified 
const options = {};

//jwtFromRequest (REQUIRED) functino that accepts a request
//as the only parameter and returns either the JWT as a string or null

// fromAuthHeaderAsBearerToekn() creates an extractor that looks for the JWT in the auth header
options.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
options.secretOrKey = process.env.JWT_SECRET;

module.exports = (passport) => {
    passport.use(new JwtStrategy(options, (jwt_payload, done) => {
        User.findById(jwt_payload.id)
        // jwt_payload is an object literal containing the decoded JWT payload
        // done is a passport callback that has error first as an argument done (error, user, info)
        .then(user => {
            if(user) {
                // If the user is found, return a null (for error) and user
                return done(null, user)
            } else {
                // If no user is found
                return done(null, false);
            }
        })
        .catch(error => console.log(error))
    }));
};