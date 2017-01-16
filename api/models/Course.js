/**
 * Course.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    name: {
        type: 'string',
        required: true
    },
    level: {
        type: 'string',
        required: true
    },
    startDate: {
        type: 'date',
        required: true  
    },
    endDate: {
        type: 'date',
        required: true  
    },
    courseSize: {
        type: 'integer'
    },
    instructor: {
        model: 'instructor'
    }
  }
};

