/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var Emailaddresses = require('machinepack-emailaddresses');
var Passwords = require('machinepack-passwords');
var Strings = require('machinepack-strings');

module.exports = {

  /**
   * Log in with email address and password
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  login: function(req, res) {
    User.findOne({      
      email: req.param('email')
    }, function foundUser(err, createdUser) {
      if (err) return res.negotiate(err);

      if (!createdUser) return res.notFound();

      Passwords.checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: createdUser.encryptedPassword
      }).exec({

        error: function(err) {
          return res.negotiate(err);
        },

        incorrect: function() {
          return res.notFound();
        },

        success: function() {

          if (createdUser.deleted) {
            return res.forbidden("'Your account has been deleted.  Please contact the administrator to restore your account.'");
          }

          if (createdUser.locked) {
            return res.forbidden("'Your account has been locked. Please contact the administrator to unlock your account.'");
          }

          req.session.userId = createdUser.id;

          return res.ok({
            loggedIn: true,
            email: createdUser.email,
            userId: createdUser.id
          });

        }
      });
    });
  },
  /**
   * Takes current session user id and sets to null
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  logout: function(req, res) {

    User.findOne(req.session.userId, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) {
        sails.log.verbose('Session refers to a user who no longer exists.');
        return res.redirect('/');
      }

      // log the user-agent out.
      req.session.userId = null;

      return res.ok();
    });
  },
  /**
   * Creates new user and validates params sent
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  create: function(req, res) {

    if (_.isUndefined(req.param('email'))) {
      return res.badRequest('An email address is required!');
    }

    if (_.isUndefined(req.param('password'))) {
      return res.badRequest('A password is required!');
    }

    if (req.param('password').length < 8) {
      return res.badRequest('Password must be at least 6 characters!');
    }

    Emailaddresses.validate({
      string: req.param('email'),
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        return res.serverError(err);
      },
      // The provided string is not an email address.
      invalid: function() {
        return res.badRequest('Doesn\'t look like an email address to me!');
      },
      // OK.
      success: function() {
        Passwords.encryptPassword({
          password: req.param('password'),
        }).exec({

          error: function(err) {
            return res.serverError(err);
          },

          success: function(result) {

            var options = {};

            options.email = req.param('email');
            options.encryptedPassword = result;
            options.deleted = false;
            options.admin = false;
            options.locked = false;

            User.create(options)
            .exec(function(err, createdUser) {
              if (err) {
                console.log('the error is: ', err.invalidAttributes);

                // Check for duplicate email address
                if (err.invalidAttributes && err.invalidAttributes.email && err.invalidAttributes.email[0] && err.invalidAttributes.email[0].rule === 'unique') {

                  // return res.send(409, 'Email address is already taken by another user, please try again.');
                  return res.alreadyInUse(err);
                }

                return res.negotiate(err);
              }

              // Log the user in
              req.session.userId = createdUser.id;

              return res.json({
                userId: createdUser.id
              });
            });
          }
        });
      }
    });
  },
  /**
   * Sets the deleted flag to true so that users can be recreated if necessary
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  delete: function(req, res) {

    User.update({
      id: req.session.userId
    }, {
      deleted: true
    }, function(err, removedUser) {

      if (err) return res.negotiate(err);
      if (removedUser.length === 0) {
        return res.notFound();
      }

      req.session.userId = null;
      return res.ok();
    });
  },
  /**
   * If someone forgets password, generate a recovery token and email to them
   * @todo Implement this
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  generateRecoveryEmail: function(req, res) {

    res.badRequest('This hasn\'t yet been implemented')
  },
  /**
   * Reset a forgotten password with a recovery token and a new password.
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  resetPassword: function(req, res) {

    // check for token parameter
    if (!_.isString(req.param('passwordRecoveryToken'))) {
      return res.badRequest('A password recovery token is required!');
    }

    // secondary check for password parameter
    if (!_.isString(req.param('password'))) {
      return res.badRequest('A password is required!');
    }

    // Fallback to client-side length check validation
    if (req.param('password').length < 8) {
      return res.badRequest('Password must be at least 8 characters!');
    }

    // Try to find user with passwordRecoveryToken
    User.findOne({
      passwordRecoveryToken: req.param('passwordRecoveryToken')
    }).exec(function foundUser(err, user) {
      if (err) return res.negotiate(err);

      // If this token doesn't correspond with a real user record, it is invalid.
      // We send a 404 response so that our front-end code can show an
      // appropriate error message.
      if (!user) {
        return res.notFound();
      }

      // Encrypt new password
      Passwords.encryptPassword({
        password: req.param('password'),
      }).exec({
        error: function(err) {
          return res.serverError(err);
        },
        success: function(encryptedPassword) {

          User.update(user.id, {
            encryptedPassword: encryptedPassword,
            passwordRecoveryToken: null
          }).exec(function(err, updatedUsers) {
            if (err) {
              return res.negotiate(err);
            }

            // Log the user in
            req.session.userId = updatedUsers[0].id;

            // If successful return updatedUsers
            return res.json({
              userId: updatedUsers[0].id
            });
          });
        }
      });
    });
  },
  /**
   * Restores a user account when they have the deleted flag as true
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  restore: function(req, res) {

    User.findOne({
      email: req.param('email')
    }, function foundUser(err, user) {
      if (err) return res.negotiate(err);
      if (!user) return res.notFound();

      Passwords.checkPassword({
        passwordAttempt: req.param('password'),
        encryptedPassword: user.encryptedPassword
      }).exec({

        error: function(err) {
          return res.negotiate(err);
        },

        incorrect: function() {
          return res.notFound();
        },

        success: function() {

          User.update({
            id: user.id
          }, {
            deleted: false
          }).exec(function(err, updatedUser) {
            if (err) return res.negotiate(err);

            req.session.userId = user.id;

            return res.json({
              userId: updatedUsers[0].id
            });
          });
        }
      });
    });
  },

  /**
   * Placeholder to update a user.  Not sure if necessary
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  update: function(req, res) {

    // stuff here.
    res.badRequest('Has not been implemented');
  },
  /**
   * Change a password for a logged in user
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  changePassword: function(req, res) {

    // Fallback to client-side required validation
    if (_.isUndefined(req.param('password'))) {
      return res.badRequest('A password is required!');
    }

    // Fallback to client-side length check validation
    if (req.param('password').length < 8) {
      return res.badRequest('Password must be at least 8 characters!');
    }

    Passwords.encryptPassword({
      password: req.param('password'),
    }).exec({
      error: function(err) {
        return res.serverError(err);
      },
      success: function(result) {

        User.update({
          // id: req.param('id')
          id: req.session.userId
        }, {
          encryptedPassword: result
        }).exec(function(err, updatedUser) {
          if (err) {
            return res.negotiate(err);
          }
          return res.json({
            userId: updatedUsers[0].id
          });
        });
      }
    });
  },
  
  /**
   * Return a list of admin users
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  adminUsers: function(req, res) {

    User.find()
    .where({admin: true})
    .exec(function(err, users) {

      if (err) return res.negotiate(err);

      if (users.length === 0) return res.notFound();

      var updatedUsers = _.map(users, function(user) {

        user = {
          id: user.id,
          email: user.email,
          admin: user.admin,
          locked: user.locked,
          deleted: user.deleted,
        };

        return user;
      });

      return res.json(updatedUsers);
    });
  },
  
  /**
   * Set the users `admin` field
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  updateAdmin: function(req, res) {
    if (!_.isString(req.param('admin'))) {
      return res.badRequest('you must provide whether admin value is true/false');
    }
    User.update(req.param('id'), {
      admin: req.param('admin')
    }).exec(function(err, update) {

      if (err) return res.negotiate(err);

      return res.ok({
        updated: true,
        userId: req.param('id')
      });
    });
  },
  /**
   * Set the users `locked` field
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  updateLocked: function(req, res) {
    if (!_.isString(req.param('locked'))) {
      return res.badRequest('you must provide whether locked value is true/false');
    }
    User.update(req.param('id'), {
      locked: req.param('locked')
    }).exec(function(err, update) {
      if (err) return res.negotiate(err);
      return res.ok({
        updated: true,
        userId: req.param('id')
      });
    });
  },
  /**
   * Set the users `delete` field
   * @param  {[type]} req [description]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  updateDeleted: function(req, res) {
    if (!_.isString(req.param('deleted'))) {
      return res.badRequest('you must provide whether deleted value is true/false');
    }
    User.update(req.param('id'), {
      deleted: req.param('deleted')
    }).exec(function(err, update) {
      if (err) return res.negotiate(err);
      return res.ok({
        updated: true,
        userId: req.param('id')
      });
    });
  }
};
