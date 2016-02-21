/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /things              ->  index
 * POST    /things              ->  create
 * GET     /things/:id          ->  show
 * PUT     /things/:id          ->  update
 * DELETE  /things/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var moment = require('moment');
var auth = require('../../auth/auth.service');
var Event = require('./event.model');

// Get list of events
exports.index = function (req, res) {

  var search_params = {};
  var start = moment(req.query.start).startOf("day").toDate();
    var end = moment(req.query.end).endOf("day").toDate();
    
  if (req.query.start) {
    search_params['startDate'] = {$lte: end} ;
    search_params['endDate'] = {$gte: start};
  }
  if (req.user.role !== 'admin') {
    search_params['_user'] = {$in: _.union(req.user.sales, [req.user._id])};
  }
  var query = Event.find(search_params)
  
  /*if (req.query.start) {
    query.$where('(this.startDate>= new Date("'+start+'") && this.endDate<=new Date("'+end+'"))'+
                 ' ||(this.startDate<=new Date("'+start+'") && this.endDate>=new Date("'+end+'"))'+
                 ' ||(this.startDate<=new Date("'+start+'") && this.endDate>=new Date("'+end+'"))');
  }*/

  if (req.user.role !== 'user') {
 //   query = query.populate('_user', '_id name');
  }
  query.exec(function (err, things) {
    if (err) {
      return handleError(res, err);
    }
    return res.json(200, things);
  });

};

// Get a single event
exports.show = function (req, res) {
  console.log(req.params.id || req.body._id);
  Event.findOne({
    _id: req.params.id || req.body._id,
    /* _user: {$in: _.union(req.user.sales, [req.user._id])}*/
  })//.populate('_user', '_id name')
    .exec(function (err, thing) {
      if (err) {
        return handleError(res, err);
      }
      if (!thing) {
        return res.send(404);
      }
      console.log(thing);
      return res.json(thing);
    });
};

// Creates a new event in the DB.
exports.create = function (req, res) {
  Event.create(req.body, function (err, thing) {
    if (err) {
      return handleError(res, err);
    }
    Event.findOne({_id: thing._id})
    //  .populate('_user', '_id name')
      .exec(function (err, thing) {
        if (err) {
          return handleError(res, err);
        }
        return res.json(thing);
      });
  });
};

// Updates an existing event in the DB.
exports.update = function (req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Event.findById(req.params.id, function (err, thing) {
    if (err) {
      return handleError(res, err);
    }
    if (!thing) {
      return res.send(404);
    }
    var updated = _.merge(thing, req.body);
    updated.save(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return exports.show(req, res);
    });
  });
};

// Deletes a event from the DB.
exports.destroy = function (req, res) {
  Event.findById(req.params.id, function (err, thing) {
    if (err) {
      return handleError(res, err);
    }
    if (!thing) {
      return res.send(404);
    }
    thing.remove(function (err) {
      if (err) {
        return handleError(res, err);
      }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}