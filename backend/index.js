const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration with Duplicate File Check
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const filePath = path.join(uploadDir, file.originalname);
        
        if (fs.existsSync(filePath)) {
            return cb(new Error('File already exists. Duplicate uploads are not allowed.'));
        }

        cb(null, file.originalname);
    }
});

// File Type Filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['text/plain', 'text/csv'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .txt and .csv are allowed.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// API Route to Handle File Upload
app.post('/upload', upload.single('file'), (req, res, next) => {
    if (!req.file) {
        return next(new Error('File upload failed.'));
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(400).json({ error: err.message });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));