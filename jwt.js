// const { Router } = require('express');
// const jwt = require('jsonwebtoken');
// const Users = require('../models/');
// const bcrypt = require('bcrypt');



// Router.post('/login', (req, res,) => {
//     let { username, password } = req.body;

//     Users.findBy({ username })
//         .first()
//         .then(user => {
//             if (user && bcrypt.compareSync(password, user.password)) {
//                 const token = generateToken(user);
//                 res.status(200).json({
//                     message: `Welcome ${user.username}! Here is your token: ${token}`,
//                     token
//                 });
//             } else {
//                 res.status(401).json({
//                     message: 'Invalid Credentials'
//                 });
//             }
//         }
//         ).catch(err => {
//             res.status(500).json({
//                 message: 'Something went wrong',
//                 error: err
//             });
//         });
// })


// function generateToken(user) {
//     const payload = {
//         subject: user.id,
//         username: user.username
//     };

//     const options = {  // Header
//         expiresIn: '1d'
//     };

//     return jwt.sign(payload, secrets.jwtSecret, options); // will get tho this with video.
// }



