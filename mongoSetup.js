const { MongoMemoryServer } = require('mongodb-memory-server');

async function startMongoDB() {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        console.log('In-Memory MongoDB started at:', mongoUri);
        
        // Export for use in app.js
        process.env.MONGODB_URI = mongoUri;
        
        return mongoServer;
    } catch (err) {
        console.error('Error starting MongoDB:', err);
        process.exit(1);
    }
}

module.exports = startMongoDB;
