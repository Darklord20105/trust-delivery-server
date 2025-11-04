var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../../middleware/auth');
const User = require('../../schema/usersSchema/usersSchema');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send('Express users');
});

// GET USER List
router.get('/get-users-list', authMiddleware('users', 'read'), async (req, res) => {
  try {
    const list = await User.find({});
    res.status(200).json({ usersList: list });
  } catch (error) {
    res.status(500).json({ error: 'Server error ' + error });
  }
});

// GET specific user
router.get('/get-user-by-id/:id', authMiddleware('users', 'read'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('The ID is NOT a valid MongoDB ObjectId.');
    return res.status(400).json({ error: 'The ID is NOT a valid' });
  }
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error ' + error });
  }
});

// POST Create new user
// we already covered that in auth stage but will move it here at some point... the thing is we dont need to create it again

// PUT modify user data (by super admin or the user himself)
router.put('/update-user-by-id/:id', authMiddleware('users', 'write'),
  async (req, res) => {
    const { id } = req.params;
    const { name, phone, email } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('The ID is NOT a valid MongoDB ObjectId.');
      return res.status(400).json({ error: 'The ID is NOT a valid' });
    }
    if (!name || !phone || !email) return res.status(400).json({ error: 'Missing required fields' });


    const updatedData = { name, phone, email };
    const filter = { _id: id };
    const update = { $set: updatedData };

    try {
      const user = await User.findOneAndUpdate(filter, update);
      if (!user) {
        res.status(403).json({ msg: 'no user found with this id' });
      }
      res.status(200).json({ msg: 'updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error ' + error });
    }
  });

// DELETE user by id
router.delete('/delete-user-by-id/:id', authMiddleware('users', 'delete'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletedUser = await User.findByIdAndDelete(id);
      if (deletedUser) {
        res.status(200).json({ msg: 'User deleted successfully', deletedUser })
      } else {
        res.status(401).json({ msg: 'No user found with the given ID:' + id })
      }
    } catch (error) {
      res.status(500).json({ error: 'Server error ' + error });
    }
  })

// PUT update user permissions by user id
router.put('/update-user-permissions-by-id/:id',
  authMiddleware('users', 'updatePermissions'),
  async (req, res) => {
    const { id } = req.params;
    const { permissions } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('The ID is NOT a valid MongoDB ObjectId.');
      return res.status(400).json({ error: 'The ID is NOT a valid' });
    }
    console.log(permissions);
    const updatedData = { permissions };
    const filter = { _id: id };
    const update = { $set: updatedData };

    try {
      const user = await User.findOneAndUpdate(filter, update);
      if (!user) {
        res.status(401).json({ msg: 'no user found with this id' });
      }
      res.status(200).json({ msg: 'updated permissions successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error ' + error });
    }
  });

// POST verify user status, i dont think we need it now (users, verify)


module.exports = router;
