import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const Layout = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <Container>
      <Header className={isScrolled ? 'scrolled' : ''}>
        <NavContent>
          <Logo as={Link} to="/">TalentHarness</Logo>
          <MobileMenuButton onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuButton>
          <Nav className={isMobileMenuOpen ? 'open' : ''}>
            <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/features" onClick={() => setIsMobileMenuOpen(false)}>Features</NavLink>
            <NavLink to="/testimonials" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</NavLink>
            <NavLink as="button" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Login</NavLink>
            <NavLink as="button" onClick={() => { navigate('/signup'); setIsMobileMenuOpen(false); }}>Sign Up</NavLink>
          </Nav>
        </NavContent>
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
  background-color: #e6f2ff; /* Light sky blue background */
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Logo = styled(Link)`
  font-size: 2.5rem; /* Increased from 1.5rem */
  font-weight: 900; /* Bolder */
  color: #2b6cb0; /* A shade of blue */
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: #2c5282;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &.open {
      display: flex;
    }
  }
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

  @media (max-width: 768px) {
    padding: 1rem;
    text-align: center;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 10;

  &:focus {
    outline: none;
  }

  span {
    width: 2rem;
    height: 0.25rem;
    background: #2b6cb0;
    border-radius: 10px;
    transition: all 0.3s linear;
    position: relative;
    transform-origin: 1px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-top: 60px; // Adjust based on your header height
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
