const bcrypt = require('bcryptjs');
const { User, Class, Course } = require('../models');

// ================= USER CRUD =================

const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, classId } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "Veuillez remplir tous les champs obligatoires." });
    }

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      classId: role === 'student' ? classId : null // Class only applies to students
    });

    // Return user without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json(userResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la création de l'utilisateur." });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
    });
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Class, as: 'class', attributes: ['id', 'name'] }]
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, email, password, role, classId } = req.body;
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }
      user.email = email;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    user.classId = role === 'student' ? classId : null;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.json(userResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    await user.destroy();
    return res.json({ message: "Utilisateur supprimé avec succès." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

// ================= CLASS CRUD =================

const createClass = async (req, res) => {
  const { name, department } = req.body;
  try {
    if (!name || !department) {
      return res.status(400).json({ message: "Nom et département obligatoires." });
    }
    const classExists = await Class.findOne({ where: { name } });
    if (classExists) {
      return res.status(400).json({ message: "Cette classe existe déjà." });
    }
    const newClass = await Class.create({ name, department });
    return res.status(201).json(newClass);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getClasses = async (req, res) => {
  try {
    const classes = await Class.findAll();
    return res.json(classes);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getClassById = async (req, res) => {
  try {
    const item = await Class.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Classe non trouvée." });
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const updateClass = async (req, res) => {
  const { name, department } = req.body;
  try {
    const item = await Class.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Classe non trouvée." });

    if (name) item.name = name;
    if (department) item.department = department;

    await item.save();
    return res.json(item);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const deleteClass = async (req, res) => {
  try {
    const item = await Class.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: "Classe non trouvée." });
    await item.destroy();
    return res.json({ message: "Classe supprimée avec succès." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ================= COURSE CRUD =================

const createCourse = async (req, res) => {
  const { code, title, coefficient } = req.body;
  try {
    if (!code || !title) {
      return res.status(400).json({ message: "Code et titre obligatoires." });
    }
    const courseExists = await Course.findOne({ where: { code } });
    if (courseExists) {
      return res.status(400).json({ message: "Ce cours existe déjà." });
    }
    const course = await Course.create({ code, title, coefficient });
    return res.status(201).json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    return res.json(courses);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours non trouvé." });
    return res.json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const updateCourse = async (req, res) => {
  const { code, title, coefficient } = req.body;
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours non trouvé." });

    if (code) course.code = code;
    if (title) course.title = title;
    if (coefficient !== undefined) course.coefficient = coefficient;

    await course.save();
    return res.json(course);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Cours non trouvé." });
    await course.destroy();
    return res.json({ message: "Cours supprimé avec succès." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

// ================= STUDENTS IN CLASS =================

const getStudentsByClass = async (req, res) => {
  const { classId } = req.params;
  try {
    const students = await User.findAll({
      where: { classId, role: 'student' },
      attributes: { exclude: ['password'] }
    });
    return res.json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

const importStudentsBulk = async (req, res) => {
  const { students } = req.body;

  try {
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ message: "Format de données invalide." });
    }

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('kocc1234', salt);

    let createdCount = 0;
    const errors = [];
    const classCache = {};

    for (const item of students) {
      const { firstName, lastName, email, className } = item;

      if (!firstName || !lastName || !email || !className) {
        errors.push({ email: email || 'Inconnu', message: "Champs obligatoires manquants." });
        continue;
      }

      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        errors.push({ email, message: "Cet e-mail est déjà utilisé." });
        continue;
      }

      let classRecord = classCache[className.toUpperCase()];
      if (!classRecord) {
        classRecord = await Class.findOne({ where: { name: className } });
        if (classRecord) {
          classCache[className.toUpperCase()] = classRecord;
        }
      }

      if (!classRecord) {
        errors.push({ email, message: `Classe "${className}" introuvable.` });
        continue;
      }

      await User.create({
        firstName,
        lastName,
        email,
        password: defaultPassword,
        role: 'student',
        classId: classRecord.id
      });

      createdCount++;
    }

    return res.json({
      message: "Importation en masse terminée.",
      createdCount,
      errors
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur lors de l'importation." });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getStudentsByClass,
  importStudentsBulk
};
