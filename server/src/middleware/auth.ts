import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';
import Organization from '../models/Organization.js';

export interface AuthRequest extends Request {
  doctor?: any;
  organization?: any;
  user?: any; // Generic user (can be doctor or organization)
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      // First try to find a doctor with this ID
      const doctor = await Doctor.findById(decoded.id).select('-password').populate('organization', 'name');
      
      if (doctor) {
        req.doctor = doctor;
        req.user = { ...doctor.toObject(), type: 'doctor' };
        return next();
      }

      // If no doctor found, try to find an organization with this ID
      const organization = await Organization.findById(decoded.id).select('-password');
      
      if (organization) {
        req.organization = organization;
        req.user = { ...organization.toObject(), type: 'organization' };
        return next();
      }

      // Neither doctor nor organization found
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found'
      });

    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in auth middleware'
    });
  }
};

// Generate JWT token
export const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: '30d',
  });
};
