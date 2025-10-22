require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-events');
    console.log('Connected to MongoDB');

    // Clear all existing users from the database
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create default admin and coordinator users
    const defaultUsers = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@mec.ac.in',
        password: 'admin123',
        mobile: '9876543210',
        role: 'admin'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator1',
        email: 'coordinator1@mec.ac.in',
        password: 'coord123',
        mobile: '9876543211',
        role: 'coordinator'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator2',
        email: 'coordinator2@mec.ac.in',
        password: 'coord456',
        mobile: '9876543212',
        role: 'coordinator'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator3',
        email: 'coordinator3@mec.ac.in',
        password: 'coord789',
        mobile: '9876543213',
        role: 'coordinator'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator4',
        email: 'coordinator4@mec.ac.in',
        password: 'coord101',
        mobile: '9876543214',
        role: 'coordinator'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator5',
        email: 'coordinator5@mec.ac.in',
        password: 'coord202',
        mobile: '9876543215',
        role: 'coordinator'
      }
    ];

    // Create users if they don't exist
    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`Created ${userData.role}: ${userData.email}`);
      } else {
        console.log(`User already exists: ${userData.email}`);
      }
    }

    console.log('\n✅ Database cleared successfully!');
    console.log('\nAll users have been removed. New users can register through the signup form.');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedUsers();