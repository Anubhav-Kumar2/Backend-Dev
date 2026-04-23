const express = require('express');
const { createRecord, getRecords } = require('../controllers/recordController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const validateRecord = [
  body('patient').notEmpty().withMessage('Patient ID is required').isMongoId().withMessage('Invalid Patient ID format'),
  body('diagnosis').notEmpty().withMessage('Diagnosis is required').trim().escape(),
  body('prescription').optional().trim().escape(),
  body('doctorNotes').notEmpty().withMessage('Doctor notes are required'), 
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
router.route('/')
  .post(
    protect,
    authorize('doctor', 'admin'), 
    upload.array('medicalFiles', 5), 
    validateRecord,
    createRecord
  )
  .get(
    protect,
    authorize('patient', 'doctor', 'nurse', 'admin'), 
    getRecords
  );
module.exports = router;
