const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../prismaClient');

router.use(authenticate);

// Respond to an invitation (accept/reject)
router.post('/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACCEPTED' or 'REJECTED'

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: parseInt(id) },
      include: { project: true }
    });

    if (!invitation) return res.status(404).json({ error: 'Invitation not found' });
    if (invitation.userID !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (invitation.status !== 'PENDING') return res.status(400).json({ error: 'Invitation already responded to' });

    // Update invitation status
    await prisma.invitation.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    if (status === 'ACCEPTED') {
      // Check if already a member somehow
      const existingMember = await prisma.projectMember.findUnique({
        where: { projectID_userID: { projectID: invitation.projectID, userID: invitation.userID } }
      });
      if (!existingMember) {
        // Create ProjectMember
        await prisma.projectMember.create({
          data: {
            projectID: invitation.projectID,
            userID: invitation.userID
          }
        });
      }
    }

    res.json({ message: `Invitation ${status.toLowerCase()}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
