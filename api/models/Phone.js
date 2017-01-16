/**
 * Phone.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    phone: {
      type: 'string',
      required: true
    },
    phoneType: {
      type: 'string',
      enum: ['personal', 'work', 'mobile', 'other'],
      required: true
    },
    extension: {
      type: 'string'
    },
    instructor: {
      model: 'instructor'
    }
  }
};
