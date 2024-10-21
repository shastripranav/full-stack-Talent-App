import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDetailsForm from './UserDetailsForm';
import QuizInterface from './QuizInterface';
import ResultsDisplay from './ResultsDisplay';
import api from '../../api';
import styled from 'styled-components';
import './AssessmentBuilder.css';

const ASSESSMENT_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const AssessmentBuilder = () => {
  const [step, setStep] = useState('userDetails');
  const [quizData, setQuizData] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);
  const [isAssessmentCreated, setIsAssessmentCreated] = useState(false);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState(false);
  const navigate = useNavigate();

  const createAssessment = async (details) => {
    if (isAssessmentCreated) return; // Prevent multiple submissions

    setIsAssessmentStarted(true);
    const { technology, level } = details;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/assessments/create', {
        technology,
        level
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      setQuizData(response.data.questions);
      setAssessmentId(response.data._id);
      setIsAssessmentCreated(true);
      setStep('quiz');
      startAssessment(response.data._id);
    } catch (err) {
      setError('Failed to create assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessmentId) => {
    const startTime = Date.now();
    const endTime = startTime + ASSESSMENT_DURATION;

    const timerId = setInterval(() => {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
        clearInterval(timerId);
        handleQuizSubmit({});
      }
    }, 1000);

    localStorage.setItem('assessmentTimerId', timerId.toString());
  };

  const handleQuizSubmit = async (userAnswers) => {
    setLoading(true);
    setError(null);
    try {
      clearInterval(Number(localStorage.getItem('assessmentTimerId')));
      // Submit the answers
      await api.post(`/assessments/${assessmentId}/submit`, { userAnswers }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': localStorage.getItem('token')
        }
      });
      // Fetch the results
      const resultResponse = await api.get(`/assessments/${assessmentId}/result`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      setQuizResults(resultResponse.data);
      navigate('/dashboard', { state: { showResults: true, results: resultResponse.data } });
    } catch (err) {
      setError('Failed to process results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FloatingFrame>
      {!isAssessmentStarted && (
        <CloseButton onClick={() => navigate('/dashboard')}>&times;</CloseButton>
      )}
      <div className="assessment-builder">
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error">{error}</div>}
        {step === 'userDetails' && (
          <UserDetailsForm 
            onSubmit={createAssessment} 
            isDisabled={isAssessmentCreated || isAssessmentStarted} 
          />
        )}
        {step === 'quiz' && quizData && (
          <QuizInterface quizData={quizData} assessmentId={assessmentId} onSubmit={handleQuizSubmit} />
        )}
      </div>
    </FloatingFrame>
  );
};

const FloatingFrame = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 800px;
  height: 80%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  padding: 20px;
  overflow-y: auto;
  z-index: 1000;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

export default AssessmentBuilder;
