const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../prismaClient');

router.use(authenticate);

// Get all notifications for the current user
router.get('/', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userID: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    // ensure notification belongs to user
    const existing = await prisma.notification.findUnique({ where: { id: parseInt(id) } });
    if (!existing || existing.userID !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const notification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userID: req.user.userId, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
