module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        //console.log(req.user)
        return next();
      }
      req.flash('error_msg', 'Você precisa estar logado para acessar essa página.');
      res.redirect('/usuarios/login');
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect('/todos');      
    }
  };