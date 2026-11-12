
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { analyseGrievance } from './ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, '../uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const prisma = new PrismaClient();
const app = express();

// Require a secure JWT secret.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET is missing or too short in server/.env');
  process.exit(1);
}

// Security and middleware.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

if (process.env.CLIENT_ORIGIN) {
  allowedOrigins.push(process.env.CLIENT_ORIGIN);
}

app.use(helmet());
app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Rate limiting.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use('/api/grievances/track', publicLimiter);
app.use('/api/contact', publicLimiter);

// File upload configuration.
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf'
]);

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 3
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(
        new Error('Only JPEG, PNG and PDF files are allowed.')
      );
    }

    cb(null, true);
  }
});

// JWT token generation.
const sign = user => jwt.sign(
  {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId
  },
  process.env.JWT_SECRET,
  { expiresIn: '8h' }
);

// Authentication middleware.
function auth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Authentication required'
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      error: 'Invalid or expired session'
    });
  }
}

// Role-based authorization.
const roles = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user.role)) {
    return res.status(403).json({
      error: 'You do not have permission for this action'
    });
  }

  return next();
};

// Grievance reference generator.
const ref = () =>
  `CMK-${new Date().getFullYear()}-${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;

// Existing grievance response structure.
const includeDetails = {
  citizen: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  department: true,
  attachments: true,
  history: {
    include: {
      actor: {
        select: {
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  },
  feedback: true
};

// Health check.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'CM Kerala Grievance Portal'
  });
});

// Departments.
app.get('/api/departments', async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' }
    });

    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// Citizen registration.
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 8
    ) {
      return res.status(400).json({
        error: 'Name, email and password (8+ characters) are required'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile,
        passwordHash,
        role: 'CITIZEN'
      }
    });

    res.status(201).json({
      token: sign(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Email is already registered'
      });
    }

    next(error);
  }
});

// Login.
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: (email || '').trim().toLowerCase()
      }
    });

    if (
      !user ||
      !await bcrypt.compare(password || '', user.passwordHash)
    ) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    res.json({
      token: sign(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId
      }
    });
  } catch (error) {
    next(error);
  }
});

// Current authenticated user.
app.get('/api/auth/me', auth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        mobile: true,
        role: true,
        departmentId: true,
        department: true
      }
    });

    if (!user) {
      return res.status(401).json({
        error: 'User account no longer exists'
      });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// AI grievance analysis.
app.post('/api/ai/analyse', auth, async (req, res, next) => {
  try {
    if (!req.body.description?.trim()) {
      return res.status(400).json({
        error: 'Description is required'
      });
    }

    const result = await analyseGrievance(
      req.body.description.trim()
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Submit grievance.
app.post(
  '/api/grievances',
  auth,
  roles('CITIZEN'),
  upload.array('attachments', 3),
  async (req, res, next) => {
    try {
      const {
        district,
        category,
        subject,
        description,
        priority = 'MEDIUM'
      } = req.body;

      if (!district || !category || !subject || !description) {
        return res.status(400).json({
          error: 'Complete all required grievance fields'
        });
      }

      const ai = await analyseGrievance(description);

      const validPriority = ['LOW', 'MEDIUM', 'HIGH'].includes(priority)
        ? priority
        : 'MEDIUM';

      const grievance = await prisma.grievance.create({
        data: {
          referenceNo: ref(),
          citizenId: req.user.id,
          district,
          category,
          subject,
          description,
          priority: validPriority,
          aiSummary: ai.summary,
          aiDepartment: ai.department,
          aiPriority: ['LOW', 'MEDIUM', 'HIGH'].includes(ai.priority)
            ? ai.priority
            : 'MEDIUM',

          attachments: {
            create: (req.files || []).map(file => ({
              filename: file.filename,
              originalName: path.basename(file.originalname),
              mimeType: file.mimetype,
              size: file.size
            }))
          },

          history: {
            create: {
              status: 'SUBMITTED',
              remarks: 'Grievance submitted by citizen',
              actorId: req.user.id
            }
          }
        },
        include: includeDetails
      });

      res.status(201).json({
        ...grievance,
        aiSuggestion: ai
      });
    } catch (error) {
      // Remove uploaded files if grievance creation fails.
      for (const file of req.files || []) {
        try {
          fs.unlinkSync(file.path);
        } catch {
          // Ignore cleanup errors.
        }
      }

      next(error);
    }
  }
);

// Citizen's own grievances.
app.get(
  '/api/grievances/mine',
  auth,
  roles('CITIZEN'),
  async (req, res, next) => {
    try {
      const grievances = await prisma.grievance.findMany({
        where: { citizenId: req.user.id },
        include: includeDetails,
        orderBy: { createdAt: 'desc' }
      });

      res.json(grievances);
    } catch (error) {
      next(error);
    }
  }
);

// Public tracking: return only limited, non-sensitive information.
app.get(
  '/api/grievances/track/:referenceNo',
  async (req, res, next) => {
    try {
      const grievance = await prisma.grievance.findUnique({
        where: {
          referenceNo: req.params.referenceNo
        },
        select: {
          referenceNo: true,
          district: true,
          category: true,
          subject: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,

          department: {
            select: {
              name: true
            }
          },

          history: {
            select: {
              status: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!grievance) {
        return res.status(404).json({
          error: 'Reference number not found'
        });
      }

      res.set('Cache-Control', 'no-store');
      res.json(grievance);
    } catch (error) {
      next(error);
    }
  }
);

// Role-based grievance listing.
app.get('/api/grievances', auth, async (req, res, next) => {
  try {
    const where = {};

    if (req.user.role === 'OFFICER') {
      where.departmentId = req.user.departmentId;
    } else if (req.user.role === 'CITIZEN') {
      where.citizenId = req.user.id;
    } else if (req.user.role !== 'CMO_ADMIN') {
      return res.sendStatus(403);
    }

    for (const key of ['district', 'category', 'status', 'priority']) {
      if (req.query[key]) {
        where[key] = req.query[key];
      }
    }

    const grievances = await prisma.grievance.findMany({
      where,
      include: includeDetails,
      orderBy: { createdAt: 'desc' }
    });

    res.json(grievances);
  } catch (error) {
    next(error);
  }
});

// Authenticated attachment download.
// Citizen owner, CMO admin, or assigned department officer only.
app.get(
  '/api/attachments/:attachmentId',
  auth,
  async (req, res, next) => {
    try {
      const attachment = await prisma.attachment.findUnique({
        where: {
          id: req.params.attachmentId
        },
        include: {
          grievance: {
            select: {
              citizenId: true,
              departmentId: true
            }
          }
        }
      });

      if (!attachment) {
        return res.status(404).json({
          error: 'Attachment not found'
        });
      }

      const isOwner =
        req.user.role === 'CITIZEN' &&
        attachment.grievance.citizenId === req.user.id;

      const isCmo = req.user.role === 'CMO_ADMIN';

      const isAssignedOfficer =
        req.user.role === 'OFFICER' &&
        attachment.grievance.departmentId === req.user.departmentId;

      if (!isOwner && !isCmo && !isAssignedOfficer) {
        return res.sendStatus(403);
      }

      const safeFilename = path.basename(attachment.filename);
      const filePath = path.resolve(uploadDir, safeFilename);

      if (
        !filePath.startsWith(uploadDir + path.sep) ||
        !fs.existsSync(filePath)
      ) {
        return res.status(404).json({
          error: 'Attachment file not found'
        });
      }

      res.set('Cache-Control', 'no-store');
      res.set('X-Content-Type-Options', 'nosniff');

      res.download(
        filePath,
        path.basename(attachment.originalName),
        error => {
          if (error && !res.headersSent) {
            next(error);
          }
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

// CMO assigns grievance to department.
app.patch(
  '/api/grievances/:id/assign',
  auth,
  roles('CMO_ADMIN'),
  async (req, res, next) => {
    try {
      const { departmentId, priority, remarks } = req.body;

      if (!departmentId) {
        return res.status(400).json({
          error: 'Department is required'
        });
      }

      const department = await prisma.department.findUnique({
        where: { id: departmentId }
      });

      if (!department) {
        return res.status(400).json({
          error: 'Selected department does not exist'
        });
      }

      const existing = await prisma.grievance.findUnique({
        where: { id: req.params.id }
      });

      if (!existing) {
        return res.sendStatus(404);
      }

      const data = {
        departmentId,
        ...(priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority)
          ? { priority }
          : {}),
        status: 'IN_PROGRESS',
        history: {
          create: {
            status: 'IN_PROGRESS',
            remarks: remarks || 'Forwarded to department by CMO',
            actorId: req.user.id
          }
        }
      };

      const grievance = await prisma.grievance.update({
        where: { id: req.params.id },
        data,
        include: includeDetails
      });

      res.json(grievance);
    } catch (error) {
      next(error);
    }
  }
);

// Update grievance status.
app.patch(
  '/api/grievances/:id/status',
  auth,
  roles('CMO_ADMIN', 'OFFICER'),
  async (req, res, next) => {
    try {
      const { status, remarks, actionReport } = req.body;

      const allowed = [
        'UNDER_REVIEW',
        'IN_PROGRESS',
        'RESOLVED',
        'REOPENED'
      ];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status'
        });
      }

      const existing = await prisma.grievance.findUnique({
        where: { id: req.params.id }
      });

      if (!existing) {
        return res.sendStatus(404);
      }

      if (
        req.user.role === 'OFFICER' &&
        existing.departmentId !== req.user.departmentId
      ) {
        return res.sendStatus(403);
      }

      const grievance = await prisma.grievance.update({
        where: { id: req.params.id },
        data: {
          status,
          officerRemarks: remarks ?? undefined,
          actionReport: actionReport ?? undefined,

          history: {
            create: {
              status,
              remarks:
                remarks ||
                actionReport ||
                `Status updated to ${status}`,
              actorId: req.user.id
            }
          }
        },
        include: includeDetails
      });

      res.json(grievance);
    } catch (error) {
      next(error);
    }
  }
);

// Citizen feedback.
app.post(
  '/api/grievances/:id/feedback',
  auth,
  roles('CITIZEN'),
  async (req, res, next) => {
    try {
      const grievance = await prisma.grievance.findFirst({
        where: {
          id: req.params.id,
          citizenId: req.user.id,
          status: 'RESOLVED'
        }
      });

      if (!grievance) {
        return res.status(400).json({
          error: 'Feedback is available only for your resolved grievances'
        });
      }

      const rating = Number(req.body.rating);

      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Rating must be an integer from 1 to 5'
        });
      }

      const feedback = await prisma.feedback.upsert({
        where: {
          grievanceId: grievance.id
        },
        update: {
          rating,
          comments: req.body.comments
        },
        create: {
          grievanceId: grievance.id,
          rating,
          comments: req.body.comments
        }
      });

      res.status(201).json(feedback);
    } catch (error) {
      next(error);
    }
  }
);

// CMO dashboard statistics.
app.get(
  '/api/cmo/stats',
  auth,
  roles('CMO_ADMIN'),
  async (req, res, next) => {
    try {
      const [
        total,
        pending,
        resolved,
        overdue,
        byDistrict,
        byDepartment
      ] = await Promise.all([
        prisma.grievance.count(),

        prisma.grievance.count({
          where: {
            status: { not: 'RESOLVED' }
          }
        }),

        prisma.grievance.count({
          where: {
            status: 'RESOLVED'
          }
        }),

        prisma.grievance.count({
          where: {
            status: { not: 'RESOLVED' },
            createdAt: {
              lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        prisma.grievance.groupBy({
          by: ['district'],
          _count: { _all: true }
        }),

        prisma.grievance.groupBy({
          by: ['departmentId'],
          _count: { _all: true }
        })
      ]);

      res.json({
        total,
        pending,
        resolved,
        overdue,
        byDistrict,
        byDepartment
      });
    } catch (error) {
      next(error);
    }
  }
);

// Contact enquiry.
app.post('/api/contact', async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !subject?.trim() ||
      !message?.trim()
    ) {
      return res.status(400).json({
        error: 'All fields are required'
      });
    }

    await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim()
      }
    });

    res.status(201).json({
      message: 'Enquiry submitted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Central error handler.
app.use((err, req, res, next) => {
  console.error(err);

  if (err instanceof multer.MulterError) {
    return res.status(
      err.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    ).json({
      error: err.message
    });
  }

  const status = Number.isInteger(err.status)
    ? err.status
    : 400;

  res.status(status).json({
    error: err.message || 'Request failed'
  });
});

// Start server.
const port = Number(process.env.PORT) || 5000;

const server = app.listen(port, () => {
  console.log(`CM Kerala API running on port ${port}`);
});

// Graceful shutdown.
async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
