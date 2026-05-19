const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { authenticate, authorize } = require('../middleware/auth');

const prisma = require('../prismaClient');

// Administrator only routes
router.use(authenticate);
router.use(authorize(['admin']));

// List all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { userID: true, username: true, email: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new user (TT-012)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, role }
    });
    res.status(201).json({ message: 'User created', userId: user.userID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit user data (TT-013)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, role, password } = req.body;
    
    let updateData = { username, email, role };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { userID: parseInt(id) },
      data: updateData
    });
    res.json({ message: 'User updated', userId: user.userID });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user (TT-014)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { userID: parseInt(id) } });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
