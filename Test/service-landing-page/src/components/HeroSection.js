import React from "react";
import styled from "styled-components";

const HeroContainer = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
  background-color: #f8f9fa;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3em;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.5em;
  margin-bottom: 40px;
`;

const Button = styled.a`
  padding: 15px 30px;
  font-size: 1em;
  background-color: #007bff;
  color: #ffffff;
  border-radius: 5px;
  text-decoration: none;

  &:hover {
    background-color: #0056b3;
  }
`;

const HeroSection = () => (
  <HeroContainer>
    <Title>Build Your Online Presence</Title>
    <Subtitle>Professional Services for Your Business Growth</Subtitle>
    <Button href="#contact">Get Started</Button>
  </HeroContainer>
);

export default HeroSection;
