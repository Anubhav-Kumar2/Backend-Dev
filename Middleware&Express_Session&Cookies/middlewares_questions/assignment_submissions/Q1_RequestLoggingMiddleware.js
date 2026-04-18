const reqLogger = (req, res, next) => {
    const now = new Date();
    
    const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    
    next();
};

module.exports = reqLogger;
