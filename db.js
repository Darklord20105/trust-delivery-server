const mongoose = require('mongoose');

const uri = 'mongodb+srv://darklord20105:QeRCVRYtKekabnBq@deliverysystemdatabasec.fzwpffr.mongodb.net/?retryWrites=true&w=majority&appName=DeliverySystemDatabaseCluster'

const db = mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  dbName: 'TrustDeliveryDB',
}).then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);

    // Handle specific error conditions
    if (error.name === 'MongoNetworkError') {
      console.error('Network error occurred. Check your MongoDB server.');
    } else if (error.name === 'MongooseServerSelectionError') {
       console.error('Server selection error. Ensure'
	  + ' MongoDB is running and accessible.');
    } else {
      // Handle other types of errors
      console.error('An unexpected error occurred:', error);
    }
});

const connectionstatus = mongoose.connection

connectionstatus.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

connectionstatus.once('open', () => {
    console.log('Connected to MongoDB');
});

connectionstatus.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});


module.export = db
