import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';
import './CourseOutlineGenerator.css';

const CourseOutlineGenerator = ({ onOutlineGenerated, onClose }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    jobDescription: '',
    technologyStack: '',
    duration: '',
    trainingLevel: 'Beginner'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    if (loading) return; // Prevent changes if form is disabled
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent submission if form is disabled
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/course/create',
      {
        "jobDescription": formData.jobDescription,
        "technologyStack": formData.technologyStack,
        "duration": formData.duration,
        "trainingLevel": formData.trainingLevel 
      },
      {
        headers: {
          'x-auth-token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        }
      });
      
      console.log(response.data);
      onOutlineGenerated(response.data);
    } catch (err) {
      setError('Failed to generate course outline. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <div>Please log in to use this feature.</div>;
  }

  return (
    <div className="course-outline-generator">
      <button className="close-button" onClick={onClose} disabled={loading}>&times;</button>
      <h2>Generate Course Outline</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="jobDescription">Job Description:</label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            value={formData.jobDescription}
            onChange={handleInputChange}
            placeholder="Detailed job description here"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="technologyStack">Technology Stack:</label>
          <input
            id="technologyStack"
            type="text"
            name="technologyStack"
            value={formData.technologyStack}
            onChange={handleInputChange}
            placeholder="List of technologies"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration:</label>
          <input
            id="duration"
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 2 weeks"
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Training Level:</label>
          <div className="radio-group">
            {['Beginner', 'Mid Management', 'C-Suite'].map((level) => (
              <label key={level}>
                <input
                  type="radio"
                  name="trainingLevel"
                  value={level}
                  checked={formData.trainingLevel === level}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                {level}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Course Outline'}
        </button>
      </form>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default CourseOutlineGenerator;
