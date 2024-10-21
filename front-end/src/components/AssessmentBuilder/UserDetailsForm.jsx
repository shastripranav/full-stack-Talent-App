import React, { useState } from 'react';
import './UserDetailsForm.css';

const UserDetailsForm = ({ onSubmit, isDisabled }) => {
  const [formData, setFormData] = useState({
    technology: '',
    level: '',
  });

  const handleChange = (e) => {
    if (isDisabled) return; // Prevent changes if form is disabled
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return; // Prevent submission if form is disabled
    if (Object.values(formData).every(value => value !== '')) {
      onSubmit(formData);
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <form className="user-details-form" onSubmit={handleSubmit}>
      <h2>Assessment Details</h2>
      <div className="form-group">
        <label htmlFor="technology">Technology Preference:</label>
        <select
          id="technology"
          name="technology"
          value={formData.technology}
          onChange={handleChange}
          required
          disabled={isDisabled}
        >
          <option value="">Select Technology</option>
          <option value="Java Full Stack">Java Full Stack</option>
          <option value="Python">Python</option>
          <option value="Dev-Ops">Dev-Ops</option>
          <option value="SRE">SRE</option>
          <option value="AI">AI</option>
        </select>
      </div>
      <div className="form-group">
        <label>Expertise Level:</label>
        <div className="radio-group">
          {['Beginner', 'Mid-Level', 'Senior-Executive'].map((level) => (
            <label key={level}>
              <input
                type="radio"
                name="level"
                value={level}
                checked={formData.level === level}
                onChange={handleChange}
                required
                disabled={isDisabled}
              />
              {level}
            </label>
          ))}
        </div>
      </div>
      <button type="submit" className="submit-button" disabled={isDisabled}>
        {isDisabled ? 'Assessment Created' : 'Create Assessment'}
      </button>
    </form>
  );
};

export default UserDetailsForm;
