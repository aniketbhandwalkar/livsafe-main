import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import Organization from '../models/Organization.js';
import Doctor from '../models/Doctor.js';
import MedicalImage from '../models/MedicalImage.js';
import Patient from '../models/Patient.js'; // Added import for Patient

// @desc    Get organization dashboard data
// @route   GET /api/organization/dashboard
// @access  Private
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { organization } = req;
    
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Organization access required'
      });
    }

    // Get doctors in this organization with their patient counts
    const doctors = await Doctor.find({ organization: organization._id })
      .select('fullName specialty patients createdAt')
      .populate('patients', 'fullName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get total doctors in this organization
    const totalDoctors = await Doctor.countDocuments({ organization: organization._id });

    // Get today's records
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalRecordsToday = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: today, $lt: tomorrow }
    });

    // Get this month's records
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const totalRecordsMonth = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: startOfMonth }
    });

    // Get last month's records for comparison
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setDate(0);

    const lastMonthRecords = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: startOfLastMonth, $lt: endOfLastMonth }
    });

    // Get yesterday's records for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBeforeYesterday = new Date(yesterday);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

    const yesterdayRecords = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: yesterday, $lt: today }
    });

    const dayBeforeYesterdayRecords = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: dayBeforeYesterday, $lt: yesterday }
    });

    // Calculate changes
    const doctorsChange = lastMonthRecords > 0 
      ? `+${Math.max(0, totalDoctors - lastMonthRecords)} from last month`
      : '+0 from last month';

    const recordsTodayChange = dayBeforeYesterdayRecords > 0
      ? `+${Math.max(0, totalRecordsToday - dayBeforeYesterdayRecords)} from yesterday`
      : '+0 from yesterday';

    const recordsMonthChange = lastMonthRecords > 0
      ? `+${Math.max(0, totalRecordsMonth - lastMonthRecords)} from last month`
      : '+0 from last month';

    // Format doctors data with proper ID system
    const formattedDoctors = doctors.map((doctor, index) => {
      // Generate sequential ID with organization name prefix
      const orgName = organization.name.replace(/\s+/g, '').toUpperCase().substring(0, 3);
      const sequentialId = String(index + 1).padStart(3, '0');
      const displayId = `${orgName}-${sequentialId}`;
      
      return {
        id: doctor._id,
        displayId: displayId,
        fullName: doctor.fullName,
        specialty: doctor.specialty || 'General',
        patientCount: doctor.patients.length,
        joinedDate: new Date(doctor.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      };
    });

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalDoctors,
          doctorsChange,
          totalRecordsToday,
          recordsTodayChange,
          totalRecordsMonth,
          recordsMonthChange
        },
        doctors: formattedDoctors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organization dashboard',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get all organizations
