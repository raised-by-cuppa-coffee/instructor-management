/**
 * isAdmin
 *
 * @module      :: Policy
 * @description :: Simple policy to check whether a user is admin
 * @docs        :: http://sailsjs.org/#!/documentation/concepts/Policies
 *
 */
module.exports = function isAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.forbidden('You are not logged in');
  }
  User.findOne({
    user: req.session.userId
  })
  .exec(function(err, user) {
    if (err) return res.serverError(err);
    if (!user.admin) return res.forbidden('The requesting user is not admin');
    return next();
  });
}
