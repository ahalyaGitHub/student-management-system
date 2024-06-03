const express = require('express');
const router = express.Router();
const Users = require('../models/users');
const fs = require('fs');
const multer = require('multer');

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
});

var upload = multer({ storage: storage });

// Route to render the Add User page
router.get('/add', (req, res) => {
    res.render('add_users', {
        title: 'Add User'
    });
});

// Insert a user into the database route
router.post('/add', upload.single('image'), async (req, res) => {
    if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).send('No file uploaded.');
    }

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

// Edit a user route
router.get('/edit/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let user = await Users.findById(id);
        
        if (!user) {
            return res.redirect('/');
        }

        res.render("edit_users", {
            title: "Edit User",
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect("/");
    }
});

// Update user route
router.post('/update/:id', upload.single('image'), async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            // Ensure old_image is defined before attempting to delete it
            if (req.body.old_image) {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            }
        } catch (error) {
            console.error('Error deleting old image:', error);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        await Users.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete user route
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const result = await Users.findByIdAndDelete(id);
        if (result && result.image) {
            try {
                fs.unlinkSync('./uploads/' + result.image);
            } catch (error) {
                console.error('Error deleting image:', error);
            }
        }

        req.session.message = {
            type: 'info',
            message: 'User deleted successfully!',
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message });
    }
});


module.exports = router;
