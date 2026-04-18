const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// ==========================================
// Middleware 1: Request Logging System
// ==========================================
const reqLogger = (req, res, next) => {
    const start = Date.now();
    
    // Once the response finishes, log the details
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        
        // Log details: Timestamp, HTTP method, Request URL, Response status code, Response time
        const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${responseTime}ms\n`;
        
        // Store logs in a file
        fs.appendFile(path.join(logsDir, 'requests.log'), logEntry, (err) => {
            if (err) console.error('Failed to write to log file:', err);
        });

        // Also log to console for development
        console.log(logEntry.trim());
    });
    
    next();
};

module.exports = reqLogger;
