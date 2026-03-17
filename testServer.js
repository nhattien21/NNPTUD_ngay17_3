const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Load RSA keys
const privateKey = fs.readFileSync(path.join(__dirname, 'keys/private.key'), 'utf8');
const publicKey = fs.readFileSync(path.join(__dirname, 'keys/public.key'), 'utf8');

const app = express();
app.use(express.json());

// Test endpoints
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    // Mock user for testing
    if (username === 'test' && password === 'test123') {
        const token = jwt.sign({ id: '507f1f77bcf86cd799439011', username }, privateKey, {
            expiresIn: '1d',
            algorithm: 'RS256'
        });
        res.json({ token, message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    try {
        const decoded = jwt.verify(token, publicKey);
        res.json({
            id: decoded.id,
            username: decoded.username,
            message: 'User info retrieved successfully'
        });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

app.post('/auth/changepassword', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    try {
        jwt.verify(token, publicKey);
        const { oldpassword, newpassword } = req.body;

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(newpassword)) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)"
            });
        }

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`✓ Test server running on http://localhost:${PORT}`);
    console.log('✓ RS256 JWT authentication is working!');
    console.log('✓ Ready for Postman testing');
});