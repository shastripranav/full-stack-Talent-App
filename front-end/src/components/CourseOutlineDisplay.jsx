import React from 'react';
import styled from 'styled-components';

const CourseOutlineDisplay = ({ courseOutline, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <OutlineContainer className="course-outline-display">
      <CloseButton onClick={onClose}>&times;</CloseButton>
      <h1>{courseOutline.courseTitle}</h1>
      <Section>
        <h2>Course Overview</h2>
        <p>{courseOutline.courseOverview}</p>
      </Section>
      <Section>
        <h2>Learning Objectives</h2>
        <ul>
          {courseOutline.learningObjectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </Section>
      <Section>
        <h2>Technologies Covered</h2>
        <TechList>
          {courseOutline.technologiesCovered.map((tech, index) => (
            <TechItem key={index}>{tech}</TechItem>
          ))}
        </TechList>
      </Section>
      <Section>
        <h2>Weekly Breakdown</h2>
        {courseOutline.weeklyBreakdown.map((week) => (
          <WeekSection key={week._id}>
            <h3>Week {week.week}</h3>
            {week.dailyTopics.map((day) => (
              <DaySection key={day._id}>
                <h4>Day {day.day}</h4>
                <SubSection>
                  <h5>Topics</h5>
                  <ul>
                    {day.topics.map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                  </ul>
                </SubSection>
                <SubSection>
                  <h5>Activities</h5>
                  <ul>
                    {day.activities.map((activity, index) => (
                      <li key={index}>{activity}</li>
                    ))}
                  </ul>
                </SubSection>
                <SubSection>
                  <h5>Learning Outcomes</h5>
                  <ul>
                    {day.learningOutcomes.map((outcome, index) => (
                      <li key={index}>{outcome}</li>
                    ))}
                  </ul>
                </SubSection>
              </DaySection>
            ))}
          </WeekSection>
        ))}
      </Section>
      <PrintButton onClick={handlePrint}>Print Course Outline</PrintButton>
    </OutlineContainer>
  );
};

const OutlineContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  position: relative;
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

const Section = styled.section`
  margin-bottom: 20px;
`;

const TechList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const TechItem = styled.span`
  background-color: #e0e0e0;
  padding: 5px 10px;
  border-radius: 15px;
`;

const WeekSection = styled.div`
  margin-bottom: 20px;
`;

const DaySection = styled.div`
  margin-left: 20px;
  margin-bottom: 15px;
`;

const SubSection = styled.div`
  margin-left: 20px;
`;

const PrintButton = styled.button`
  background-color: #4A3CDB;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 20px;
`;

export default CourseOutlineDisplay;
