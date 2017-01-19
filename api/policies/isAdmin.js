/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to check whether a user is admin
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function isAdmin(req, res, next) {
  // make sure a user session is in place
  if (!req.session.userId) {
    return res.forbidden('You are not logged in');
  }
  // query to find the user
  User.findOne({
    id: req.session.userId
  })
  .exec(function(err, user) {
    // return server error if any
    if (err) return res.serverError(err);

    // stop if not an admin
    if (!user.admin) return res.forbidden('The requesting user is not admin');

    return next();
  });
}
