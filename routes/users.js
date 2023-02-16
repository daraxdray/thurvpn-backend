const express = require('express');
const router = express.Router();

var {registerUser, loginUser, getAllUsers, getSingleUser, updateUser, deleteUser
} = require('../controllers/users')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/all').get(getAllUsers)
router.route('/:id').get(getSingleUser)
router.route('/:id').put(updateUser)
router.route('/:id').delete(deleteUser)

module.exports = router;