const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();

// Configuração do Passport
require('./config/passport')(passport);

// Configuração do banco de dados
const db = require('./config/keys').MONGO_URI;

//Conectar ao banco de dados
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('Conectado ao banco de dados'))
    .catch(err => console.log(err))

// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());

//Arquivos estáticos
app.use( express.static( "public" ) )

// Variáveis globais das mensagens de alerta
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

// Rotas
app.use('/', require('./routes/index.js'));
app.use('/usuarios', require('./routes/usuarios.js'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Servidor iniciado na porta ${PORT}`));