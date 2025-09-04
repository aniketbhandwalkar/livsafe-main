import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import MedicalImage from '../models/MedicalImage.js';
import mongoose from 'mongoose';

// @desc    Get doctor dashboard data
// @route   GET /api/doctor/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.doctor._id;

    // Get total records for this doctor
    const totalRecords = await MedicalImage.countDocuments({ doctor: doctorId });

    // Get monthly records (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRecords = await MedicalImage.countDocuments({
      doctor: doctorId,
      uploadedAt: { $gte: startOfMonth }
    });
    
    // Get year-to-date records
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    
    const yearToDateRecords = await MedicalImage.countDocuments({
      doctor: doctorId,
      uploadedAt: { $gte: startOfYear }
    });

    // Get recent records
    const recentRecords = await MedicalImage.find({ doctor: doctorId })
      .populate('patient', 'fullName')
      .sort({ uploadedAt: -1 })
      .limit(10)
      .lean();

    // Format recent records for frontend
    const formattedRecords = recentRecords.map((record: any) => ({
      id: record._id,
      patientName: record.patient.fullName,
      date: new Date(record.uploadedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      grade: record.grade || 'Pending',
      confidence: record.confidence
    }));

    // Get grade distribution
    const gradeDistribution = await MedicalImage.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(doctorId), grade: { $exists: true } } },
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Format grade distribution for chart
    const gradeColors = {
      'F0': '#3b82f6',
      'F1': '#22c55e',
      'F2': '#eab308',
      'F3': '#f97316',
      'F4': '#ef4444'
    };

    const formattedDistribution = gradeDistribution.map((item: any) => ({
      name: item._id,
      value: item.count,
      color: gradeColors[item._id as keyof typeof gradeColors] || '#6b7280'
    }));

    // Calculate real analytics based on actual data
    
    // Get previous month data for comparison
    const startOfPreviousMonth = new Date();
    startOfPreviousMonth.setMonth(startOfPreviousMonth.getMonth() - 1);
    startOfPreviousMonth.setDate(1);
    startOfPreviousMonth.setHours(0, 0, 0, 0);
    
    const endOfPreviousMonth = new Date();
    endOfPreviousMonth.setMonth(endOfPreviousMonth.getMonth());
    endOfPreviousMonth.setDate(1);
    endOfPreviousMonth.setHours(0, 0, 0, 0);
    
    const previousMonthRecords = await MedicalImage.countDocuments({
      doctor: doctorId,
      uploadedAt: { $gte: startOfPreviousMonth, $lt: endOfPreviousMonth }
    });
    
    // Debug logging
    console.log('Date ranges for analytics:');
    console.log('Current month start:', startOfMonth);
    console.log('Previous month start:', startOfPreviousMonth);
    console.log('Previous month end:', endOfPreviousMonth);
    console.log('Current month records:', monthlyRecords);
    console.log('Previous month records:', previousMonthRecords);
    
    // Calculate total change (current month vs previous month)
    const totalChange = monthlyRecords - previousMonthRecords;
    let totalChangeText;
    if (previousMonthRecords === 0 && monthlyRecords > 0) {
      totalChangeText = `+${monthlyRecords} (first month with records)`;
    } else {
      totalChangeText = totalChange >= 0 
        ? `+${totalChange} from last month` 
        : `${totalChange} from last month`;
    }
    
    // Calculate monthly change (current month vs previous month)
    const monthlyChange = monthlyRecords - previousMonthRecords;
    let monthlyChangeText;
    if (previousMonthRecords === 0 && monthlyRecords > 0) {
      monthlyChangeText = `+${monthlyRecords} (first month with records)`;
    } else {
      monthlyChangeText = monthlyChange >= 0 
        ? `+${monthlyChange} from previous month` 
        : `${monthlyChange} from last month`;
    }
    
    // Calculate real accuracy based on records with grades
    const recordsWithGrades = await MedicalImage.countDocuments({ 
      doctor: doctorId, 
      grade: { $exists: true, $ne: null } 
    });
    
    const accuracy = totalRecords > 0 ? Math.round((recordsWithGrades / totalRecords) * 100) : 0;
    
    // Get accuracy from previous month for comparison
    const previousMonthWithGrades = await MedicalImage.countDocuments({
      doctor: doctorId,
      grade: { $exists: true, $ne: null },
      uploadedAt: { $gte: startOfPreviousMonth, $lt: endOfPreviousMonth }
    });
    
    const previousMonthTotal = await MedicalImage.countDocuments({
      doctor: doctorId,
      uploadedAt: { $gte: startOfPreviousMonth, $lt: endOfPreviousMonth }
    });
    
    const previousMonthAccuracy = previousMonthTotal > 0 
      ? Math.round((previousMonthWithGrades / previousMonthTotal) * 100) 
      : 0;
    
    const accuracyChange = accuracy - previousMonthAccuracy;
    let accuracyChangeText;
    if (previousMonthTotal === 0 && totalRecords > 0) {
      accuracyChangeText = `+${accuracy}% (first month with records)`;
    } else {
      accuracyChangeText = accuracyChange >= 0 
        ? `+${accuracyChange}% from last month` 
        : `${accuracyChange}% from last month`;
    }
    
    // Debug logging for accuracy
    console.log('Accuracy calculations:');
    console.log('Total records:', totalRecords);
    console.log('Records with grades:', recordsWithGrades);
    console.log('Current accuracy:', accuracy);
    console.log('Previous month accuracy:', previousMonthAccuracy);
    console.log('Accuracy change:', accuracyChange);
    
    // Calculate average confidence for records with confidence scores
    const confidenceAggregation = await MedicalImage.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(doctorId), confidence: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } }
    ]);
    
    const averageConfidence = confidenceAggregation.length > 0 
      ? Math.round(confidenceAggregation[0].avgConfidence) 
      : 0;

    // Debug logging for final response
    console.log('Final dashboard stats:');
    console.log('Total Records:', totalRecords);
    console.log('Total Change:', totalChangeText);
    console.log('Monthly Records:', monthlyRecords);
    console.log('Monthly Change:', monthlyChangeText);
    console.log('Accuracy:', accuracy);
    console.log('Accuracy Change:', accuracyChangeText);
    
    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalRecords,
          totalChange: totalChangeText,
          monthlyRecords,
          monthlyChange: monthlyChangeText,
          yearToDateRecords,
          accuracy,
          accuracyChange: accuracyChangeText,
          averageConfidence
        },
        recentRecords: formattedRecords,
        gradeDistribution: formattedDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting dashboard data',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/doctor/all
