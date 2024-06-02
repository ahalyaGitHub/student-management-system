const express = require('express');
const router = express.Router();
const Users = require('../models/users');
// Uploading image
const multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // path where we will move the image
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

// Middleware
var upload = multer({
    storage: storage,
}).single('image'); // name attribute in label image

// Insert a user into the database route
router.post('/add', upload, async (req, res) => {
    const user = new Users({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    try {
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Get all users route 
router.get("/", async (req, res) => {
    try {
        const users = await Users.find().exec();
        res.render('index', {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message });
    }
});



router.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' });
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
});

router.get('/edit/:id', (req, res) => {
    let id = req.params.id;
    
});

module.exports = router;
