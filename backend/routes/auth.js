const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const JWT_SECRET = process.env.JWT_SECRET || 'tasktracker_super_secret_key_2026';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('[REGISTER] Received:', { username, email, passwordLength: password?.length, role });

    if (!password || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('[REGISTER] Hashed password prefix:', hashedPassword.substring(0, 10));

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'team_member'
      }
    });

    console.log('[REGISTER] User created successfully, ID:', user.userID);
    res.status(201).json({ message: 'User registered successfully', userId: user.userID });
  } catch (err) {
    console.error('[REGISTER] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log('[LOGIN] Received:', { identifier, passwordLength: password?.length });

    const user = await prisma.user.findFirst({ 
      where: { 
        OR: [{ email: identifier }, { username: identifier }] 
      } 
    });

    if (!user) {
      console.log('[LOGIN] User not found for identifier:', identifier);
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    console.log('[LOGIN] Found user ID:', user.userID, 'username:', user.username);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('[LOGIN] Password valid:', validPassword);

    if (!validPassword) return res.status(400).json({ error: 'Invalid username/email or password' });

    const token = jwt.sign({ userId: user.userID, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.userID, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('[LOGIN] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/logout', (req, res) => {
  // Client-side removes token. Here we can just return success.
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
