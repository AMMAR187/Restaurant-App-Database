const express = require('express');
const bodyParser = require('body-parser');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
var cors = require('./cors');
var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => {
        res.statusCode(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
                user: req.user._id
            })
            .populate('user')
            .populate('dishes._id')
            .then((favorite) => {
                if (!favorite) {
                    var err = new Error('There is no  Favorites list ');
                    err.status = 404;
                    return next(err);
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.cors, authenticate.verifyUser, (req, res, next) => {

        if (req.body) {
            Favorites.findOne({
                    user: req.user._id
                })
                .then((favorite) => {
                    if (!favorite) {
                        Favorites.create(req.user._id)
                            .then((favorite) => {
                                console.log(favorite);

                                favorite.user = req.user._id;

                                if (req.body._id) {
                                    favorite.dishes.push(req.body._id);
                                } else {
                                    req.body.forEach(dish => {
                                        favorite.dishes.push(dish._id);
                                    });
                                }
                                favorite.save()
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    }, (err) => next(err))
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    }
                    if (favorite) {
                        if (favorite.dishes.length >= 0) {
                            var found = false;
                            if (req.body._id) {
                                favorite.dishes.forEach(element => {
                                    if (element == req.body._id) {
                                        var err = new Error('Dish is already in Favorites list ');
                                        err.status = 403;
                                        found = true;
                                        return next(err);
                                    }
                                });
                                if (!found) {
                                    favorite.dishes.push(req.body._id);
                                    favorite.save()
                                        .then((favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        }, (err) => next(err))
                                        .catch((err) => next(err));
                                }
                            } else {
                                var dishes = req.body.map(dish => dish = dish._id);
                                favorite.dishes.forEach(element => {
                                    dishes.forEach(dish => {
                                        if (dish == element) {
                                            var err = new Error('Dish is already in Favorites list ');
                                            err.status = 403;
                                            found = true;
                                            return next(err);
                                        }
                                    });

                                });
                                if (!found) {
                                    req.body.forEach(dish => {
                                        favorite.dishes.push(dish._id);
                                    });
                                    favorite.save()
                                        .then((favorite) => {
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.json(favorite);
                                        }, (err) => next(err))
                                        .catch((err) => next(err));
                                }

                            }
                        }
                    }
                }, (err) => next(err))
                .catch((err) => next(err));
        }

    })
    .put(cors.cors, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorties');
    })
    .delete(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.deleteOne({
                user: req.user._id
            })
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err))
    });
favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => {
        res.statusCode(200);
    })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (!favorite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({
                        "exists": false,
                        "favorites": favorites
                    });
                } else {
                    if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({
                            "exists": false,
                            "favorites": favorites
                        });
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({
                            "exists": true,
                            "favorites": favorites
                        });
                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (!favorite) {
                    Favorites.create({
                            user: req.user._id
                        })
                        .then((favorite) => {
                            favorite.dishes.push(req.params.dishId);
                            favorite.save()
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-type', 'application/json');
                                    res.json(dish);
                                })

                        }, (err) => next(err));
                } else {
                    var found = false;
                    if (favorite.dishes.length >= 0) {
                        if (favorite.dishes.indexOf(req.params.dishId) != -1) {
                            var err = new Error('Dish is already in Favorites list ');
                            err.status = 403;
                            found = true;
                            return next(err);
                        } else {
                            favorite.dishes.push(req.params.dishId);
                            favorite.save()
                                .then((dish) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-type', 'application/json');
                                    res.json(dish);
                                })
                        }

                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorties');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({
                user: req.user._id
            })
            .then((favorite) => {
                if (!favorite) {
                    var err = new Error('There is no Favorites List ');
                    err.status = 403;
                    found = true;
                    return next(err);
                }
                let dish = favorite.dishes.indexOf(req.params.dishId);
                if (dish != -1) {
                    favorite.dishes.splice(dish, 1);
                    favorite.save()
                        .then((dish) => {
                            res.statusCode = 200;
                            res.setHeader('Content-type', 'application/json');
                            res.json(dish);
                        })
                } else {
                    var err = new Error('There is no Dish with id: ' + req.params.dishId + ' in Favorites List ');
                    err.status = 403;
                    found = true;
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    });
module.exports = favoriteRouter;