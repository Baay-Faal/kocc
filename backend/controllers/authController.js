const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Class } = require('../models');
require('dotenv').config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_kocc_jwt_key_1234567890', {
    expiresIn: '8h'
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Veuillez fournir un email et un mot de passe." });
    }

    const user = await User.findOne({
      where: { email },
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      return res.json({
        token: generateToken(user.id),
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          class: user.class
        }
      });
    } else {
      return res.status(401).json({ message: "Email ou mot de passe incorrect." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur lors de la connexion." });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
    });
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur de récupération de l'utilisateur." });
  }
};

module.exports = { login, getMe };
