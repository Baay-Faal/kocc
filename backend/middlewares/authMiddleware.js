const jwt = require('jsonwebtoken');
const { User } = require('../models');
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_kocc_jwt_key_1234567890');
      
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non trouvé." });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Non autorisé, token invalide." });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Non autorisé, token absent." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accès interdit : privilèges insuffisants." });
    }
    next();
  };
};

module.exports = { protect, authorize };