// @access  Private
export const getAllDoctors = async (req: AuthRequest, res: Response) => {
  try {
    const doctors = await Doctor.find()
      .select('-password')
      .populate('organization', 'name')
      .populate('patients', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting doctors',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctor/profile/:id
// @access  Private
export const getDoctorProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const doctor = await Doctor.findById(id)
      .select('-password')
      .populate('organization', 'name')
      .populate('patients', 'fullName age gender');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting doctor profile',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Assign patient to doctor
// @route   PUT /api/doctor/assign-patient
// @access  Private
export const assignPatientToDoctor = async (req: AuthRequest, res: Response) => {
  try {
    const { doctorId, patientId } = req.body;

    if (!doctorId || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both doctorId and patientId'
      });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Check if patient is already assigned to this doctor
    if (doctor.patients.includes(new mongoose.Types.ObjectId(patientId))) {
      return res.status(400).json({
        success: false,
        message: 'Patient is already assigned to this doctor'
      });
    }

    // Add patient to doctor's patients array
    doctor.patients.push(new mongoose.Types.ObjectId(patientId));
    await doctor.save();

    // Add doctor to patient's doctors array
    if (!patient.doctors.includes(new mongoose.Types.ObjectId(doctorId))) {
      patient.doctors.push(new mongoose.Types.ObjectId(doctorId));
      await patient.save();
    }

    res.status(200).json({
      success: true,
      message: 'Patient assigned to doctor successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error assigning patient to doctor',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get all medical records/images for a doctor
// @route   GET /api/doctor/records
// @access  Private
export const getRecords = async (req: AuthRequest, res: Response) => {
  try {
    const doctorId = req.doctor._id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const records = await MedicalImage.find({ doctor: doctorId })
      .populate('patient', 'fullName age gender')
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalRecords = await MedicalImage.countDocuments({ doctor: doctorId });
    const totalPages = Math.ceil(totalRecords / limitNum);

    res.status(200).json({
      success: true,
      data: records,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalRecords,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting records',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get single medical record
// @route   GET /api/doctor/records/:id
// @access  Private
export const getRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor._id;

    const record = await MedicalImage.findOne({ _id: id, doctor: doctorId })
      .populate('patient', 'fullName age gender')
      .populate('doctor', 'fullName specialty');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting record',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Delete single medical record
// @route   DELETE /api/doctor/records/:id
// @access  Private
export const deleteRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doctorId = req.doctor._id;

    const record = await MedicalImage.findOne({ _id: id, doctor: doctorId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    await MedicalImage.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting record',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
