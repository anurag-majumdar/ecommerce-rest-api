const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(" ")[1];
            if (token) {
                const decodedToken = jwt.verify(token, process.env.JWT_KEY);
                req.userData = decodedToken;
                next();
            }
            else {
                handleError(null, next);
            }
        }
        else {
            handleError(null, next);
        }
    }
    catch (error) {
        handleError(error, next);
    }
};

function handleError(error, next) {
    if (error) {
        error.message = 'Auth Failed!!!';
        next(error);
    }
    else {
        const error = new Error();
        error.message = 'Auth Failed!!';
        next(error);
    }
}