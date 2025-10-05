require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/college-events');
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing users)
    // await User.deleteMany({});
    // console.log('Cleared existing users');

    // Default users
    const defaultUsers = [
      {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@vcet.edu',
        password: 'admin123',
        mobile: '9876543210',
        role: 'admin'
      },
      {
        firstName: 'Event',
        lastName: 'Coordinator',
        email: 'coordinator@vcet.edu',
        password: 'coord123',
        mobile: '9876543211',
        role: 'coordinator'
      },
      {
        firstName: 'John',
        lastName: 'Student',
        email: 'john.student@vcet.edu',
        password: 'student123',
        mobile: '9876543212',
        role: 'user'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@vcet.edu',
        password: 'student123',
        mobile: '9876543213',
        role: 'user'
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

    console.log('\n✅ User seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@vcet.edu / admin123');
    console.log('Coordinator: coordinator@vcet.edu / coord123');
    console.log('Student: john.student@vcet.edu / student123');
    
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedUsers();