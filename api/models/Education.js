/**
 * Education.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    type: {
      type: 'string',
      enum: ['B.A.','B.S.','M.A.', 'M.S.', 'Ph.D.', 'certification'],
      required: true
    },
    institution: {
      type: 'string',
      required: true
    },
    instructor: {
      model: 'instructor'
    }
  }
};

