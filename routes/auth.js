const express = require("express");
const router = express.Router();
const ensureLogin = require("connect-ensure-login");
const passport = require("passport");


// User model
const User = require("../models/user");
// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get("/signup", (req, res) => {
  res.render("auth/signup")
});

router.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", {
      message:"The username and password cannot be empty."
    });
    return;
  }

  User.findOne({
    username
  }).then(user => {
    if (user !== null) {
      res.render("auth/signup", {
        message: "This username has already been taken."
      })
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      password: hashPass
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", {
          message: "Error: Could not save User."
        });
      } else {
        res.redirect("/login");
      }
    });
  }).catch(error => {
    next(error);
  });

});

router.get("/private-page", ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render("auth/private", {
    user: req.user
  });
  console.log(req.user);
});

router.get("/login", (req, res, next) => {
  res.render("auth/login");
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/dashboard",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});


module.exports = router;