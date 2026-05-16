import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
  getLeadStats,
} from '../controllers/leadsController';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All routes require authentication
router.use(authenticate);

const createLeadValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('status')
    .optional()
    .isIn(['New', 'Contacted', 'Qualified', 'Lost'])
    .withMessage('Invalid status'),
  body('source')
    .notEmpty()
    .isIn(['Website', 'Instagram', 'Referral'])
    .withMessage('Source must be Website, Instagram, or Referral'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters'),
];

const updateLeadValidation = [
  param('id').isMongoId().withMessage('Invalid lead ID'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('status').optional().isIn(['New', 'Contacted', 'Qualified', 'Lost']),
  body('source').optional().isIn(['Website', 'Instagram', 'Referral']),
  body('notes').optional().isLength({ max: 1000 }),
];

router.get('/stats', authorizeRoles('admin', 'sales'), getLeadStats);
router.get('/export', authorizeRoles('admin', 'sales'), exportLeadsCSV);
router.get('/', authorizeRoles('admin', 'sales'), getLeads);
router.get('/:id', [param('id').isMongoId()], authorizeRoles('admin', 'sales'), getLead);
router.post('/', validate(createLeadValidation), authorizeRoles('admin', 'sales'), createLead);
router.put('/:id', validate(updateLeadValidation), authorizeRoles('admin', 'sales'), updateLead);
router.delete('/:id', [param('id').isMongoId()], authorizeRoles('admin', 'sales'), deleteLead);

export default router;
