require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');
const passport = require('passport');
const JWT_SECRET = process.env.JWT_SECRET;

// Load User model
const User = require('../../models/User');
const db = require('../../models');


// POST api/users/register
router.post('/register', (req, res) => {
  
  // Find user by email
  db.User.findOne({ email: req.body.email })
  .then(user => {
    // if email already exists, send a 400 response
    if (user) {
      return res.status(400).json({ msg: 'Email already exists'});
    } else {
      // Create a new user
      const newUser = new User({
        username: req.body.username,
        email: req.body.email.toLowerCase(),
        password: req.body.password,
        volunteer: req.body.volunteer,
        phoneNumber: req.body.phoneNumber
      });

      // Salt and hash the password, then save the user
      bcrypt.genSalt(10, (error, salt) => {
        bcrypt.hash(newUser.password, salt, (error, hash) => {
          if (error) throw error;
          // Change the password to the hash
          newUser.password = hash;
          newUser.save()
          .then(createdUser => res.json(createdUser))
          .catch(error =>  console.log(error));
        });
      });
    }
  })
});

// POST /api/users/login
router.post('/login', (req, res) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  // Find a user via email
  db.User.findOne({ email })
  .then(user => {
    if (!user) {
      res.status(400).json({ msg: 'User not found'});
    } else {
      // Check password with bcrypt
      bcrypt.compare(password, user.password)
      .then(isMatch => {
        if (isMatch) {
          // User match, send JSON web token
          // Create a token payload (you can include anything you want)
          const payload = {
            id: user.id,
            name: user.username,
            email: user.email.toLowerCase(),
            volunteer: user.volunteer,
            phoneNumber: user.phoneNumber
          };

          // Sign token
          jwt.sign(payload, JWT_SECRET, { expiresIn: 3600 }, (error, token) => {
            res.json({ success: true, token: `Bearer ${token}` });
          });
        } else {
          return res.status(400).json({ password: 'Password or email is incorrect' });
        }
      });
    }
  });
});

// GET /api/users
router.get('/', (req, res) => {
  db.User.find()
  .then(user => {
    res.send(user);
  })
  .catch(err => {
    console.log(err);
  })
})

// DELETE api/users/id
router.delete('/:id', (req, res) => {
  db.User.findByIdAndDelete(req.params.id)
  .then(() => {
    res.send('deleted')
    res.status(204).send()
  })
})

// GET api/users/phoneNumber
router.get('/phoneNumber', (req, res) => {
  db.User.find({volunteer:true})
  .then(user => {
    res.send(user);
  })
})
module.exports = router;