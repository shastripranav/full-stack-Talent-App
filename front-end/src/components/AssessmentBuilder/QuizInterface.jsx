import React, { useState, useEffect } from 'react';
import api from '../../api';
import styled from 'styled-components';
import './QuizInterface.css';

const QuizInterface = ({ quizData, assessmentId, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (questionId, optionIndex) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionIndex + 1,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitted) return; // Prevent multiple submissions
    
    try {
      if (!assessmentId) {
        throw new Error('Assessment ID is missing');
      }
      
      const token = localStorage.getItem('token');
      const response = await api.post(`/assessments/submit`, 
        {
          assessmentId: assessmentId,
          userAnswers: answers
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      setIsSubmitted(true);
      clearInterval(Number(localStorage.getItem('assessmentTimerId'))); // Clear the timer
      localStorage.removeItem('assessmentTimerId'); // Remove the timer ID from localStorage
      setTimeout(() => {
        onSubmit(response.data);
      }, 3000); // Show success message for 3 seconds before redirecting
    } catch (error) {
      console.error('Error submitting assessment:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleReview = () => {
    setIsReviewing(!isReviewing);
    setCurrentQuestion(0);
  };

  if (!quizData || quizData.length === 0) {
    return <div>No questions available.</div>;
  }

  if (isSubmitted) {
    return (
      <SubmissionMessage>
        Assessment successfully submitted. Your results are being processed.
      </SubmissionMessage>
    );
  }

  return (
    <FloatingFrame>
      <div className="quiz-header">
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        <div className="progress">
          Question {currentQuestion + 1} of {quizData.length}
        </div>
      </div>
      <div className="question-container">
        <h3>{quizData[currentQuestion].text}</h3>
        <div className="answers">
          {quizData[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(quizData[currentQuestion].id, index)}
              className={answers[quizData[currentQuestion].id] === index + 1 ? 'selected' : ''}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="navigation">
        {currentQuestion > 0 && (
          <button onClick={() => setCurrentQuestion(currentQuestion - 1)}>Previous</button>
        )}
        {currentQuestion < quizData.length - 1 && (
          <button onClick={() => setCurrentQuestion(currentQuestion + 1)}>Next</button>
        )}
        {currentQuestion === quizData.length - 1 && !isReviewing && (
          <button onClick={toggleReview}>Review Answers</button>
        )}
        {isReviewing && (
          <button onClick={handleSubmit}>Submit Assessment</button>
        )}
      </div>
      {isReviewing && (
        <ReviewSection>
          <h4>Review Your Answers:</h4>
          {quizData.map((question, index) => (
            <ReviewItem key={question.id}>
              Question {index + 1}: {answers[question.id] ? 'Answered' : 'Not Answered'}
              <button onClick={() => setCurrentQuestion(index)}>Go to Question</button>
            </ReviewItem>
          ))}
        </ReviewSection>
      )}
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

const ReviewSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #ddd;
  padding-top: 20px;
`;

const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const SubmissionMessage = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #4a3cdb;
  padding: 20px;
`;

export default QuizInterface;
