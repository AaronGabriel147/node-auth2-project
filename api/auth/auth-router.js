const router = require("express").Router();
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');
const User = require('../users/users-model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken') // npm install
const { JWT_SECRET } = require("../secrets"); // use this secret!


/**
 [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }
 
 response:
 status 201
 {
   "user"_id: 3,
   "username": "anna",
   "role_name": "angel"
  }
  */
//   // bcrypting the password before saving
//   const hash = bcrypt.hashSync(user.password, BCRYPT_ROUNDS)

//   // never save the plain text password in the db
//   user.password = hash

router.post("/register", validateRoleName, async (req, res) => {

  // const { username, password, role_name } = req.body;         // Destructure whatever the user types

  const { username, password, role_name } = req.body;       // Take whatever the user types
  const hash = bcrypt.hashSync(password, 8);                // Hashes the user's password
  const user = { username, password: hash, role_name }      // Create a user object with the username and hashed password

  try {
    // const user = await User.add({ username, password, role_name });
    const createdUser = await User.add(user)
    res.status(201).json({ createdUser })
  }

  catch (err) {
    res.status(500).json({ message: 'Error registering user', err });
  }
})





/**
 [POST] /api/auth/login { "username": "sue", "password": "1234" }
 
 response:
 status 200
 {
   "message": "sue is back!",
   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
  }
  
  The token must expire in one day, and must provide the following information
  in its payload:
  
  {
    "subject"  : 1       // the user_id of the authenticated user
    "username" : "bob"   // the username of the authenticated user
    "role_name": "admin" // the role of the authenticated user
  }
  */
// router.post("/login", checkUsernameExists, (req, res, next) => {
// });


router.post('/login', checkUsernameExists, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const [user] = await User.findBy({ username })             // This is the user from the database.
    if (user && bcrypt.compareSync(password, user.password)) { // bcrypt line is testing the hashed pw
      const token = generateToken(user)
      return res.json({ message: `You are logged in ${user.username}, have a token!`, token })
    }
    next({ status: 401, message: 'Invalid Credentials from login' });
  } catch (err) {
    res.status(500).json({ message: 'Server side error while logging in user', err });
  }
});



function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  }
  const options = {
    expiresIn: '1d',
  }
  return jwt.sign(payload, JWT_SECRET, options)
}


module.exports = router;

// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@





// router.post('/login', (req, res, next) => {
//   let { username, password } = req.body

//   User.findBy({ username }) // it would be nice to have middleware do this
//     .then(([user]) => {
//       if (user && bcrypt.compareSync(password, user.password)) {
//         const token = generateToken(user) // new line

//         // the server needs to return the token to the client
//         // this doesn't happen automatically like it happens with cookies
//         res.status(200).json({
//           message: `Welcome back ${user.username}, have a token...`,
//           token, // attach the token as part of the response
//         })
//       } else {
//         next({ status: 401, message: 'Invalid Credentials' })
//       }
//     })
//     .catch(next)
// })

// function generateToken(user) {
//   const payload = {
//     subject: user.id,
//     username: user.username,
//     role: user.role,
//   }
//   const options = {
//     expiresIn: '1d',
//   }
//   return jwt.sign(payload, JWT_SECRET, options)
// }

// module.exports = router
