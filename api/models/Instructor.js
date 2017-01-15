/**
 * Instructor.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    firstName: {
      type: 'string',
      required: true
    },
    middleName: {
      type: 'string'
    },
    lastName: {
      type: 'string',
      required: true
    },
    /**
     * Instructor could have multiple phone numbers
     * @type {Object}
     */
    phone: {
      collection: 'phone',
      via: 'instructor'
    },
    /**
     * Instructor could have multiple email addresses
     * @type {Object}
     */
    email: {
      collection: 'email',
      via: 'instructor'
    },
    skills: {
      collection: 'skill',
      via: 'instructor'
    },
    courses: {
      collection: 'course',
      via: 'instructor'
    },
    evaluation: {
      collection: 'evaluation',
      via: 'instructor'
    },
    education: {
      collection: 'education',
      via: 'instructor'
    }
  }
};
