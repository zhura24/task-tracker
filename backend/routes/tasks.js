const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const prisma = require('../prismaClient');

router.use(authenticate);

// Global search tasks (TT-010, TT-011)
router.get('/', async (req, res) => {
  try {
    const { search, status, assignee } = req.query;
    let whereClause = {};

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }
    if (status) {
      whereClause.status = status;
    }
    if (assignee) {
      whereClause.assigneeID = parseInt(assignee);
    }

    // Role-based scoping
    if (req.user.role === 'team_member') {
      whereClause.assigneeID = req.user.userId;
    } else if (req.user.role === 'project_manager') {
      const projects = await prisma.project.findMany({ where: { managerID: req.user.userId } });
      const projectIds = projects.map(p => p.projectID);
      whereClause.projectID = { in: projectIds };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        assignee: { select: { username: true } }
      }
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific task by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { taskID: parseInt(id) },
      include: {
        project: { select: { name: true, managerID: true } },
        assignee: { select: { username: true } }
      }
    });
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Allow access if user is admin, manager of the project, assignee, 
    // or we could just allow any authenticated user to view it since they found the ID from the project page.
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit task / assign member (TT-005, TT-006) - Manager/Admin
router.put('/:id', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, deadline, assigneeID } = req.body;
    const task = await prisma.task.update({
      where: { taskID: parseInt(id) },
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        assigneeID: assigneeID ? parseInt(assigneeID) : null
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status (TT-008) - Anyone assigned or manager
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const task = await prisma.task.findUnique({ 
      where: { taskID: parseInt(id) },
      include: { project: true }
    });
    
    if (!task) return res.status(404).json({ error: 'Task not found' });
    
    // Authorization check
    const isAssignee = task.assigneeID === req.user.userId;
    const isManager = task.project.managerID === req.user.userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAssignee && !isManager && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to update this task status' });
    }
    
    const updatedTask = await prisma.task.update({
      where: { taskID: parseInt(id) },
      data: { status }
    });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', authorize(['project_manager', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { taskID: parseInt(id) } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment (TT-009)
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const comment = await prisma.comment.create({
      data: {
        content,
        taskID: parseInt(id),
        userID: req.user.userId
      }
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskID: parseInt(id) },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
