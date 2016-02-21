'use strict';

var _ = require('lodash');
var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function (res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function (req, res) {

  if (req.query.name) {
    req.query.name = new RegExp(req.query.name, 'i');
  }
  var search_params = _.merge({}, req.query);


  if (req.user.role !== 'admin') {
    search_params['_id'] = {$in: _.union(req.user.sales, [req.user._id])};
  }
  console.log(search_params);
  User.find(search_params, '-salt -hashedPassword', function (err, users) {
    if (err)
      return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function (err, user) {
    if (err)
      return validationError(res, err);
    if (user.role === 'user' && user._manager) {
      console.log(user._manager);
      User.findById(user._manager, function (err, manager) {
        manager.sales = _.union(manager.sales,[user._id]); 
         console.log(user._manager);
        manager.save(function () {
        console.log('updated' + manager);

        });
      });
    }
    var token = jwt.sign({_id: user._id}, config.secrets.session, {expiresInMinutes: 60 * 5});
    res.json({token: token});
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err)
      return next(err);
    if (!user)
      return res.send(401);
    res.json(user.info);
  });
};


exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  User.findById(req.params.id, function (err, thing) {
    if (err) {
      return handleError(res, err);
    }
    if (!thing) {
      return res.send(404);
    }

    var updated = _.merge(thing, req.body);
    updated.sales = req.body.sales;
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      if (updated.role === 'user' && updated._manager) {
        console.log(updated._manager);
        User.findById(updated._manager, function (err, manager) {
          manager.sales = _.union(manager.sales,[user._id]); ;
          manager.save(function () {
          console.log('updated' + manager);

          });
        });
      }

      return  exports.show(req, res);
    });
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err, user) {
    if (err)
      return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function (req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if (user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function (err) {
        if (err)
          return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function (req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function (err, user) { // don't ever give out the password or salt
    if (err)
      return next(err);
    if (!user)
      return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function (req, res, next) {
  res.redirect('/');
};
