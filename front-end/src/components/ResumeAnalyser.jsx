import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import api from '../api';
import './ResumeAnalyser.css';
import { toast } from 'react-toastify';

const ResumeAnalyser = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [resumeHistory, setResumeHistory] = useState([]);
  const [consentGiven, setConsentGiven] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile && validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 5242880,
    multiple: false
  });

  const handlePrint = () => {
    const printContent = document.querySelector('.printable-content');
    const printWindow = window.open('', '', 'height=600,width=800');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Resume Analysis Report</title>
          <style>
            ${document.querySelector('style').innerText}
            body { 
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            .section { margin-bottom: 20px; }
            h1, h2, h3, h4 { color: #333; }
            .skill-tag, .role-tag {
              display: inline-block;
              padding: 5px 10px;
              margin: 5px;
              border-radius: 15px;
              background: #f0f0f0;
            }
            .proficiency-expert { background: #4CAF50; color: white; }
            .proficiency-intermediate { background: #2196F3; color: white; }
            .proficiency-beginner { background: #FFC107; }
          </style>
        </head>
        <body>
          <h1>${analysis.summary.candidateName} - Resume Analysis</h1>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('resume', file);
    try {
      setLoading(true);
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log("response", response.data.resumeId);
      setResumeId(response.data.resumeId);
      console.log("resumeId", resumeId);
      toast.success('Resume uploaded successfully');
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error.response?.data?.error?.message || 'Upload failed');
    }
  };

  const handleAnalyze = async (ID) => {
    if (!ID) {
      toast.error('No resume ID found');
      return;
    }
    try {
      setLoading(true);
      const response = await api.post(`/resume/analyze/${ID}`, {}, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      console.log("response", response);
      setAnalysis(response.data.analysis);
      console.log("analysis", analysis);
      setLoading(false);
      setShowHistory(false);
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.error?.message || 'Analysis failed');
    }
  };

  const fetchResumeHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/resume/history', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      console.log("response", response.data);
      setResumeHistory(response.data.resumes);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to fetch resume history');
    }
  };

  const validateFile = (file) => {
    if (file.size > 5242880) { // 5MB in bytes
      toast.error('File size must be less than 5MB');
      return false;
    }
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return false;
    }
    return true;
  };

  const retrieveAnalysis = async (ID) => {
    if (!ID) {
      toast.error('No resume ID found');
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/resume/analysis/${ID}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      console.log("response", response);
      setAnalysis(response.data.analysis.analysis);
      setLoading(false);
      setShowHistory(false);
    } catch (error) {
      setLoading(false);
      toast.error('Failed to retrieve analysis');
    }
  };

  const AnalysisDisplay = ({ data, onClose }) => (
    <div className="floating-frame analysis-display">
      <div className="analysis-header">
        <h2 className="candidate-name">{data.summary.candidateName}</h2>
        <div className="header-buttons">
          <button onClick={handlePrint} className="print-btn">
            <span className="print-icon">🖨️</span>
            Print Analysis
          </button>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
      </div>

      <div className="top-highlights">
        <div className="skills-highlights">
          <h4>Top Skills</h4>
          <div className="top-skills">
            {data.top4Skills.map((skill, index) => (
              <span 
                key={index} 
                className={`skill-tag proficiency-${skill.proficiencyLevel.toLowerCase()}`}
              >
                {skill.skill}
              </span>
            ))}
          </div>
        </div>
        
        <div className="roles-highlights">
          <h4>Recommended Roles</h4>
          <div className="future-roles">
            {data.futureRoleSuggestions.slice(0, 3).map((role, index) => (
              <span key={index} className="role-tag">
                {role.role}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      <div className="analysis-content printable-content">
        <section className="summary-section">
          <h4>Professional Summary</h4>
          <p>{data.summary.professionalSummary}</p>
        </section>

        <section className="skills-section">
          <h4>Skills Profile</h4>
          <div className="skills-grid">
            <div className="skill-category">
              <h5>Technical Skills</h5>
              <ul>
                {data.skills.technical.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
            <div className="skill-category">
              <h5>Non-Technical Skills</h5>
              <ul>
                {data.skills.nonTechnical.map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
              </ul>
            </div>
            {data.skills.certifications.length > 0 && (
              <div className="skill-category">
                <h5>Certifications</h5>
                <ul>
                  {data.skills.certifications.map((cert, index) => (
                    <li key={index}>{cert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="experience-section">
          <h4>Work Experience</h4>
          {data.workExperience.map((exp, index) => (
            <div key={index} className="experience-card">
              <div className="exp-header">
                <h5>{exp.position}</h5>
                <span className="duration">{exp.duration}</span>
              </div>
              <p className="company">{exp.company}</p>
              <div className="exp-details">
                <div>
                  <h6>Key Responsibilities:</h6>
                  <ul>
                    {exp.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6>Achievements:</h6>
                  <ul>
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="education-section">
          <h4>Education</h4>
          {data.education.map((edu, index) => (
            <div key={index} className="education-card">
              <h5>{edu.degree} in {edu.field}</h5>
              <p>{edu.institution}, {edu.year}</p>
              {edu.achievements.length > 0 && (
                <div>
                  <h6>Achievements:</h6>
                  <ul>
                    {edu.achievements.map((achievement, idx) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>

        <section className="projects-section">
          <h4>Key Projects</h4>
          {data.projects.map((project, index) => (
            <div key={index} className="project-card">
              <h5>{project.name}</h5>
              <p>{project.description}</p>
              <div className="project-details">
                <div>
                  <h6>Technologies Used:</h6>
                  <ul className="tech-list">
                    {project.technologies.map((tech, idx) => (
                      <li key={idx}>{tech}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h6>Key Highlights:</h6>
                  <ul>
                    {project.highlights.map((highlight, idx) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="competencies-section">
          <h4>Competency Assessment</h4>
          <div className="competencies-grid">
            <div>
              <h5>Technical Competencies</h5>
              <ul className="competency-list">
                {data.overallCompetencies.technical.map((comp, index) => (
                  <li key={index} className={`proficiency-${comp.proficiencyLevel.toLowerCase()}`}>
                    {comp.skill} - {comp.proficiencyLevel}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5>Non-Technical Competencies</h5>
              <ul className="competency-list">
                {data.overallCompetencies.nonTechnical.map((comp, index) => (
                  <li key={index} className={`proficiency-${comp.proficiencyLevel.toLowerCase()}`}>
                    {comp.skill} - {comp.proficiencyLevel}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="match-score-section">
          <h4>Match Analysis</h4>
          <div className="score-grid">
            <div className="score-item">
              <label>Overall Match:</label>
              <span className="score">{data.matchScore.overallScore}%</span>
            </div>
            <div className="score-item">
              <label>Skills Alignment:</label>
              <span className="score">{data.matchScore.skillsAlignment}%</span>
            </div>
            <div className="score-item">
              <label>Project Alignment:</label>
              <span className="score">{data.matchScore.projectAlignment}%</span>
            </div>
          </div>
        </section>

        <section className="career-path-section">
          <h4>Career Path Recommendations</h4>
          {data.futureRoleSuggestions.map((suggestion, index) => (
            <div key={index} className="career-suggestion-card">
              <h5>{suggestion.role}</h5>
              <p>{suggestion.reason}</p>
              <div className="career-details">
                <div>
                  <h6>Required Skills:</h6>
                  <ul>
                    {suggestion.requiredSkills.map((skill, idx) => (
                      <li key={idx}>{skill}</li>
                    ))}
                  </ul>
                </div>
                {suggestion.skillGaps.length > 0 && (
                  <div>
                    <h6>Skills to Develop:</h6>
                    <ul className="skill-gaps">
                      {suggestion.skillGaps.map((gap, idx) => (
                        <li key={idx}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );

  const HistoryTable = ({ history }) => (
    <div className="floating-frame history-table-container">
      <div className="frame-header">
        <h3>Resume Analysis History</h3>
        <button className="close-btn" onClick={() => setShowHistory(false)}>&times;</button>
      </div>
      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>File Name</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.map((item) => (
            <tr key={item._id}>
              <td>{new Date(item.uploadDate).toLocaleDateString()}</td>
              <td>{item.fileName}</td>
              <td>{item.status}</td>
              <td className="action-buttons">
                {item.status === 'analyzed' ? (
                  <button 
                    onClick={() => {retrieveAnalysis(item._id); console.log("item._id", item._id);}}
                    className="retrieve-btn"
                  >
                    View Analysis
                  </button>
                ) : (
                  <button 
                    onClick={() => handleAnalyze(item._id)}
                    className="analyze-btn"
                  >
                    Analyze Resume
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="resume-analyser">
      <div className="header">
        <h2>Resume Analysis</h2>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>

      {!showHistory && (
        <div className="content-section">
          <div className="upload-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              <div className="dropzone-content">
                {file ? (
                  <>
                    <span className="file-icon">📄</span>
                    <p className="selected-file">Selected file: {file.name}</p>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">📁</span>
                    <p>Drag and drop your resume here, or click to select</p>
                    <p className="file-types">Accepts PDF, DOC, DOCX (Max 5MB)</p>
                  </>
                )}
              </div>
            </div>

            {file && !resumeId && (
              <div className="consent-section">
                <div className="consent-checkbox">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                  />
                  <label htmlFor="consent">I consent to the analysis of my resume data</label>
                </div>
                <button 
                  onClick={handleUpload}
                  disabled={!consentGiven || loading}
                  className="primary-btn"
                >
                  Upload Resume
                </button>
              </div>
            )}

            {resumeId && !analysis && (
              <div className="analyze-section">
                <button 
                  onClick={() => handleAnalyze(resumeId)}
                  disabled={loading}
                  className="primary-btn analyze-btn"
                >
                  Analyze Resume
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="history-controls">
        <button 
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) fetchResumeHistory();
          }}
          className="secondary-btn"
        >
          {showHistory ? 'Hide History' : 'View History'}
        </button>
      </div>

      {showHistory && resumeHistory.length > 0 && (
        <HistoryTable history={resumeHistory} />
      )}

      {analysis && (
        <AnalysisDisplay data={analysis} onClose={() => setAnalysis(null)} />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Processing...</p>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyser;