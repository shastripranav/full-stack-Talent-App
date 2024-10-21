import React, { useState } from 'react';
import styled from 'styled-components';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    education: '',
    occupation: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await api.post('/signup', formData);
      console.log('Signup successful:', response.data);
      localStorage.setItem('token', response.data.token);
      setMessage('Thank you for registering with us. Your account has been created.');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.msg || 'An error occurred. Please try again.');
    }
  };

  if (isSuccess) {
    return (
      <ModalOverlay>
        <ModalContent>
          <SuccessMessage>{message}</SuccessMessage>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <ModalContent>
        <CloseButton onClick={() => navigate('/login')}>&times;</CloseButton>
        <FormContainer>
          <ImageSection>
            <Logo>TalentHarness</Logo>
            <IllustrationText>Discover your potential and harness your talent!</IllustrationText>
          </ImageSection>
          <FormSection>
            <Title>Registration</Title>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <Form onSubmit={handleSubmit}>
              <InputGroup>
                <Input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="date"
                  name="dateOfBirth"
                  placeholder="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <GenderGroup>
                <GenderLabel>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={handleChange}
                    required
                  />
                  Male
                </GenderLabel>
                <GenderLabel>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={handleChange}
                    required
                  />
                  Female
                </GenderLabel>
                <GenderLabel>
                  <input
                    type="radio"
                    name="gender"
                    value="other"
                    checked={formData.gender === 'other'}
                    onChange={handleChange}
                    required
                  />
                  Other
                </GenderLabel>
              </GenderGroup>
              <InputGroup>
                <Select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">Highest Education Level</option>
                  <option value="high-school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">Ph.D.</option>
                  <option value="other">Other</option>
                </Select>
                <Input
                  type="text"
                  name="occupation"
                  placeholder="Current Occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                />
              </InputGroup>
              <Button type="submit">Sign Up</Button>
            </Form>
            <LoginLink onClick={() => navigate('/login')}>Already have an account? Sign in</LoginLink>
          </FormSection>
        </FormContainer>
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
  background-color: white;
  border-radius: 10px;
  width: 800px;
  max-width: 90%;
  position: relative;
  overflow: hidden;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  z-index: 10;
`;

const FormContainer = styled.div`
  display: flex;
  height: 600px;
`;

const ImageSection = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6e8efb 0%, #4a3cdb 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 2rem;
`;

const Logo = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const IllustrationText = styled.p`
  font-size: 1.2rem;
  text-align: center;
`;

const FormSection = styled.div`
  flex: 2;
  padding: 2rem;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #4a3cdb;
  }
`;

const Select = styled.select`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #4a3cdb;
  }
`;

const GenderGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const GenderLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const LoginLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  color: #4a3cdb;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  padding: 2rem;
  border-radius: 4px;
  font-size: 1.2rem;
  text-align: center;
`;

export default SignupForm;
