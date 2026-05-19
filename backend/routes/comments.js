const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

const prisma = require('../prismaClient');

router.use(authenticate);

// Delete own comment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await prisma.comment.findUnique({ where: { commentID: parseInt(id) } });
    
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    
    if (comment.userID !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await prisma.comment.delete({ where: { commentID: parseInt(id) } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
