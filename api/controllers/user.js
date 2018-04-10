const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signUp = (req, res, next) => {
    User
        .find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return bcrypt.hash(req.body.password, 10);
            }
            const error = new Error();
            error.message = 'User Exists!';
            throw error;
        })
        .then(hash => {
            const user = createUser(req.body.email, hash);
            return user.save();
        })
        .then(result => {
            return res.status(201).json({
                message: 'User created successfully!'
            })
        })
        .catch((error) => {
            next(error);
        });
};

exports.logIn = (req, res, next) => {
    let email = undefined, userId = undefined;
    User
        .find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                const error = new Error();
                error.message = 'Auth Failed!';
                throw error;
            }
            email = user[0].email;
            userId = user[0]._id;
            return bcrypt.compare(req.body.password, user[0].password);
        })
        .then(result => {
            if (result) {
                const token = jwt.sign(
                    {
                        email: email,
                        userId: userId
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn: "1h"
                    }
                );
                return res.status(200).json({
                    message: 'Auth Successful!',
                    token: token
                });
            }
            const error = new Error();
            error.message = 'Auth Failed!';
            throw error;
        })
        .catch(error => {
            next(error);
        });
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.userId;
    User
        .remove({ _id: userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User Deleted Successfully!'
            });
        })
        .catch(error => {
            error.message = 'Could Not Delete User!';
            next(error);
        });
};

function createUser(email, hash) {
    return new User({
        _id: new mongoose.Types.ObjectId(),
        email: email,
        password: hash
    });
}