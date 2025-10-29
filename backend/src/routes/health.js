import express from 'express'
import { config } from '../config/index.js'
import { userDB, assignmentDB, submissionDB } from '../db/database.js'
import fs from 'fs'
import path from 'path'

const router = express.Router()

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.server.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
      checks: {}
    }

    // Database connectivity check
    try {
      await userDB.getAll()
      healthCheck.checks.database = { status: 'healthy', responseTime: Date.now() }
    } catch (error) {
      healthCheck.checks.database = { status: 'unhealthy', error: error.message }
      healthCheck.status = 'unhealthy'
    }

    // File system check
    try {
      const uploadsDir = config.uploads.uploadPath
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      healthCheck.checks.filesystem = { status: 'healthy' }
    } catch (error) {
      healthCheck.checks.filesystem = { status: 'unhealthy', error: error.message }
      healthCheck.status = 'unhealthy'
    }

    // Memory usage check
    const memUsage = process.memoryUsage()
    healthCheck.checks.memory = {
      status: 'healthy',
      usage: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      }
    }

    // Disk space check
    try {
      const stats = fs.statSync(config.database.path)
      healthCheck.checks.disk = {
        status: 'healthy',
        databaseSize: `${Math.round(stats.size / 1024)}KB`
      }
    } catch (error) {
      healthCheck.checks.disk = { status: 'unhealthy', error: error.message }
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503
    res.status(statusCode).json(healthCheck)

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      application: {
        users: await userDB.getAll().then(users => users.length),
        assignments: await assignmentDB.getAll().then(assignments => assignments.length),
        submissions: await submissionDB.getAll().then(submissions => submissions.length),
        activeAssignments: await assignmentDB.getActive().then(assignments => assignments.length)
      }
    }

    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Status endpoint for load balancers
router.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
