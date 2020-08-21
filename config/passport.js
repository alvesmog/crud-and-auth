const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('./keys');
const bcrypt = require('bcryptjs');

// Carregar modelo de usuário
const Usuario = require('../models/Usuario');

module.exports = function (passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, senha, done) => {
            // Match user
            Usuario.findOne({
                email: email
            }).then(usuario => {
                if (!usuario) {
                    return done(null, false, { message: 'Este e-mail não está cadastrado' });
                }

                // Se encontrou o usuário, comparar a senha no banco de dados com a senha fornecida
                bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, usuario);
                    } else {
                        return done(null, false, { message: 'Senha incorreta.' });
                    }
                });
            });
        })
    );

    passport.use( //Logando com Google
        new GoogleStrategy({
            callbackURL: keys.google.CALLBACK_URL,
            clientID: keys.google.CLIENT_ID,
            clientSecret: keys.google.CLIENT_SECRET,
            passReqToCallback   : true
        },   function(request, accessToken, refreshToken, profile, done) {
            
            const nome = profile.displayName
            const email = profile.emails[0].value
            const senha = profile.id

            //Verifica se o e-mail já está cadastrado
            Usuario.findOne({ 
                email: email
            }).then(usuario => {
                if(!usuario) {
                    const newUsuario = new Usuario({ //Se não está, cria um novo usuário
                        nome,
                        email,
                        senha
                     }); //Criptografar senha
                bcrypt.genSalt(10, (err, salt) => {
                 bcrypt.hash(newUsuario.senha, salt, (err, hash) => {
                    if (err) throw err;
                    newUsuario.senha = hash;
                    newUsuario.save().then(usuario => {
                        done(null, usuario)
                    })
                })})} else {
                    done(null, usuario)
                }
            })
          }
    ))

    passport.serializeUser(function (usuario, done) {
        done(null, usuario.id);
    });

    passport.deserializeUser(function (id, done) {
        Usuario.findById(id, function (err, usuario) {
            done(err, usuario);
        });
    });
};