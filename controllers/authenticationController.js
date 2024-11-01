import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import User from '../models/user.js';
import { blacklistToken } from '../middleware/tokenBlacklist.js';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
        user: "rosemarie.windler@ethereal.email",
        pass: "pXUV3PeFKkXncqdehZ",
    },
});
class AuthenticationController {
    async register(req, res) {
        try {
            const { login, password, password_confirmation, full_name, email } = req.body;
            if (!login || !password || !password_confirmation || !email) {
                return res.status(400).json({ error: 'All required fields must be filled' });
            }
            if (password !== password_confirmation) {
                return res.status(400).json({ error: 'Passwords do not match' });
            }

            const existingUser = await User.findOne({ where: { [Op.or]: [{ login }, { email }] } });
            if (existingUser) {
                return res.status(400).json({ error: 'Login or email is already in use' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const defaultProfilePicture = '../uploads/avatars/default.png';

            const newUser = await User.create({
                login,
                password: hashedPassword,
                full_name: full_name || null,
                email,
                email_verified: false,
                profile_picture: defaultProfilePicture,
            });

            const verificationToken = jwt.sign({ id: newUser.id }, 'your_jwt_secret', { expiresIn: '5m' });
            const verificationLink = `http://localhost:3000/api/auth/verify-email/${verificationToken}`;

            await transporter.sendMail({
                from: '"Registration Confirmation" <support@usof.com>',
                to: email,
                subject: "Registration Confirmation",
                text: `Confirm your email: ${verificationLink}`,
                html: `<p>Confirm your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
            });

            return res.status(201).json({ message: 'Registration successful. Please confirm your email' });
        } catch (error) {
            return res.status(500).json({ error: 'Registration error', details: error.message });
        }
    }

    async login(req, res) {
        try {
            const { login, password } = req.body;

            const user = await User.findOne({ where: { login } });
            if (!user || !user.email_verified) {
                return res.status(400).json({ error: 'Invalid login, password, or email not verified' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: 'Invalid login or password' });
            }

            const token = jwt.sign({ id: user.id }, 'your_jwt_secret', { expiresIn: '12h' });

            return res.status(200).json({ token });
        } catch (error) {
            return res.status(500).json({ error: 'Authorization error' });
        }
    }

    async logout(req, res) {
        try {
            const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

            if (!token) {
                return res.status(400).json({ error: 'Token not provided' });
            }

            blacklistToken(token);
            return res.status(200).json({ message: 'Successfully logged out' });
        } catch (error) {
            return res.status(500).json({ error: 'Logout error', details: error.message });
        }
    }

    async sendPasswordResetEmail(req, res) {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const resetToken = jwt.sign({ email }, 'your_jwt_secret', { expiresIn: '5m' });

        const resetLink = `http://localhost:3000/api/auth/password-reset/${resetToken}`;

        try {
            await transporter.sendMail({
                from: '"Support" <support@usof.com>',
                to: email,
                subject: "Password Reset",
                text: `Please use the following link to reset your password: ${resetLink}`,
                html: `<p>Please use the following link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
            });

            res.status(200).json({ message: 'Password reset link sent to your email' });
        } catch (error) {
            console.error("Error sending password reset email:", error);
            res.status(500).json({ error: 'Error sending email' });
        }
    }

    async confirmNewPassword(req, res) {
        const { confirm_token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        try {
            const decoded = jwt.verify(confirm_token, 'your_jwt_secret');
            const { email } = decoded;

            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const hashedConfirmNewPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedConfirmNewPassword;
            await user.save();

            res.status(200).json({ message: 'Password updated successfully' });
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(400).json({ error: 'Token expired, please request a password reset again' });
            }
            res.status(500).json({ error: 'New password confirmation error' });
        }
    }

    async verifyEmail(req, res) {
        const { confirm_token } = req.params;

        if (!confirm_token) {
            return res.status(400).json({ error: 'Token is missing in the request' });
        }

        try {
            const decoded = jwt.verify(confirm_token, 'your_jwt_secret');
            const user = await User.findByPk(decoded.id);

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            user.email_verified = true;
            await user.save();

            res.status(200).json({ message: 'Email successfully verified' });
        } catch (error) {
            console.error('Verification error:', error);
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
    }
}

export default new AuthenticationController();
