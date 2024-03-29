var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var FacebookTokenStrategy = require('passport-facebook-token');


var config = require('./config');


exports.local = passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function (user) {
    return jwt.sign({
        _id: user._id,
        Admin: user.admin
    }, config.secretKey, {
        expiresIn: 3600
    });
};

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log("JWT payload: ", jwt_payload);
        User.findOne({
            _id: jwt_payload._id
        }, (err, user) => {
            if (err) {
                return done(err, false);
            } else if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {
    session: false
});
exports.verifyAdmin = (req, res, next) => {
    if (!req.user.admin) {
        var err = new Error('You are not authorized to perform this operation!')
        err.status = 403;
        next(err);
    } else {
        User.findById(req.user._id)
            .then((user) => {
                if (user.admin === true) {
                    next();
                } else {
                    var err = new Error('You are not authorized to perform this operation!')
                    err.status = 403;
                    next(err);
                }
            })
    }

};

exports.FacebookPassport = passport.use(new FacebookTokenStrategy({
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    User.findOne({
        facebookId: profile.id
    }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        if (!err && user !== null) {
            return done(null, user);
        } else {
            var user = new User({
                username: profile.displayName
            });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save()
                .then((user) => done(null, user))
                .catch((err) => done(err, false));
        }
    })
}))