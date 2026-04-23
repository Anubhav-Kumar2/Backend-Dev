const PatientRecord = require('../models/PatientRecord');
const sanitizeHtml = require('sanitize-html');
const { auditLogger } = require('../config/logger');
exports.createRecord = async (req, res) => {
  const { patient, diagnosis, prescription, doctorNotes } = req.body;
  try {
    const cleanNotes = sanitizeHtml(doctorNotes, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'img': ['src']
      }
    });
    const medicalFiles = req.files ? req.files.map(file => ({
      filename: file.filename,
      path: file.path,
      originalName: file.originalname
    })) : [];
    const record = await PatientRecord.create({
      patient,
      doctor: req.user.id,
      diagnosis, 
      prescription, 
      doctorNotes: cleanNotes,
      medicalFiles
    });
    auditLogger.info(`Medical record created by ${req.user.role} ${req.user.id} for patient ${patient}`);
    res.status(201).json(record);
  } catch (error) {
    auditLogger.error(`Error creating medical record: ${error.message}`);
    res.status(500).json({ error: 'Server error creating record' });
  }
};
exports.getRecords = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'patient') {
      query.patient = req.user.id;
    } else if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    }
    const records = await PatientRecord.find(query)
      .populate('patient', 'name email')
      .populate('doctor', 'name email');
    auditLogger.info(`Records accessed by ${req.user.role} ${req.user.id}`);
    res.json(records);
  } catch (error) {
    auditLogger.error(`Error fetching medical records: ${error.message}`);
    res.status(500).json({ error: 'Server error fetching records' });
  }
};
