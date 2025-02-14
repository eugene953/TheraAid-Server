import jwt from 'jsonwebtoken';

// Define the generateToken function
const generateToken = (user: { id: number; role: 'user' | 'admin' }) => {
  return jwt.sign(
    { id: user.id, role: user.role }, // Include `id` and `role`
    process.env.JWT_SECRET || 'zDJzXV5W5mR0Ysz2uJNhfoWvEutpZwVnPt2bG1ipnEU=',
    { expiresIn: '1h' }
  );
};

// Export the generateToken function
export { generateToken };
