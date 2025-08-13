import { Request, Response } from 'express';
import Doctor from '../models/Doctor.js';
import Organization from '../models/Organization.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';

// @desc    Login doctor or organization
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // First, try to find a doctor with this email
    const doctor = await Doctor.findOne({ email }).select('+password').populate('organization', 'name');
    
    if (doctor && (await doctor.comparePassword(password))) {
      // Doctor login successful
      const token = generateToken(doctor._id!.toString());
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: doctor._id,
          email: doctor.email,
          fullName: doctor.fullName,
          specialty: doctor.specialty,
          organization: doctor.organization,
          type: 'doctor'
        },
        token
      });
    }

    // If doctor not found, try to find an organization with this email
    const organization = await Organization.findOne({ email }).select('+password');
    
    if (organization && (await organization.comparePassword(password))) {
      // Organization login successful
      const token = generateToken(organization._id!.toString());
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: organization._id,
          email: organization.email,
          fullName: organization.name, // Use name as fullName for organizations
          name: organization.name,
          type: 'organization'
        },
        token
      });
    }

    // Neither doctor nor organization found with valid credentials
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Register new doctor
// @route   POST /api/auth/signup/doctor
// @access  Public
export const signupDoctor = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, specialty, organizationId } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide fullName, email, and password'
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

    // Validate organization if provided
    let organization = null;
    if (organizationId) {
      organization = await Organization.findById(organizationId);
      if (!organization) {
        return res.status(400).json({
          success: false,
          message: 'Invalid organization ID'
        });
      }
    }

    // Create doctor
    const doctor = await Doctor.create({
      fullName,
      email,
      password,
      specialty,
      organization: organizationId || null
    });

    // Generate token
    const token = generateToken(doctor._id!.toString());

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully',
      data: {
        id: doctor._id,
        email: doctor.email,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        organization: organization,
        type: 'doctor'
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during doctor registration',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Register new organization
// @route   POST /api/auth/signup/organization
// @access  Public
export const signupOrganization = async (req: Request, res: Response) => {
  try {
    const { name, email, password, type } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide organization name, email, and password'
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
      email,
      password,
      type: type || 'hospital'
    });

    // Generate token
    const token = generateToken(organization._id!.toString());

    res.status(201).json({
      success: true,
      message: 'Organization account created successfully',
      data: {
        id: organization._id,
        email: organization.email,
        fullName: organization.name, // Use name as fullName for consistency
        name: organization.name,
        type: 'organization'
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during organization registration',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Get current user info
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const { doctor, organization, user } = req;
    
    if (!user && !doctor && !organization) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // If it's a doctor
    if (doctor) {
      return res.status(200).json({
        success: true,
        data: {
          id: doctor._id,
          email: doctor.email,
          fullName: doctor.fullName,
          specialty: doctor.specialty,
          organization: doctor.organization,
          type: 'doctor'
        }
      });
    }

    // If it's an organization
    if (organization) {
      return res.status(200).json({
        success: true,
        data: {
          id: organization._id,
          email: organization.email,
          fullName: organization.name, // Use name as fullName for organizations
          name: organization.name,
          type: 'organization'
        }
      });
    }

    // Fallback to generic user object
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error getting user info',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};

// @desc    Logout doctor (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
