import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import AssessmentQuestions from './AssessmentQuestions';
import VoiceAssistant from './VoiceAssistant';
import api from '../api'; // Import the api instance
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(user?.profilePicture || null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showVoiceAssistant, setShowVoiceAssistant] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState('');
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [activityCollapsed, setActivityCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!user) {
      updateUser();
    } else if (user.assessmentsTaken && user.assessmentsTaken.length > 0 && showHome) {
      setSelectedAssessment(user.assessmentsTaken[user.assessmentsTaken.length - 1]);
    }
  }, [user, navigate, showHome, updateUser]);

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

  const handleAssessmentChange = (event) => {
    setSelectedAssessmentId(event.target.value);
  };

  const handleAssessmentSelect = () => {
    if (selectedAssessmentId) {
      const assessment = user.assessmentsTaken.find(a => a._id === selectedAssessmentId);
      setSelectedAssessment(assessment);
      setShowHome(false);
      setShowVoiceAssistant(false);
    }
  };

  const handleHomeClick = () => {
    setShowHome(true);
    setShowVoiceAssistant(false);
    if (user?.assessmentsTaken?.length > 0) {
      setSelectedAssessment(user.assessmentsTaken[user.assessmentsTaken.length - 1]);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await api.get('/voiceassistant/history/today', {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      const data = response.data;
      const filteredHistory = data.filter(item => item.userInput !== "Initial greeting");
      const formattedHistory = filteredHistory.flatMap(item => ([
        { sender: 'user', text: item.userInput, timestamp: new Date(item.timestamp) },
        { sender: 'bot', text: item.botResponse, timestamp: new Date(item.timestamp) }
      ]));

      formattedHistory.sort((a, b) => a.timestamp - b.timestamp);

      setChatHistory(formattedHistory);
      setShowVoiceAssistant(true);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleChatOptionSelect = (option) => {
    setShowChatOptions(false);
    if (option === 'new') {
      setChatHistory([]);
      setShowVoiceAssistant(true);
    } else if (option === 'reload') {
      fetchChatHistory();
    }
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
      <div className="ResultSummarySection">
        <h2 className="SectionTitle">Result Summary</h2>
        <p className="SummaryItem">Technology: {selectedAssessment.technology}</p>
        <p className="SummaryItem">Correct Answers: {correctAnswers}</p>
        <p className="SummaryItem">Incorrect Answers: {incorrectAnswers}</p>
        <p className="SummaryItem">Total Questions: {totalQuestions}</p>
        <p className="SummaryItem">Score: {scorePercentage.toFixed(2)}%</p>
      </div>
    );
  };

  return (
    <div className="DashboardContainer">
      <div className="Sidebar">
        <div className="ProfileSection">
          {profileImage ? (
            <img className="ProfileImage" src={profileImage} alt="Profile" />
          ) : (
            <div className="ProfileInitials">{getInitials(user?.name || 'User')}</div>
          )}
          <h2 className="UserName">{user?.name || 'User'}</h2>
          <label className="UploadButton">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            Upload Image
          </label>
        </div>
        <nav className="NavMenu">
          <button className={`NavItem ${showHome ? 'active' : ''}`} onClick={handleHomeClick}>Home</button>
          <Link className="NavItem" to="/assessment">New Assessment</Link>
          <label className="AssessmentSelectorLabel">Past Assessments:</label>
          <div className="AssessmentSelectorWrapper">
            <select 
              className="AssessmentSelector"
              value={selectedAssessmentId} 
              onChange={handleAssessmentChange}
            >
              <option value="">Select Assessment</option>
              {user?.assessmentsTaken?.map((assessment) => (
                <option key={assessment._id} value={assessment._id}>
                  {assessment.technology} - {new Date(assessment.createdAt).toLocaleDateString()}
                </option>
              ))}
            </select>
            <button 
              className="GoButton"
              onClick={handleAssessmentSelect}
              disabled={!selectedAssessmentId}
            >
              Go
            </button>
          </div>
          <button className="VoiceAssistantButton" onClick={() => setShowChatOptions(true)}>
            <span className="BotIcon">🤖</span>
            Tech Voice Assistant
          </button>
          <button className="LogoutButton" onClick={handleLogout}>Logout</button>
        </nav>
      </div>
      <main className="MainContent">
        <header className="Header">
          <h1 className="Greeting">Hello, {user?.name || 'User'}</h1>
          <p className="SubGreeting">Welcome to your dashboard</p>
        </header>
        {!showVoiceAssistant ? (
          <>
            <section className="ActivitySection">
              <h2 className="SectionTitle">
                Recent Activity
                <span 
                  className={`CollapseIcon ${activityCollapsed ? 'collapsed' : ''}`} 
                  onClick={() => setActivityCollapsed(!activityCollapsed)}
                >
                  ▼
                </span>
              </h2>
              {!activityCollapsed && (
                <>
                  <div className="ActivityItem">Last Login: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</div>
                  <div className="ActivityItem">Selected Assessment Technology: {selectedAssessment?.technology || 'N/A'}</div>
                  <div className="ActivityItem">Selected Assessment Level: {selectedAssessment?.level || 'N/A'}</div>
                  <div className="ActivityItem">Selected Assessment Date: {selectedAssessment?.createdAt ? new Date(selectedAssessment.createdAt).toLocaleString() : 'N/A'}</div>
                </>
              )}
            </section>
            {renderResultSummary()}
            <section className="ChartSection">
              <h2 className="SectionTitle">Selected Assessment Results</h2>
              <div className="ChartContainer">
                {renderBarChart()}
              </div>
              <div className="ChartContainer">
                {renderRadarChart()}
              </div>
            </section>
            <button className="AdvancedButton" onClick={() => setShowQuestions(!showQuestions)}>
              {showQuestions ? 'Hide Questions' : 'Show Questions'}
            </button>
            {showQuestions && selectedAssessment && (
              <div className="FloatingFrame">
                <button className="CloseButton" onClick={() => setShowQuestions(false)}>&times;</button>
                <AssessmentQuestions data={selectedAssessment} />
              </div>
            )}
          </>
        ) : (
          <VoiceAssistant onClose={() => setShowVoiceAssistant(false)} chatHistory={chatHistory} />
        )}
      </main>
      {showChatOptions && (
        <div className="ChatOptionsModal">
          <button className="ChatOptionButton" onClick={() => handleChatOptionSelect('new')}>New Chat</button>
          <button className="ChatOptionButton" onClick={() => handleChatOptionSelect('reload')}>Reload Chat</button>
          <button className="CloseButton" onClick={() => setShowChatOptions(false)}>&times;</button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
