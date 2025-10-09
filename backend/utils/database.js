import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'data', 'database.json');

// Default data dengan user yang sudah di-hash
const defaultData = {
  users: [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@company.com',
      password: '$2a$10$8K1p/a0dRTlR0d.6G2bQ3O9b2Q1c5vYVWkZ5YJZ8X3cV5nN9sJ7K', // admin123
      role: 'admin',
      position: 'System Administrator',
      department: 'IT',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: '2', 
      name: 'Regular User',
      email: 'user@company.com',
      password: '$2a$10$8K1p/a0dRTlR0d.6G2bQ3O9b2Q1c5vYVWkZ5YJZ8X3cV5nN9sJ7K', // admin123
      role: 'user',
      position: 'Staff',
      department: 'Operations',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  attendance: []
};

export const readDB = async () => {
  try {
    const data = await readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Jika file tidak ada, buat dengan default data
    console.log('📁 Database not found, creating with default data...');
    await initDB();
    return defaultData;
  }
};

export const writeDB = async (data) => {
  try {
    await writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database:', error);
    throw error;
  }
};

export const initDB = async () => {
  try {
    // Hash passwords properly
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const dataWithHashedPasswords = {
      users: [
        {
          ...defaultData.users[0],
          password: hashedPassword
        },
        {
          ...defaultData.users[1], 
          password: hashedPassword
        }
      ],
      attendance: []
    };
    
    await writeFile(DB_PATH, JSON.stringify(dataWithHashedPasswords, null, 2));
    console.log('✅ Database initialized with default users');
    console.log('👤 Admin: admin@company.com / admin123');
    console.log('👤 User: user@company.com / admin123');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};