// @route   GET /api/organization/all
// @access  Private
export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const organizations = await Organization.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organizations',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get single organization
// @route   GET /api/organization/:id
// @access  Private
export const getOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Get doctors in this organization
    const doctors = await Doctor.find({ organization: id })
      .select('-password')
      .populate('patients', 'fullName');

    res.status(200).json({
      success: true,
      data: {
        organization,
        doctors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Create new organization
// @route   POST /api/organization
// @access  Private
export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Organization name and email are required'
      });
    }

    // Check if organization already exists
    const existingOrganization = await Organization.findOne({ email });
    if (existingOrganization) {
      return res.status(400).json({
        success: false,
        message: 'Organization already exists with this email'
      });
    }

    // Create organization
    const organization = await Organization.create({
      name,
      email
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error creating organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Update organization
// @route   PUT /api/organization/:id
// @access  Private
export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, type } = req.body;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Check if email is already taken by another organization
    if (email && email !== organization.email) {
      const existingOrg = await Organization.findOne({ email });
      if (existingOrg) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another organization'
        });
      }
    }

    // Update fields
    if (name !== undefined) organization.name = name;
    if (email !== undefined) organization.email = email;
    if (type !== undefined) organization.type = type;

    await organization.save();

    res.status(200).json({
      success: true,
      message: 'Organization updated successfully',
      data: organization
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Delete organization
// @route   DELETE /api/organization/:id
// @access  Private
export const deleteOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Set all doctors in this organization to independent (organization: null)
    await Doctor.updateMany(
      { organization: id },
      { organization: null }
    );

    // Delete organization
    await Organization.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get doctors in organization
// @route   GET /api/organization/:id/doctors
// @access  Private
export const getDoctorsInOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    const doctors = await Doctor.find({ organization: id })
      .select('-password')
      .populate('patients', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting doctors in organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Add doctor to organization
// @route   POST /api/organization/:id/doctors
// @access  Private
export const addDoctorToOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, password, specialty } = req.body;

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required'
      });
    }

    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with this email'
      });
    }

    // Create doctor with organization
    const doctor = await Doctor.create({
      fullName,
      email,
      password,
      specialty,
      organization: id
    });

    // Return doctor without password
    const doctorResponse = await Doctor.findById(doctor._id)
      .select('-password')
      .populate('organization', 'name');

    res.status(201).json({
      success: true,
      message: 'Doctor added to organization successfully',
      data: doctorResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error adding doctor to organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Remove doctor from organization
// @route   DELETE /api/organization/:id/doctors/:doctorId
// @access  Private
export const removeDoctorFromOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { id, doctorId } = req.params;

    console.log('Removing doctor:', doctorId, 'from organization:', id);

    // Verify organization exists
    const organization = await Organization.findById(id);
    if (!organization) {
      console.log('Organization not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    // Verify doctor exists and belongs to this organization
    const doctor = await Doctor.findOne({ _id: doctorId, organization: id });
    if (!doctor) {
      console.log('Doctor not found in organization:', doctorId, 'org:', id);
      return res.status(404).json({
        success: false,
        message: 'Doctor not found in this organization'
      });
    }

    console.log('Found doctor:', doctor.fullName, 'removing from organization');

    // Set doctor as independent (remove organization)
    doctor.organization = null;
    await doctor.save();

    console.log('Doctor successfully removed from organization');

    res.status(200).json({
      success: true,
      message: 'Doctor removed from organization successfully'
    });
  } catch (error) {
    console.error('Error removing doctor from organization:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing doctor from organization',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get organization analytics data
// @route   GET /api/organization/analytics
// @access  Private
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { organization } = req;
    const { timeRange = '30' } = req.query;
    
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Organization access required'
      });
    }

    const days = parseInt(timeRange as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total doctors in this organization
    const totalDoctors = await Doctor.countDocuments({ organization: organization._id });

    // Get total patients across all doctors in this organization
    const doctors = await Doctor.find({ organization: organization._id }).populate('patients');
    const allPatients = doctors.reduce((acc: any[], doctor) => {
      return acc.concat(doctor.patients);
    }, []);
    const uniquePatients = [...new Set(allPatients.map(p => p._id.toString()))];
    const totalPatients = uniquePatients.length;

    // Get total records for this organization
    const totalRecords = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) }
    });

    // Get records for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const recordsThisMonth = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: startOfMonth }
    });

    // Get records for last month
    const startOfLastMonth = new Date(startOfMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setDate(0);
    
    const recordsLastMonth = await MedicalImage.countDocuments({
      doctor: { $in: doctors.map(d => d._id) },
      uploadedAt: { $gte: startOfLastMonth, $lt: startOfMonth }
    });

    // Calculate growth rate
    const growthRate = recordsLastMonth > 0 
      ? ((recordsThisMonth - recordsLastMonth) / recordsLastMonth) * 100 
      : 0;

    // Get top specialties
    const specialtyStats = await Doctor.aggregate([
      { $match: { organization: organization._id } },
      { $group: { _id: '$specialty', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topSpecialties = specialtyStats.map(item => ({
      specialty: item._id || 'General',
      count: item.count
    }));

    // Get monthly trends for the last 6 months
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const records = await MedicalImage.countDocuments({
        doctor: { $in: doctors.map(d => d._id) },
        uploadedAt: { $gte: monthStart, $lt: monthEnd }
      });

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        records
      });
    }

    // Get doctor activity (records and patients in the last 30 days)
    const doctorActivity = await Promise.all(
      doctors.map(async (doctor) => {
        const records = await MedicalImage.countDocuments({
          doctor: doctor._id,
          uploadedAt: { $gte: startDate }
        });

        const patients = await Patient.countDocuments({
          doctors: doctor._id
        });

        return {
          doctorName: doctor.fullName,
          records,
          patients
        };
      })
    );

    // Sort by records and take top 10
    const topDoctorActivity = doctorActivity
      .sort((a, b) => b.records - a.records)
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalRecords,
        recordsThisMonth,
        recordsLastMonth,
        growthRate: Math.round(growthRate * 10) / 10, // Round to 1 decimal place
        topSpecialties,
        monthlyTrends,
        doctorActivity: topDoctorActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting analytics',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get organization patients
// @route   GET /api/organization/patients
// @access  Private
export const getOrganizationPatients = async (req: AuthRequest, res: Response) => {
  try {
    const { organization } = req;
    const { page = 1, limit = 50, search = '' } = req.query;
    
    if (!organization) {
      return res.status(401).json({
        success: false,
        message: 'Organization access required'
      });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get all doctors in this organization
    const organizationDoctors = await Doctor.find({ organization: organization._id }).select('_id fullName specialty');

    // Build search query for patients
    const searchQuery = search 
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { gender: { $regex: search, $options: 'i' } }
          ],
          doctors: { $in: organizationDoctors.map(d => d._id) }
        }
      : { doctors: { $in: organizationDoctors.map(d => d._id) } };

    // Get patients with pagination
    const patients = await Patient.find(searchQuery)
      .populate('doctors', 'fullName specialty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPatients = await Patient.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalPatients / limitNum);

    // Get medical record counts for each patient
    const patientsWithRecords = await Promise.all(
      patients.map(async (patient) => {
        const recordCount = await MedicalImage.countDocuments({ patient: patient._id });
        
        // Get the most recent record for last visit
        const lastRecord = await MedicalImage.findOne({ patient: patient._id })
          .sort({ uploadedAt: -1 })
          .select('uploadedAt');

        // Determine assigned doctor (first doctor in the list)
        const doctorsPopulated = patient.doctors as unknown as Array<{ fullName?: string }>;
        const assignedDoctor = doctorsPopulated.length > 0 && doctorsPopulated[0]?.fullName
          ? doctorsPopulated[0].fullName
          : 'Unassigned';

        return {
          id: patient._id,
          fullName: patient.fullName,
          age: patient.age || 0,
          gender: patient.gender || 'Unknown',
          assignedDoctor,
          recordCount,
          lastVisit: lastRecord?.uploadedAt || patient.createdAt,
          status: recordCount > 0 ? 'active' : 'inactive',
          doctors: patient.doctors,
          createdAt: patient.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: patientsWithRecords,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalPatients,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting organization patients',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};
