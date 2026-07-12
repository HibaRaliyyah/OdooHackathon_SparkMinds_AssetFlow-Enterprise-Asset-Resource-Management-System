import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { sendSuccess, sendError } from '../utils/response.util';
import { sendEmail, emailTemplates } from '../config/email';
import ActivityLog from '../models/ActivityLog';

const generateToken = (id: string, role: string, department?: string) =>
  jwt.sign({ id, role, department }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, role, department, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      firstName, lastName, email, password, role, department, phone,
      emailVerificationToken: verificationToken,
    });

    await sendEmail(email, 'Verify Your Email — AssetFlow',
      emailTemplates.verification(firstName, verificationToken));

    const token = generateToken(user.id, user.role, user.department?.toString());
    sendSuccess(res, { token, user }, 'Registration successful. Check email for verification.', 201);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('department');
    if (!user || !user.isActive) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    await ActivityLog.create({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id,
      performedBy: user._id,
      ipAddress: req.ip,
      description: `${user.fullName} logged in`,
    });

    const token = generateToken(user.id, user.role, user.department?.toString());
    sendSuccess(res, { token, user }, 'Login successful');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token } = req.body;
    const user = await User.findOne({ email, emailVerificationToken: token });
    if (!user) {
      sendError(res, 'Invalid or expired verification code', 400);
      return;
    }
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();
    sendSuccess(res, null, 'Email verified successfully');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      sendSuccess(res, null, 'If email exists, reset code has been sent');
      return;
    }
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendEmail(email, 'Password Reset — AssetFlow',
      emailTemplates.passwordReset(user.firstName, token));
    sendSuccess(res, null, 'Reset code sent to email');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, token, newPassword } = req.body;
    const user = await User.findOne({
      email,
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user) {
      sendError(res, 'Invalid or expired reset code', 400);
      return;
    }
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    sendSuccess(res, null, 'Password reset successfully');
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};

export const getMe = async (req: Request & { user?: { id: string } }, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).populate('department');
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user);
  } catch (err: unknown) {
    sendError(res, (err as Error).message, 500);
  }
};
