import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const formatDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

export const getTodayDate = () => {
  return formatDate(new Date());
};