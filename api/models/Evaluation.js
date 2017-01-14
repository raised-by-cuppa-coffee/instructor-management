/**
 * Evaluation.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    grade: {
      type: 'integer',
      required: true
    },
    instructor: {
      model: 'instructor',
      required: true
    },
    class: {
      model: 'class',
      required: true
    }
  }
};
