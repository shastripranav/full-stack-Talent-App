import React from "react";
import styled from "styled-components";

const FeaturesContainer = styled.section`
  padding: 60px 20px;
  background-color: #ffffff;
  text-align: center;
`;

const FeatureGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 40px;
`;

const FeatureItem = styled.div`
  width: 300px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const FeatureTitle = styled.h3`
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  color: #666;
`;

const FeaturesSection = () => (
  <FeaturesContainer id="features">
    <h2>Our Features</h2>
    <FeatureGrid>
      <FeatureItem>
        <FeatureTitle>High Quality</FeatureTitle>
        <FeatureDescription>We provide top-notch services to help your business thrive.</FeatureDescription>
      </FeatureItem>
      <FeatureItem>
        <FeatureTitle>Reliable Support</FeatureTitle>
        <FeatureDescription>Our team is available 24/7 for your support needs.</FeatureDescription>
      </FeatureItem>
      <FeatureItem>
        <FeatureTitle>Custom Solutions</FeatureTitle>
        <FeatureDescription>Tailored solutions to fit your unique business needs.</FeatureDescription>
      </FeatureItem>
    </FeatureGrid>
  </FeaturesContainer>
);

export default FeaturesSection;
