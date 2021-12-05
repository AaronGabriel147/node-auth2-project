const { JWT_SECRET } = require("../secrets/index"); // use this secret!
const jwt = require('jsonwebtoken');
const { findBy } = require('../users/users-model');

const restricted = (req, res, next) => {
  const token = req.headers.authorization
  console.log('@@@@@@@@@@@@@@', token)
  if (!token) {
    return next({
      status: 401,
      message: "Token required"
    })
  }
  jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
    if (err) {
      next({
        status: 401,
        message: "Token invalid"
      })
    } else {
      console.log('**************************************')
      req.decodedToken = decodedToken
      next()
    }
  })
  next()
}

const only = role_name => (req, res, next) => {
  /*
    If the user does not provide a token in the Authorization header with a role_name
    inside its payload matching the role_name passed to this function as its argument:
    status 403
    {
      "message": "This is not for you"
    }

    Pull the decoded token from the req object, to avoid verifying it again!
  */
  next()
}


const checkUsernameExists = async (req, res, next) => {
  try {
    const [user] = await findBy({ username: req.body.username })
    if (!user) {
      next({
        status: 401,
        message: "Invalid credentials"
      })
    } else {
      req.user = user
      next()
    }
  } catch (error) {
    next(error)
  }
}


/*
If the role_name in the body is valid, set req.role_name to be the trimmed string and proceed.

If role_name is missing from req.body, or if after trimming it is just an empty string,
set req.role_name to be 'student' and allow the request to proceed.

If role_name is 'admin' after trimming the string:
status 422
{
  "message": "Role name can not be admin"
}

    If role_name is over 32 characters after trimming the string:
    status 422
    {
      "message": "Role name can not be longer than 32 chars"
    }
    */
// May be able to use switch case here?
const validateRoleName = (req, res, next) => {

  // if (!req.body.role_name || !req.body.role_name.trim()) {
  //   req.role_name = 'student'
  //   console.log('if validateRoleName', req.role_name)
  //   next()
  // }
  // // The trim() method removes whitespace from both ends of a string 
  // // and returns a new string, without modifying the original string.
  // else if (req.body.role_name.trim() === 'admin') { // I do not get this trim line at all!
  //   next({ status: 422, message: "Role name can not be longer than 32 chars" })
  //   console.log('else if (req.body.role_name.trim() === admin')
  // }

  // else if (req.body.role_name.trim().LENGTH > 32) {
  //   next({ status: 422, message: "Role name can not be longer than 32 chars" })
  //   console.log('else if (req.body.role_name.trim().LENGTH > 32)')
  // }

  // else {
  //   req.role_name = req.body.role_name.trim()
  //   console.log('else')
  //   next()
  // }
  next()
}


module.exports = {
  restricted,
  checkUsernameExists,
  validateRoleName,
  only,
}
