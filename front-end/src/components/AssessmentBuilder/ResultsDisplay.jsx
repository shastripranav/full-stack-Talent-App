import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import styled from 'styled-components';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results }) => {
  if (!results || typeof results !== 'object') {
    return <div>No results available. Please try again later.</div>;
  }

  const { score, result } = results;

  if (!result || !result.barChartData || !result.spiderChartData) {
    return <div>Invalid results data. Please try again later.</div>;
  }

  return (
    <ResultsContainer>
      <h2>Assessment Result</h2>
      <ScoreSummary>
        {score && <p>Score: {score}</p>}
        <SelectionStatus selected={result.selected}>
          {result.selected ? "Selected" : "Not Selected"}
        </SelectionStatus>
      </ScoreSummary>

      <ChartSection>
        <h3>Performance by Bloom's Taxonomy</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={result.barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="correct" fill="#8884d8" name="Correct" />
            <Bar dataKey="total" fill="#82ca9d" name="Total" />
          </BarChart>
        </ResponsiveContainer>
      </ChartSection>

      <ChartSection>
        <h3>Competency Scores</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={result.spiderChartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" />
            <PolarRadiusAxis angle={30} domain={[0, 1]} />
            <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </ChartSection>
    </ResultsContainer>
  );
};

const ResultsContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ScoreSummary = styled.div`
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const SelectionStatus = styled.p`
  font-weight: bold;
  color: ${props => props.selected ? 'green' : 'red'};
`;

const ChartSection = styled.div`
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
  }
`;

export default ResultsDisplay;
