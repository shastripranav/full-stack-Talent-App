import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const Layout = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  return (
    <Container>
      <Header>
        <Logo as={Link} to="/">TalentHarness</Logo>
        <Nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/features">Features</NavLink>
          <NavLink to="/testimonials">Testimonials</NavLink>
          <NavLink as="button" onClick={() => navigate('/login')}>Login</NavLink>
          <NavLink as="button" onClick={() => navigate('/signup')}>Sign Up</NavLink>
        </Nav>
      </Header>
      <Main>{children}</Main>
      <Footer>
        <FooterNav>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
        </FooterNav>
        <SocialIcons>
          {/* Add social media icons here */}
        </SocialIcons>
      </Footer>
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} onSwitchToSignup={handleSwitchToSignup} />}
      {showSignup && <SignupForm onClose={() => setShowSignup(false)} onSwitchToLogin={handleSwitchToLogin} />}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a5568;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  transition: color 0.3s, background-color 0.3s;

  &:hover {
    color: #2b6cb0;
    background-color: #f7fafc;
  }
`;

const Main = styled.main`
  flex: 1;
`;

const Footer = styled.footer`
  background-color: #2d3748;
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FooterNav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const FooterLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const SocialIcons = styled.div`
  // Add styles for social icons
`;

export default Layout;
