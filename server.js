const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG files are allowed.'));
        }
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database setup
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        createTables();
    }
});

// Create tables
function createTables() {
    // Users table
    const usersSql = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fullname TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    // Study materials table
    const materialsSql = `
        CREATE TABLE IF NOT EXISTS study_materials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            subject TEXT NOT NULL,
            file_path TEXT NOT NULL,
            uploaded_by INTEGER,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users(id)
        )
    `;
    
    db.run(usersSql, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created or already exists');
        }
    });

    db.run(materialsSql, (err) => {
        if (err) {
            console.error('Error creating study_materials table:', err);
        } else {
            console.log('Study materials table created or already exists');
        }
    });
}

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = 'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)';
        
        db.run(sql, [fullname, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Error creating user' });
            }
            
            res.status(201).json({ 
                message: 'User created successfully',
                userId: this.lastID 
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload study material endpoint
app.post('/api/materials/upload', upload.single('file'), (req, res) => {
    const { title, description, subject, userId } = req.body;
    const filePath = req.file.path;

    const sql = `
        INSERT INTO study_materials (title, description, subject, file_path, uploaded_by)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [title, description, subject, filePath, userId], function(err) {
        if (err) {
            console.error('Error uploading material:', err);
            return res.status(500).json({ error: 'Error uploading material' });
        }

        res.status(201).json({
            message: 'Material uploaded successfully',
            materialId: this.lastID
        });
    });
});

// Get all study materials endpoint
app.get('/api/materials', (req, res) => {
    const sql = `
        SELECT m.*, u.fullname as uploader_name
        FROM study_materials m
        LEFT JOIN users u ON m.uploaded_by = u.id
        ORDER BY m.upload_date DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error('Error fetching materials:', err);
            return res.status(500).json({ error: 'Error fetching materials' });
        }

        res.json(rows);
    });
});

// Get materials by subject
app.get('/api/materials/subject/:subject', (req, res) => {
    const sql = `
        SELECT m.*, u.fullname as uploader_name
        FROM study_materials m
        LEFT JOIN users u ON m.uploaded_by = u.id
        WHERE m.subject = ?
        ORDER BY m.upload_date DESC
    `;

    db.all(sql, [req.params.subject], (err, rows) => {
        if (err) {
            console.error('Error fetching materials:', err);
            return res.status(500).json({ error: 'Error fetching materials' });
        }

        res.json(rows);
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
