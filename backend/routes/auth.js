const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');
const JWT_SECRET = process.env.JWT_SECRET || 'tasktracker_super_secret_key_2026';

// Simple logger to include timestamps for Vercel logs
const logger = {
  info: (msg) => console.log('[INFO]', new Date().toISOString(), msg),
  error: (msg) => console.error('[ERROR]', new Date().toISOString(), msg)
};
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    logger.info(`[REGISTER] Received: ${JSON.stringify({ username, email, passwordLength: password?.length, role })}`);

    if (!password || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    logger.info(`[REGISTER] Hashed password prefix: ${hashedPassword.substring(0, 10)}`);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role || 'team_member'
      }
    });

    logger.info(`[REGISTER] User created successfully, ID: ${user.userID}`);
    res.status(201).json({ message: 'User registered successfully', userId: user.userID });
  } catch (err) {
    logger.error(`[REGISTER] Error: ${err.stack || err.message}`);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    logger.info(`[LOGIN] Received: ${JSON.stringify({ identifier, passwordLength: password?.length })}`);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }]
      }
    });

    if (!user) {
      logger.info(`[LOGIN] User not found for identifier: ${identifier}`);
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    logger.info(`[LOGIN] Found user ID: ${user.userID}, username: ${user.username}`);
    const validPassword = await bcrypt.compare(password, user.password);
    logger.info(`[LOGIN] Password valid: ${validPassword}`);

    if (!validPassword) return res.status(400).json({ error: 'Invalid username/email or password' });

    const token = jwt.sign({ userId: user.userID, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.userID, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    logger.error(`[LOGIN] Error: ${err.stack || err.message}`);
    res.status(500).json({ error: err.message });
  }
});

const crypto = require('crypto');

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    logger.info(`[FORGOT_PASSWORD] Received request for email: ${email}`);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If an account with that email exists, we sent a password reset link.' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // In a real app, send this via email.
    // For now, we will return it in the response for testing/simplicity.
    logger.info(`[FORGOT_PASSWORD] Reset token generated for user ID: ${user.userID}`);
    res.json({
      message: 'If an account with that email exists, we sent a password reset link.',
      // NOTE: For demonstration purposes we return the token, normally you'd email it.
      resetToken: resetToken
    });
  } catch (err) {
    logger.error(`[FORGOT_PASSWORD] Error: ${err.stack || err.message}`);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    logger.info(`[RESET_PASSWORD] Received reset request with token length: ${token?.length}`);

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Must not be expired
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { userID: user.userID },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    logger.info(`[RESET_PASSWORD] Password reset successfully for user ID: ${user.userID}`);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    logger.error(`[RESET_PASSWORD] Error: ${err.stack || err.message}`);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

router.post('/logout', (req, res) => {
  // Client-side removes token. Here we can just return success.
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
