const { spawn } = require('child_process');
const path = require('path');

// Start MongoDB (assumes MongoDB is installed and in PATH)
const mongoProcess = spawn('mongod', [], {
    shell: true,
    stdio: 'inherit'
});

mongoProcess.on('error', (error) => {
    console.error('Failed to start MongoDB:', error);
});

// Wait for MongoDB to start
setTimeout(() => {
    // Start the Node.js server
    const serverProcess = spawn('node', ['index.js'], {
        stdio: 'inherit'
    });

    serverProcess.on('error', (error) => {
        console.error('Failed to start server:', error);
    });
}, 2000); // Wait 2 seconds for MongoDB to start