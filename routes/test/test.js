var express = require('express');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');
const User = require('../../schema/usersSchema/usersSchema');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Express');
});

// create experimental user

const mockUser = {
	name:'wow',
  phone:'+12345678902',
  email:'gjhfcdf@gmail.com',
  role: 'supplierAdmin',
  apiKey: uuidv4(),
  permissions : [
    { resource: 'suppliers', actions: ['read', 'write'] },
    { resource: 'customers', actions: ['read', 'write', 'delete'] },
    { resource: 'orders', actions: ['read', 'write', 'assign'] },
    { resource: 'analytics', actions: ['read'] }
  ],
}

router.post('/create-mock-user', async (req, res) => {
  try {
    const user = new User(mockUser)
    await user.save()
    res.json({ success: true, userId: user._id, apiKey: user.apiKey });
  } catch (error) {
    res.status(500).json({ error: 'Server error '+ error });
  }
})



module.exports = router;

