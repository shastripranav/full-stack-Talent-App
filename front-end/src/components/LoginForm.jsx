import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitted');
    try {
      const response = await api.post('/login', formData);
      console.log('Login response:', response.data);
      if (response.data && response.data.token && response.data.user) {
        login(response.data.token, response.data.user, response.data.user.lastAssessment);
        navigate('/dashboard');
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      setError('Invalid email or password');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleClose = () => {
    navigate('/');  // Navigate to home page
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={handleClose}>&times;</CloseButton>
        <LoginSection>
          <Logo>TalentHarness</Logo>
          <Title>Login to Your Account</Title>
          <SocialLogin>
            <SocialText>Login using social networks</SocialText>
            <SocialIcons>
              <SocialIcon color="#3b5998">f</SocialIcon>
              <SocialIcon color="#db4a39">G+</SocialIcon>
              <SocialIcon color="#0e76a8">in</SocialIcon>
            </SocialIcons>
          </SocialLogin>
          <Divider>OR</Divider>
          <Form onSubmit={handleSubmit}>
            <Input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <PasswordWrapper>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <EyeIcon onClick={togglePasswordVisibility}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </EyeIcon>
            </PasswordWrapper>
            <Button type="submit">Sign In</Button>
          </Form>
          {error && <Error>{error}</Error>}
        </LoginSection>
        <SignUpSection>
          <SignUpText>New Here?</SignUpText>
          <SignUpMessage>Sign up to discover great ways to hone yourself & Harness your exceptional talent!</SignUpMessage>
          <SignUpButton onClick={handleSwitchToSignup}>Sign Up</SignUpButton>
        </SignUpSection>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  display: flex;
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  width: 800px;
  max-width: 90%;
  position: relative;
`;

const LoginSection = styled.div`
  flex: 1;
  padding: 2rem;
`;

const SignUpSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6e8efb 0%, #4a3cdb 100%);
  padding: 2rem;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #333;
  z-index: 10;
  
  &:hover {
    color: #000;
  }
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
`;

const SocialLogin = styled.div`
  margin-bottom: 1rem;
`;

const SocialText = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const SocialIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #666;
  margin: 1rem 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-right: .5em;
  }

  &::after {
    margin-left: .5em;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const EyeIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  user-select: none;
`;

const Button = styled.button`
  background-color: #4a3cdb;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #3c31b0;
  }
`;

const Error = styled.p`
  color: red;
  text-align: center;
  margin-top: 1rem;
`;

const SignUpText = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const SignUpMessage = styled.p`
  margin-bottom: 1rem;
`;

const SignUpButton = styled(Button)`
  background-color: transparent;
  border: 2px solid white;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

export default LoginForm;
