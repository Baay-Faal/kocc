import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { 
  FileText, 
  Download, 
  Trash2, 
  Upload, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  File
} from 'lucide-react';

const CourseDocuments = () => {
  const userJson = localStorage.getItem('kocc_user');
  
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!userJson) return null;
  const user = JSON.parse(userJson);
  const { role } = user;

  const isTeacher = role === 'teacher' || role === 'admin';

  // 1. Charger les matières associées à l'utilisateur
  useEffect(() => {
    const fetchUserCourses = async () => {
      try {
        setLoading(true);
        let res;
        if (role === 'student' && user.classId) {
          res = await API.get(`/sessions/class/${user.classId}`);
        } else {
          res = await API.get('/sessions/teacher');
        }

        const uniqueCoursesMap = {};
        res.data.forEach(session => {
          if (session.Course) {
            uniqueCoursesMap[session.Course.id] = session.Course;
          }
        });
        
        const coursesList = Object.values(uniqueCoursesMap);
        setCourses(coursesList);
        
        if (coursesList.length > 0) {
          setSelectedCourseId(coursesList[0].id);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des cours :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();
  }, [role, user.classId]);

  // 2. Charger les documents de la matière sélectionnée
  const fetchDocuments = async () => {
    if (!selectedCourseId) return;
    try {
      const res = await API.get(`/documents/course/${selectedCourseId}`);
      setDocuments(res.data);
    } catch (err) {
      console.error("Erreur de chargement des documents :", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [selectedCourseId]);

  // Saisie du fichier
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Uploader un document (Enseignant uniquement)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file || !selectedCourseId || uploadLoading) return;

    setUploadLoading(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('title', title);
    formData.append('courseId', selectedCourseId);
    formData.append('file', file);

    try {
      await API.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: "Le document de cours a été téléversé avec succès. Les élèves ont été notifiés." });
      setTitle('');
      setFile(null);
      // Réinitialiser l'input file du DOM
      document.getElementById('file-upload-input').value = '';
      
      // Recharger la liste
      fetchDocuments();
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: "Erreur lors du téléversement du fichier (Max 10 Mo, formats acceptés: PDF, DOCX, PPTX)." });
    } finally {
      setUploadLoading(false);
    }
  };

  // Supprimer un document (Enseignant auteur ou Admin)
  const handleDeleteDocument = async (docId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce support de cours définitivement ?")) return;

    try {
      await API.delete(`/documents/${docId}`);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setMessage({ type: 'success', text: "Support de cours supprimé avec succès." });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: "Impossible de supprimer ce document." });
    }
  };

  return (
    <div className="documents-wrapper fade-in">
      {/* Header */}
      <header className="documents-header">
        <div>
          <h1 className="welcome-title">Supports de Cours</h1>
          <p className="welcome-subtitle">
            Partagez et téléchargez les supports pédagogiques au format numérique.
          </p>
        </div>

        {/* Sélecteur de Matière */}
        {courses.length > 0 && (
          <div className="class-filter">
            <BookOpen size={18} className="filter-icon" />
            <select 
              value={selectedCourseId} 
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="kocc-input filter-select"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      {message.text && (
        <div className={`login-error-box ${message.type === 'success' ? 'success-box' : ''}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <p className="loading-placeholder">Chargement des cours...</p>
      ) : courses.length === 0 ? (
        <p className="empty-placeholder">Aucune matière n'est actuellement rattachée à votre classe.</p>
      ) : (
        <div className="documents-grid-layout">
          
          {/* Formulaire de Dépôt (Teacher uniquement) */}
          {isTeacher && (
            <div className="kocc-card upload-form-card">
              <div className="upload-header">
                <Upload size={20} className="filter-icon" />
                <h3 className="card-section-title">Déposer un Support de Cours</h3>
              </div>
              
              <form onSubmit={handleUploadSubmit} className="upload-form">
                <div className="input-group">
                  <label className="input-label" htmlFor="doc-title">Titre du document</label>
                  <input
                    id="doc-title"
                    type="text"
                    className="kocc-input"
                    placeholder="Ex: Chapitre 1 - Introduction Express..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="file-upload-input">Fichier (PDF, DOCX, PPTX - Max 10 Mo)</label>
                  <input
                    id="file-upload-input"
                    type="file"
                    className="kocc-input file-input"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.pptx"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="kocc-btn kocc-btn-primary full-width-btn"
                  disabled={uploadLoading || !file}
                >
                  {uploadLoading ? "Téléversement en cours..." : "Publier le document"}
                </button>
              </form>
            </div>
          )}

          {/* Grille des documents disponibles */}
          <div className="documents-list-section">
            <h3 className="card-section-title text-left mb-1-5">Fichiers Disponibles</h3>
            
            {documents.length === 0 ? (
              <p className="empty-placeholder">Aucun document partagé pour cette matière.</p>
            ) : (
              <div className="doc-cards-grid">
                {documents.map((doc) => (
                  <div key={doc.id} className="kocc-card doc-item-card">
                    <div className="doc-card-icon-box">
                      <FileText size={24} className="doc-type-icon" />
                    </div>
                    
                    <div className="doc-card-body text-left">
                      <h4 className="doc-card-title">{doc.title}</h4>
                      <p className="doc-card-meta">
                        Type: {doc.fileType.toUpperCase()} • Mis en ligne par: M. {doc.teacher?.lastName || 'Enseignant'}
                      </p>
                    </div>

                    <div className="doc-card-actions">
                      <a
                        href={`http://localhost:5000/uploads/${doc.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="kocc-btn kocc-btn-secondary doc-action-icon-btn"
                        title="Télécharger"
                      >
                        <Download size={16} />
                      </a>

                      {(role === 'admin' || doc.teacherId === user.id) && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="kocc-btn kocc-btn-danger doc-action-icon-btn"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CourseDocuments;
