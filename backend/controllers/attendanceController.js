const { Attendance, Session, User, Class } = require('../models');

// Saisie de l'appel pour une séance
const markAttendance = async (req, res) => {
  const { sessionId, records } = req.body;

  try {
    if (!sessionId || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: "Données d'appel invalides ou manquantes." });
    }

    const session = await Session.findByPk(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Séance introuvable." });
    }

    // Process records
    const attendanceRecords = [];
    for (const record of records) {
      const { studentId, status, justification } = record;

      if (!studentId || !status) {
        continue;
      }

      // Upsert: look for existing attendance for this student and session
      let attendance = await Attendance.findOne({
        where: { sessionId, studentId }
      });

      if (attendance) {
        attendance.status = status;
        attendance.justification = justification || null;
        await attendance.save();
      } else {
        attendance = await Attendance.create({
          sessionId,
          studentId,
          status,
          justification: justification || null
        });
      }
      attendanceRecords.push(attendance);
    }

    return res.status(200).json({
      message: "Feuille d'appel enregistrée avec succès.",
      count: attendanceRecords.length
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de l'appel." });
  }
};

// Taux d'assiduité d'un étudiant
const getStudentStats = async (req, res) => {
  const { studentId } = req.params;

  try {
    const student = await User.findByPk(studentId, {
      where: { role: 'student' }
    });

    if (!student) {
      return res.status(404).json({ message: "Étudiant non trouvé." });
    }

    const records = await Attendance.findAll({
      where: { studentId }
    });

    const total = records.length;
    if (total === 0) {
      return res.json({
        studentId,
        attendanceRate: 100, // No classes missed if no records exist yet
        stats: { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
      });
    }

    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;

    // Attendance Rate calculation: present + late counts as attending
    // Excused is excluded or counted positively? Usually present + late count, excused counts, or we just calculate:
    // (present + late + excused) / total or simply (present + late) / total. Let's do (present + late) / total * 100
    const attendanceRate = Math.round(((present + late) / total) * 100);

    return res.json({
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      attendanceRate,
      stats: { total, present, absent, late, excused }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors du calcul des statistiques." });
  }
};

// Statistiques globales d'absentéisme d'une classe
const getClassStats = async (req, res) => {
  const { classId } = req.params;

  try {
    const targetClass = await Class.findByPk(classId);
    if (!targetClass) {
      return res.status(404).json({ message: "Classe introuvable." });
    }

    // Get all sessions for this class
    const sessions = await Session.findAll({
      where: { classId },
      attributes: ['id']
    });

    const sessionIds = sessions.map(s => s.id);

    if (sessionIds.length === 0) {
      return res.json({
        classId,
        className: targetClass.name,
        absenteeismRate: 0,
        message: "Aucune séance enregistrée pour cette classe."
      });
    }

    // Get all attendance records for these sessions
    const records = await Attendance.findAll({
      where: { sessionId: sessionIds }
    });

    const total = records.length;
    if (total === 0) {
      return res.json({
        classId,
        className: targetClass.name,
        absenteeismRate: 0,
        stats: { total: 0, present: 0, absent: 0, late: 0, excused: 0 }
      });
    }

    const absent = records.filter(r => r.status === 'absent').length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const excused = records.filter(r => r.status === 'excused').length;

    // Absenteeism Rate = absent / total * 100
    const absenteeismRate = Math.round((absent / total) * 100);

    return res.json({
      classId,
      className: targetClass.name,
      absenteeismRate,
      stats: { total, present, absent, late, excused }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur lors du calcul des statistiques de classe." });
  }
};

module.exports = {
  markAttendance,
  getStudentStats,
  getClassStats
};
