const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const prisma = require('../prismaClient');

router.use(authenticate);

// Create new project (TT-002) - Project Manager
router.post('/', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        managerID: req.user.userId
      }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List projects (scoped by role)
router.get('/', async (req, res) => {
  try {
    let projects = [];
    if (req.user.role === 'project_manager') {
      projects = await prisma.project.findMany({ where: { managerID: req.user.userId } });
    } else if (req.user.role === 'team_member') {
      const memberOf = await prisma.projectMember.findMany({
        where: { userID: req.user.userId },
        include: { project: true }
      });
      projects = memberOf.map(pm => pm.project);
    } else if (req.user.role === 'admin') {
      projects = await prisma.project.findMany();
    }
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Project detail
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { projectID: parseInt(id) },
      include: {
        tasks: { include: { assignee: { select: { username: true } } } },
        members: { include: { user: { select: { userID: true, username: true, email: true } } } },
        manager: { select: { userID: true, username: true, email: true } }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add member to project (TT-003) - Project Manager (Sends invitation)
router.post('/:id/members', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found with this email' });

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { projectID_userID: { projectID: parseInt(id), userID: user.userID } }
    });
    if (existingMember) return res.status(400).json({ error: 'User is already a member of this project' });

    // Check if there is already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: { projectID: parseInt(id), userID: user.userID, status: 'PENDING' }
    });
    if (existingInvitation) return res.status(400).json({ error: 'User already has a pending invitation to this project' });

    const project = await prisma.project.findUnique({ where: { projectID: parseInt(id) } });

    // Create Invitation
    const invitation = await prisma.invitation.create({
      data: { projectID: parseInt(id), userID: user.userID }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        userID: user.userID,
        message: `You have been invited to join the project "${project.name}"`,
        type: 'INVITATION',
        relatedId: invitation.id
      }
    });

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove member
router.delete('/:id/members/:userId', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id, userId } = req.params;
    await prisma.projectMember.delete({
      where: { projectID_userID: { projectID: parseInt(id), userID: parseInt(userId) } }
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update member role in project (TT-007) - Project Manager
router.put('/:id/members/:userId/role', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { projectRole } = req.body;
    
    const updatedMember = await prisma.projectMember.update({
      where: { projectID_userID: { projectID: parseInt(id), userID: parseInt(userId) } },
      data: { projectRole }
    });
    res.json(updatedMember);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create task in project (TT-004) - Project Manager
router.post('/:id/tasks', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, assigneeID } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        projectID: parseInt(id),
        assigneeID: assigneeID ? parseInt(assigneeID) : null,
        status: assigneeID ? 'to_do' : 'to_do'
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List tasks in project (with filter & search)
router.get('/:id/tasks', async (req, res) => {
  try {
    const { id } = req.params;
    const { search, status, assignee } = req.query;
    
    let whereClause = { projectID: parseInt(id) };
    if (search) whereClause.title = { contains: search, mode: 'insensitive' };
    if (status) whereClause.status = status;
    if (assignee) whereClause.assigneeID = parseInt(assignee);

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: { assignee: { select: { username: true } } }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
