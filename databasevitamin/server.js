// LIBRARIES
const express = require('express');
const app = express();
const mysql = require('mysql2');
const mongoose = require('mongoose');

// ============ SQL CONNECTION ============
// You'll need: host, user, password, and database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'companyDB'
});

// MySQL Connection Verification
function verifyMySQLConnection() {
    connection.connect(function(err) {
        if (err) {
            console.error('Error connecting to MySQL: ' + err.stack);
            return;
        }
        console.log('MySQL connected as id ' + connection.threadId);
    });
}

// ============ MONGODB CONNECTION ============
// Your connection string should point to localhost and the companyDB database
mongoose.connect('mongodb://localhost:27017/companyDB');


const ProjectSchema = new mongoose.Schema({
    name: String,
    budget: Number
});

const ProjectModel = mongoose.model('Project', ProjectSchema);

// MongoDB Connection Verification
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// ============ ENDPOINTS ============
// Middleware to parse JSON request bodies
app.use(express.json());

// ------ MONGODB ENDPOINTS ------

// Use ProjectModel.find({}) and return the results as JSON using .json()
app.get('/projects', async (req, res) => {
    const projects = await ProjectModel.find({});
    res.json(projects);
});

// Create a new ProjectModel with req.body, save it, and return with status 201
app.post('/projects', async (req, res) => {
    const project = new ProjectModel(req.body);
    await project.save();
    res.status(201).json(project);
});

// Use req.params.id and ProjectModel.findByIdAndDelete()
// Return status 200 on success
app.delete('/projects/:id', async (req, res) => {
    const project = await ProjectModel.findByIdAndDelete(req.params.id);
    res.sendStatus(200);
});

// ------ MYSQL ENDPOINTS ------
// IMPORTANT: Use ? placeholders for user input instead of string concatenation!
// Example: connection.query('SELECT * FROM users WHERE id = ?', [userId], callback)
// This prevents SQL injection attacks where malicious users could insert
// harmful SQL code through input fields and damage your database.

// Use connection.query() with SELECT * FROM employees
// Return the results as JSON using .json()
app.get('/employees', function (req, res) {
    connection.query('SELECT * FROM employees', function (results) {
        res.json(results);
    });
});

// Use connection.query() with INSERT INTO
// Return the new employee's id with status 201
app.post('/employees', function (req, res) {
    const { name, position, salary } = req.body;
    connection.query(
        'INSERT INTO employees (name, position, salary) VALUES (?, ?, ?)',
        [name, position, salary],
        function (result) {
            res.status(201).json({ id: result.insertId });
        }
    );
});

// Use req.params.id and DELETE FROM with a WHERE clause
// Return status 200 on success
app.delete('/employees/:id', function (req, res) {
    connection.query(
        'DELETE FROM employees WHERE id = ?',
        [req.params.id],
        function (result) {
            res.sendStatus(200);
        }
    );
});

// ============ START SERVER ============
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
    verifyMySQLConnection();
});