var express = require("express");
var router = express.Router();
let userController = require('../controllers/users')
let { RegisterValidator, validationResult } = require('../utils/validatorHandler')
let { CheckLogin } = require('../utils/authHandler')
let jwt = require('jsonwebtoken')
let fs = require('fs')
let path = require('path')

// Load RSA private key
const privateKey = fs.readFileSync(path.join(__dirname, '../keys/private.key'), 'utf8')

router.post('/register', RegisterValidator, validationResult, async function (req, res, next) {
    try {
        let newItem = await userController.CreateAnUser(
            req.body.username, req.body.password, req.body.email,
            "69af870aaa71c433fa8dda8e"
        )
        res.send(newItem);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
})
router.post('/login', async function (req, res, next) {
    try {
        let { username, password } = req.body;
        let result = await userController.FindUserByUsername(username);
        if (!result) {
            res.status(403).send("sai thong tin dang nhap");
            return;
        }
        if (result.lockTime > Date.now()) {
            res.status(404).send("ban dang bi ban");
            return;
        }
        result = await userController.CompareLogin(result, password);
        if (!result) {
            res.status(403).send("sai thong tin dang nhap");
            return;
        }
        let token = jwt.sign({
            id:result._id
        }, privateKey, {
            expiresIn:'1d',
            algorithm:'RS256'
        })
        res.cookie("LOGIN_NNPTUD_S3", token, {
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true
        })
        res.send(token)

    } catch (err) {
        res.status(400).send({ message: err.message });
    }
})
router.get('/me', CheckLogin, function (req, res, next) {
    let user = req.user;
    res.send(user)
})
router.post('/changepassword', CheckLogin, async function (req, res, next) {
    try {
        let { oldpassword, newpassword } = req.body;
        let user = req.user;

        // Validate inputs
        if (!oldpassword || !newpassword) {
            res.status(400).send({ message: "oldpassword và newpassword là bắt buộc" });
            return;
        }

        // Validate newpassword strength (min 6 chars, has uppercase, lowercase, number, special char)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(newpassword)) {
            res.status(400).send({ 
                message: "Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)" 
            });
            return;
        }

        // Verify old password
        let result = await userController.CompareLogin(user, oldpassword);
        if (!result) {
            res.status(403).send({ message: "Mật khẩu cũ không chính xác" });
            return;
        }

        // Update password
        await userController.ChangePassword(user._id, newpassword);
        res.send({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
})
router.post('/logout', CheckLogin, function (req, res, next) {
    res.cookie("LOGIN_NNPTUD_S3", "", {
        maxAge: 0,
        httpOnly: true
    })
    res.send("da logout ")
})

module.exports = router;