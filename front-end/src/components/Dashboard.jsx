import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import AssessmentQuestions from './AssessmentQuestions';

const Dashboard = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.assessmentsTaken && user.assessmentsTaken.length > 0) {
      setSelectedAssessment(user.assessmentsTaken[user.assessmentsTaken.length - 1]);
    }
  }, [user, navigate]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setProfileImage(base64String);
      try {
        await updateUser({ profilePicture: base64String });
      } catch (error) {
        console.error('Error updating profile picture:', error);
      }
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const toggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  const handleAssessmentChange = (event) => {
    const selectedId = event.target.value;
    const assessment = user.assessmentsTaken.find(a => a._id === selectedId);
    setSelectedAssessment(assessment);
  };

  const renderBarChart = () => {
    const data = selectedAssessment?.result?.barChartData;
    if (!data || data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="correct" fill="#8884d8" name="Correct" />
          <Bar dataKey="total" fill="#82ca9d" name="Total" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderRadarChart = () => {
    const data = selectedAssessment?.result?.spiderChartData;
    if (!data || data.length === 0) return null;

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="competency" />
          <PolarRadiusAxis angle={30} domain={[0, 1]} />
          <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  const renderResultSummary = () => {
    if (!selectedAssessment) return null;

    const totalQuestions = selectedAssessment.questions.length;
    const correctAnswers = selectedAssessment.score;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;
    return (
      <ResultSummarySection>
        <SectionTitle>Result Summary</SectionTitle>
        <SummaryItem>Technology: {selectedAssessment.technology}</SummaryItem>
        <SummaryItem>Correct Answers: {correctAnswers}</SummaryItem>
        <SummaryItem>Incorrect Answers: {incorrectAnswers}</SummaryItem>
        <SummaryItem>Total Questions: {totalQuestions}</SummaryItem>
        <SummaryItem>Score: {scorePercentage.toFixed(2)}%</SummaryItem>
      </ResultSummarySection>
    );
  };

  return (
    <DashboardContainer>
      <Sidebar>
        <ProfileSection>
          {profileImage ? (
            <ProfileImage src={profileImage} alt="Profile" />
          ) : (
            <ProfileInitials>{getInitials(user?.name || 'User')}</ProfileInitials>
          )}
          <UserName>{user?.name || 'User'}</UserName>
          <UploadButton>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            Upload Image
          </UploadButton>
        </ProfileSection>
        <NavMenu>
          <NavItem to="/dashboard" $active={true}>Home</NavItem>
          <NavItem to="/assessment">New Assessment</NavItem>
          <AssessmentSelectorLabel>Past Assessments:</AssessmentSelectorLabel>
          <AssessmentSelector onChange={handleAssessmentChange}>
            {user?.assessmentsTaken?.map((assessment) => (
              <option key={assessment._id} value={assessment._id}>
                {assessment.technology} - {new Date(assessment.createdAt).toLocaleDateString()}
              </option>
            ))}
          </AssessmentSelector>
          <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </NavMenu>
      </Sidebar>
      <MainContent>
        <Header>
          <Greeting>Hello, {user?.name || 'User'}</Greeting>
          <SubGreeting>Welcome to your dashboard</SubGreeting>
        </Header>
        <ActivitySection>
          <SectionTitle>Recent Activity</SectionTitle>
          <ActivityItem>Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</ActivityItem>
          <ActivityItem>Selected Assessment Technology: {selectedAssessment?.technology || 'N/A'}</ActivityItem>
          <ActivityItem>Selected Assessment Level: {selectedAssessment?.level || 'N/A'}</ActivityItem>
          <ActivityItem>Selected Assessment Date: {selectedAssessment?.createdAt ? new Date(selectedAssessment.createdAt).toLocaleString() : 'N/A'}</ActivityItem>
        </ActivitySection>
        {renderResultSummary()}
        <ChartSection>
          <SectionTitle>Selected Assessment Results</SectionTitle>
          <ChartContainer>
            {renderBarChart()}
          </ChartContainer>
          <ChartContainer>
            {renderRadarChart()}
          </ChartContainer>
        </ChartSection>
        <AdvancedButton onClick={() => setShowQuestions(!showQuestions)}>
          {showQuestions ? 'Hide Questions' : 'Show Questions'}
        </AdvancedButton>
        {showQuestions && selectedAssessment && (
          <FloatingFrame>
            <CloseButton onClick={() => setShowQuestions(false)}>&times;</CloseButton>
            <AssessmentQuestions data={selectedAssessment} />
          </FloatingFrame>
        )}
      </MainContent>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #F0F0F7;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #FFFFFF;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
`;

const ProfileImage = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
`;

const UploadButton = styled.label`
  background-color: #4A3CDB;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-align: center;

  input {
    display: none;
  }
`;

const NavMenu = styled.nav`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const NavItem = styled(Link)`
  color: ${props => props.$active ? '#4A3CDB' : '#333'};
  text-decoration: none;
  padding: 10px 0;
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  width: 100%;
  display: block;
  &:hover {
    color: #4A3CDB;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Header = styled.header`
  margin-bottom: 20px;
`;

const Greeting = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 5px;
`;

const SubGreeting = styled.p`
  font-size: 1.5rem;
  color: #4A3CDB;
`;

const ContentSection = styled.section`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActivityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #F8F8F8;
  border-radius: 5px;
`;

const ActivityName = styled.span`
  flex: 1;
`;

const ActivityDate = styled.span`
  font-size: 0.9rem;
  color: #777;
`;

const UserName = styled.h2`
  font-size: 1.2rem;
  color: #333;
  margin: 0.5rem 0;
  text-align: center;
`;

const LastLogin = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const UserInfo = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-top: 0.5rem;
`;

const ProfileInitials = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #4A3CDB;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bold;
`;

const UpdateDetailsButton = styled.button`
  background-color: #4A3CDB;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-size: 1.2rem;
  margin-top: 2rem;
`;

const ActivitySection = styled.section`
  margin-bottom: 2rem;
`;

const ChartSection = styled.section`
  margin-bottom: 2rem;
`;

const ChartContainer = styled.div`
  margin-bottom: 2rem;
`;

const AdvancedButton = styled.button`
  background-color: #4A3CDB;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-bottom: 1rem;
`;

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

const QuestionItem = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const QuestionText = styled.p`
  font-weight: bold;
`;

const SelectedAnswer = styled.p`
  color: #4A3CDB;
`;

const CorrectAnswer = styled.p`
  color: green;
  font-weight: bold;
`;

const LogoutButton = styled.button`
  background-color: #f44336;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
`;

const AssessmentSelectorLabel = styled.label`
  font-size: 1rem;
  color: #333;
  margin-bottom: 5px;
  font-weight: bold;
`;

const AssessmentSelector = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

const ResultSummarySection = styled.section`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SummaryItem = styled.p`
  font-size: 1rem;
  margin: 10px 0;
  display: flex;
  justify-content: space-between;
`;

export default Dashboard;
