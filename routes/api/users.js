const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

//load input validation
const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

//get user schema
const User = require("../../models/User");

//get secret key
const keys = require("../../config/keys");

// @route  /api/users/test
// @desc   Tests user route
// @access PUBLIC
router.get("/test", (req, res) => res.json({ msg: "Users works!" }));

// @route  /api/users/register
// @desc   Register user
// @access PUBLIC

router.post("/register", (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    //check valid
    if (!isValid) {
        return res.status(400).json(errors);
    }
    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            //if user already exists
            return res.status(400).json({ email: "Email already exists!" });
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: "200",
                r: "pg",
                d: "mm"
            });

            //create new user using bodyparser and avatar
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                });
            });
        }
    });
});

// @route  /api/users/login
// @desc   Login user
// @access PUBLIC

router.post("/login", (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    //check valid
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email }).then(user => {
        if (!user) {
            //if no user
            errors.email = "User not found";
            return res.status(404).json(errors);
        }

        //if user exists then check password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                //user matched
                //res.json({ msg: "Success" });

                const payload = { id: user.id, name: user.name, avatar: user.avatar }; // create jwt payload
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: "Bearer " + token
                        });
                    }
                ); // sign token
            } else {
                errors.password = "Password Incorrect";
                return res.status(404).json(errors);
            }
        });
    });
});

// @route  /api/users/current
// @desc   Returns user
// @access PRIVATE
router.get(
    "/current",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);

module.exports = router;
