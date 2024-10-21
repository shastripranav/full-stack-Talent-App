import React, { useState } from 'react';
import styled from 'styled-components';

const AssessmentQuestions = ({ data }) => {
  const questions = data.questions;
  const userAnswers = data.userAnswers;

  const [visibleDetails, setVisibleDetails] = useState(
    Array(questions.length).fill(false)
  );

  const toggleDetails = (index) => {
    setVisibleDetails((prevVisibleDetails) => {
      const newVisibleDetails = [...prevVisibleDetails];
      newVisibleDetails[index] = !newVisibleDetails[index];
      return newVisibleDetails;
    });
  };

  return (
    <QuestionsContainer>
      {questions.map((question, index) => {
        const isVisible = visibleDetails[index];

        return (
          <QuestionWrapper key={question.id}>
            <QuestionText onClick={() => toggleDetails(index)}>
              {index + 1}. {question.text}
            </QuestionText>
            {isVisible && (
              <DetailsWrapper>
                <OptionsList>
                  {question.options.map((option, optIndex) => {
                    const isCorrect = question.correctAnswer === optIndex + 1;
                    const isSelected = userAnswers[index] === optIndex + 1;

                    return (
                      <OptionItem
                        key={optIndex}
                        $isCorrect={isCorrect}
                        $isSelected={isSelected}
                      >
                        {option}
                      </OptionItem>
                    );
                  })}
                </OptionsList>
                <AnswerText>
                  <strong>Correct Answer:</strong>{' '}
                  {question.options[question.correctAnswer - 1]}
                </AnswerText>
                <AnswerText>
                  <strong>Your Answer:</strong>{' '}
                  {userAnswers[index] && userAnswers[index] > 0 ? (
                    question.options[userAnswers[index] - 1]
                  ) : (
                    <em>You did not answer this question.</em>
                  )}
                </AnswerText>
              </DetailsWrapper>
            )}
          </QuestionWrapper>
        );
      })}
    </QuestionsContainer>
  );
};

const QuestionsContainer = styled.div`
  max-height: 80vh;
  overflow-y: auto;
  padding: 20px;
`;

const QuestionWrapper = styled.div`
  margin-bottom: 20px;
`;

const QuestionText = styled.div`
  font-weight: bold;
  cursor: pointer;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 5px;
`;

const DetailsWrapper = styled.div`
  margin-top: 10px;
  padding-left: 20px;
`;

const OptionsList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const OptionItem = styled.li`
  padding: 5px;
  margin: 5px 0;
  background-color: ${props => 
    props.$isCorrect ? '#d4edda' : 
    props.$isSelected ? '#f8d7da' : 'transparent'};
  border-radius: 3px;
`;

const AnswerText = styled.p`
  margin: 5px 0;
`;

export default AssessmentQuestions;
