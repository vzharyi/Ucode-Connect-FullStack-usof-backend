import jwt from 'jsonwebtoken';
import { isTokenBlacklisted } from './tokenBlacklist.js';

const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (isTokenBlacklisted(token)) {
        return res.status(403).json({ error: 'Token is invalid, please log in again' });
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token is invalid' });
        }

        req.user = user;
        next();
    });
};

export default authenticateToken;
