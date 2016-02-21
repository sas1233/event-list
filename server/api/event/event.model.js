'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    _user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  address: String,
  name: String,
  description: String,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  created: {
      type: Date,
      default: Date.now()
    }
});
 
module.exports = mongoose.model('Event', EventSchema);