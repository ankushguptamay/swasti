const jwt = require('jsonwebtoken');
const { ADMIN_JWT_SECRET_KEY, INSTRUCTOR_JWT_SECRET_KEY, STUDENT_JWT_SECRET_KEY } = process.env;

const verifyAdminJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('JWT Verif MW');
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, ADMIN_JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
        req.admin = decoded;
        next();
    });
};

const verifyInstructorJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('JWT Verif MW');
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, INSTRUCTOR_JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
        req.instructor = decoded;
        next();
    });
};

const verifyStudentJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    // console.log('JWT Verif MW');
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token, STUDENT_JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: 'Unauthorized!'
            });
        }
        req.student = decoded;
        next();
    });
};

const authJwt = {
    verifyAdminJWT: verifyAdminJWT,
    verifyInstructorJWT: verifyInstructorJWT,
    verifyStudentJWT: verifyStudentJWT
};
module.exports = authJwt;