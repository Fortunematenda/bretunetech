import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import prisma from '../../lib/prisma';
import { signToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { RegisterDto, LoginDto, UpdateProfileDto, CreateAdminDto, UpdateAdminDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../lib/errors';
import { logger } from '../../lib/logger';

const log = logger.child('AuthService');

const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'cp69.domains.co.za',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER || 'sales@bretunetech.com',
    pass: process.env.SMTP_PASS,
  },
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function frontendBaseUrl() {
  return (
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN?.split(',')[0]?.trim() ||
    'https://bretunetech.com'
  ).replace(/\/$/, '');
}

function hashResetToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function sendOtpEmail(email: string, firstName: string, otp: string) {
  try {
    await mailer.sendMail({
      from: `"Bretunetech" <${process.env.SMTP_USER || 'sales@bretunetech.com'}>`,
      to: email,
      subject: 'Verify your Bretunetech account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#003d7a;margin-bottom:8px;">Welcome, ${firstName}!</h2>
          <p style="color:#374151;margin-bottom:24px;">Use the code below to verify your email address. It expires in <strong>15 minutes</strong>.</p>
          <div style="text-align:center;background:#fff;border:2px dashed #003d7a;border-radius:8px;padding:24px;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#003d7a;">${otp}</span>
          </div>
          <p style="color:#6b7280;font-size:13px;">If you did not create an account, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error: any) {
    log.error('Failed to send OTP email', { 
      email, 
      error: error.message,
      smtpResponse: error.response
    });
    throw new Error('Failed to send verification email. Please try again later.');
  }
}

async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
  if (!process.env.SMTP_PASS) {
    log.error('SMTP_PASS is not configured — cannot send password reset email');
    throw new Error('Email service is not configured. Please contact support.');
  }

  try {
    const info = await mailer.sendMail({
      from: `"BretuneTech" <${process.env.SMTP_USER || 'sales@bretunetech.com'}>`,
      to: email,
      subject: 'Reset your BretuneTech password',
      text: `Hi ${firstName || 'there'},\n\nReset your BretuneTech password using this link (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:12px;">
          <h2 style="color:#003d7a;margin-bottom:8px;">Hi ${firstName || 'there'},</h2>
          <p style="color:#374151;margin-bottom:24px;">
            We received a request to reset your BretuneTech password. This link expires in <strong>1 hour</strong>.
          </p>
          <div style="text-align:center;margin-bottom:24px;">
            <a href="${resetUrl}" style="display:inline-block;background:#003d7a;color:#fff;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:8px;">
              Reset Password
            </a>
          </div>
          <p style="color:#6b7280;font-size:13px;word-break:break-all;">Or copy this link:<br/>${resetUrl}</p>
          <p style="color:#6b7280;font-size:13px;margin-top:16px;">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
    log.info('Password reset SMTP accepted', {
      toDomain: email.split('@')[1] || 'unknown',
      messageId: info.messageId,
      response: info.response,
    });
  } catch (error: any) {
    log.error('Failed to send password reset email', {
      toDomain: email.split('@')[1] || 'unknown',
      error: error.message,
      smtpResponse: error.response,
      code: error.code,
    });
    throw new Error('Failed to send password reset email. Please try again later.');
  }
}

export class AuthService {
  async register(dto: RegisterDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email } });
    if (existing && existing.isVerified) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // Send email first - if it fails, don't create the user
    await sendOtpEmail(dto.email, dto.firstName, otp);

    let user;
    if (existing && !existing.isVerified) {
      // Re-send OTP to existing unverified account (re-register)
      log.info('Updating existing unverified user with OTP', { email: dto.email, otp, otpExpiry });
      user = await prisma.user.update({
        where: { email: dto.email },
        data: { 
          passwordHash, 
          firstName: dto.firstName, 
          lastName: dto.lastName, 
          phone: dto.phone, 
          emailOtp: otp, 
          emailOtpExpiry: otpExpiry,
          acceptedTerms: dto.acceptedTerms,
          termsAcceptedAt: dto.acceptedTerms ? new Date() : null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });
      log.info('User updated successfully', { userId: user.id, email: user.email });
    } else {
      log.info('Creating new user with OTP', { email: dto.email, otp, otpExpiry });
      user = await prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          isVerified: false,
          emailOtp: otp,
          emailOtpExpiry: otpExpiry,
          acceptedTerms: dto.acceptedTerms,
          termsAcceptedAt: dto.acceptedTerms ? new Date() : null,
        },
        select: { id: true, email: true, firstName: true, lastName: true, role: true },
      });
      log.info('User created successfully', { userId: user.id, email: user.email });
    }

    log.info('User registered — OTP sent', { userId: user.id, email: user.email });

    return { requiresVerification: true, email: user.email };
  }

  async resendOtp(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundError('Account not found');
    if (user.isVerified) throw new ConflictError('Account is already verified');

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { emailOtp: otp, emailOtpExpiry: otpExpiry },
    });

    await sendOtpEmail(email, user.firstName, otp);
    log.info('OTP resent', { email });

    return { message: 'Verification code resent' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid verification attempt');
    if (user.isVerified) throw new ConflictError('Account already verified');
    if (!user.emailOtp || user.emailOtp !== otp) throw new UnauthorizedError('Invalid OTP code');
    if (!user.emailOtpExpiry || user.emailOtpExpiry < new Date()) throw new UnauthorizedError('OTP has expired — please register again');

    const verified = await prisma.user.update({
      where: { email },
      data: { isVerified: true, emailOtp: null, emailOtpExpiry: null },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, customRoleId: true },
    });

    const token = signToken({ userId: verified.id, email: verified.email, role: verified.role, customRoleId: verified.customRoleId });
    const refreshToken = signRefreshToken({ userId: verified.id, email: verified.email, role: verified.role, customRoleId: verified.customRoleId });

    log.info('User verified', { userId: verified.id });
    return { user: verified, token, refreshToken };
  }

  async login(dto: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || user.isDeleted) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    if (!user.isVerified && user.role === 'CUSTOMER') throw new UnauthorizedError('Please verify your email before logging in');

    const token = signToken({ userId: user.id, email: user.email, role: user.role, customRoleId: user.customRoleId });
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, customRoleId: user.customRoleId });

    log.info('User logged in', { userId: user.id });
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        customRoleId: user.customRoleId,
      },
      token,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, customRoleId: true },
    });
    if (!user) throw new UnauthorizedError('Invalid refresh token');

    const newToken = signToken({ userId: user.id, email: user.email, role: user.role, customRoleId: user.customRoleId });
    const newRefreshToken = signRefreshToken({ userId: user.id, email: user.email, role: user.role, customRoleId: user.customRoleId });

    return { token: newToken, refreshToken: newRefreshToken };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, role: true, avatarUrl: true, createdAt: true,
        customRoleId: true, addresses: true,
      },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async createAdmin(dto: CreateAdminDto, requesterRole: string) {
    if (requesterRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Only super admin can create admin users');
    }

    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictError('User with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: dto.role,
        isVerified: true,
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    log.info('Admin user created', { userId: user.id, role: user.role, createdBy: requesterRole });
    return user;
  }

  async getAdminUsers(requesterRole: string) {
    if (requesterRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Only super admin can view admin users');
    }

    // Use raw SQL to avoid enum issues
    const users = await prisma.$queryRaw<any[]>`
      SELECT 
        id, 
        email, 
        "firstName", 
        "lastName", 
        role, 
        phone, 
        "isVerified", 
        "createdAt",
        "customRoleId"
      FROM "users" 
      WHERE role IN ('ADMIN', 'STAFF', 'VENDOR', 'SUPER_ADMIN')
      ORDER BY "createdAt" DESC
    `;

    return users;
  }

  async deleteAdminUser(userId: string, requesterRole: string) {
    if (requesterRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Only super admin can delete admin users');
    }

    // Get user info using raw SQL to avoid enum issues
    const users = await prisma.$queryRaw<any[]>`
      SELECT * FROM "users" WHERE id = ${userId} LIMIT 1
    `;

    if (users.length === 0) throw new NotFoundError('User');
    const user = users[0];

    if (user.role === 'SUPER_ADMIN') {
      throw new UnauthorizedError('Cannot delete super admin users');
    }

    log.info('Attempting to delete admin user', { userId, role: user.role, customRoleId: user.customRoleId });

    // Use transaction to handle foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Clear customRoleId if user has one
      if (user.customRoleId) {
        log.info('Clearing customRoleId', { userId, customRoleId: user.customRoleId });
        await tx.$executeRaw`
          UPDATE "users" SET "customRoleId" = NULL WHERE id = ${userId}
        `;
      }

      // Delete related records that have foreign key constraints
      // Orders
      await tx.$executeRaw`
        DELETE FROM "Order" WHERE "userId" = ${userId}
      `;
      // ServiceBookings
      await tx.$executeRaw`
        DELETE FROM "ServiceBooking" WHERE "userId" = ${userId}
      `;
      // Enquiries
      await tx.$executeRaw`
        DELETE FROM "Enquiry" WHERE "userId" = ${userId}
      `;
      // Reviews
      await tx.$executeRaw`
        DELETE FROM "Review" WHERE "userId" = ${userId}
      `;
      // Addresses
      await tx.$executeRaw`
        DELETE FROM "Address" WHERE "userId" = ${userId}
      `;

      // Delete the user
      log.info('Deleting user', { userId });
      const result = await tx.$executeRaw`
        DELETE FROM "User" WHERE id = ${userId}
      `;
    });

    log.info('Admin user deleted', { userId, role: user.role, deletedBy: requesterRole });
    return { success: true };
  }

  async updateAdminUser(userId: string, dto: UpdateAdminDto, requesterRole: string) {
    if (requesterRole !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Only super admin can update admin users');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundError('User');
    if (user.role === 'SUPER_ADMIN' && dto.role && dto.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedError('Cannot change super admin role');
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictError('Email already in use');
      }
    }

    // Build update data, hash password if provided
    const updateData: any = { ...dto };
    if (updateData.password) {
      updateData.passwordHash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      },
    });

    log.info('Admin user updated', { userId, role: updated.role, updatedBy: requesterRole });
    return updated;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true },
    });
    return user;
  }

  /**
   * Always returns the same message (no email enumeration).
   * Sends a reset link when a verified, active account exists.
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    const genericMessage =
      'If an account exists for that email, we have sent password reset instructions.';

    // Case-insensitive match — older rows may not be stored lowercase.
    const user = await prisma.user.findFirst({
      where: {
        email: { equals: dto.email, mode: 'insensitive' },
        isDeleted: false,
      },
    });

    if (!user) {
      log.info('Password reset skipped — no matching account', {
        emailDomain: dto.email.split('@')[1] || 'unknown',
      });
      return { message: genericMessage };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: expiresAt,
      },
    });

    const resetUrl = `${frontendBaseUrl()}/reset-password?token=${rawToken}`;
    try {
      await sendPasswordResetEmail(user.email, user.firstName, resetUrl);
    } catch (err) {
      // Don't leave a usable token if the email never left the server.
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpiry: null },
      });
      throw err;
    }

    log.info('Password reset email sent', {
      userId: user.id,
      emailDomain: user.email.split('@')[1] || 'unknown',
    });
    return { message: genericMessage };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashResetToken(dto.token);
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: { gt: new Date() },
        isDeleted: false,
      },
    });

    if (!user) {
      throw new UnauthorizedError('This reset link is invalid or has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiry: null,
        // Completing reset also confirms the email if it was never verified.
        isVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    log.info('Password reset completed', { userId: user.id });
    return { message: 'Your password has been updated. You can sign in with your new password.' };
  }
}

export const authService = new AuthService();
