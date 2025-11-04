var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../../middleware/auth');
const Supplier = require('../../schema/supplierSchema/supplierSchema.js');               

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Express suppliers');
});

// basically this section handles bussiness associated by a specific supplier admin
// for example if someone has multipiie bussinesses or different kind of shops or branches or companies

// ok 75%
// GET /api/v1/suppliers - List suppliers
// needs to handle supplier moderator case
router.get('/get-supplier-entries', authMiddleware('suppliers', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Pagination
    const query = {};
    console.log(req.user)
    if (req.user.role === 'supplierAdmin') {
      query.createdBy = req.user.id; // Own user supplierAdmin entries in supplier collection only
    }

    const suppliers = await Supplier.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Supplier.countDocuments(query);

    res.json({ success: true, data: suppliers, pagination: { page, limit, total } });
  } catch (error) {
    res.status(500).json({ error: 'Server error'+ error });
  }
});

// ok 75%
// GET /api/v1/suppliers/:id - Get one supplier
// needs to handle supplier moderator case
router.get('/get-supplier-entry-by-id/:id', authMiddleware('suppliers', 'read'), async (req, res) => {
  const query = {
    _id: req.params.id,
    createdBy: req.user.id
  };
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    console.log('The ID is NOT a valid MongoDB ObjectId.');
    return res.status(400).json({ error: 'The ID is NOT valid' });
  }
  try {
    const supplier = await Supplier.findOne(query);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ok 100%
// POST /api/v1/suppliers - Create supplier bussiness
router.post('/create-supplier-entry', authMiddleware('suppliers', 'write'), async (req, res) => {
  try {
    const { name, phone, email, socialMedia, address } = req.body;
    
    if (!name || !phone || !email) return res.status(400).json({ error: 'Missing required fields' });
    if (!/^\+\d{10,15}$/.test(phone))  return res.status(400).json({ error: 'Invalid phone format' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  return res.status(400).json({ error: 'Invalid email format' });
    
    const supplier = new Supplier({
      name,
      phone,
      email,
      socialMedia: socialMedia || {},
      address: address || {},
      createdBy: req.user.id
    });

    await supplier.save();
    res.json({ success: true, supplierId: supplier._id });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Phone or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/v1/suppliers/:id - Update supplier
router.put('/update-suplier-entryby-id/:id', authMiddleware('suppliers', 'write'), async (req, res) => {
  const { id } = req.params;
  const { name, phone, email, socialMedia, address } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('The ID is NOT a valid MongoDB ObjectId.');
    return res.status(400).json({ error: 'The ID is NOT a valid' });
  }
  if (!name || !phone || !email) return res.status(400).json({ error: 'Missing required fields' });

  const updatedData = { name, phone, email, socialMedia, address };
  const filter = { _id: id, createdBy: req.user.id };
  const update = { $set: updatedData };

  try {
    const supplier = await Supplier.findOneAndUpdate(filter, update);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });

    res.status(200).json({ success: true, supplierId: supplier._id });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Phone or email already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/v1/suppliers/:id - Delete supplier
router.delete('/delete-supplier-entry-by-id/:id', authMiddleware('suppliers', 'delete'), async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.log('The ID is NOT a valid MongoDB ObjectId.');
    return res.status(400).json({ error: 'The ID is NOT a valid' });
  }
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (deletedSupplier) {
      return res.status(200).json({ msg: 'Supplier deleted success', deletedSupplier });
    } else {
      res.status(401).json({ msg: 'No user found with the given ID:' + id })
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error'+ error });
  }
});

module.exports = router;