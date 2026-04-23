const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');
const patientRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diagnosis: {
    type: String,
    required: true,
    set: encrypt,
    get: decrypt
  },
  prescription: {
    type: String,
    set: encrypt,
    get: decrypt
  },
  doctorNotes: {
    type: String,
    required: true
  },
  medicalFiles: [{
    filename: String,
    path: String,
    originalName: String
  }]
}, {
  timestamps: true,
  toJSON: { getters: true }, 
  toObject: { getters: true }
});
const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);
module.exports = PatientRecord;
