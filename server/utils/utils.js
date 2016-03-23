exports.isLoggedIn = function (req) {
  return req.session ? !!req.session.user : false;
};

exports.createSession = function(req, res, newUser) {
  return req.session.regenerate(function () {
    req.session.user = newUser;
  });
};

exports.checkUser = function(req, res, next) {
  if (!exports.isLoggedIn(req)){
    // Set property on body indicating whether user has no session
    res.status(401).send({noSession: "true"});
   } else {
     next();
   }
};