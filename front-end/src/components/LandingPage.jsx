import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AnimatedSection = ({ children, delay = 0 }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, delay }}
    >
      {children}
    </motion.div>
  );
};

const LandingPage = () => {
  return (
    <Container>
      <AnimatedSection>
        <HeroSection>
          <HeroContent>
            <HeroTitle>Unleash Your Technical Potential</HeroTitle>
            <HeroSubtitle>
              Discover the power of talent fitment and sculpting in the tech industry
            </HeroSubtitle>
            <CTAButton>Get Started</CTAButton>
          </HeroContent>
        </HeroSection>
      </AnimatedSection>

      <AnimatedSection delay={0.2}>
        <IntroSection>
          <SectionTitle>Elevate Your Tech Career</SectionTitle>
          <SectionText>
            TalentHarness helps you upskill, evaluate your talents, and identify the
            perfect career pathway in the ever-evolving tech landscape.
          </SectionText>
        </IntroSection>
      </AnimatedSection>

      <AnimatedSection delay={0.4}>
        <FeaturesSection>
          <FeatureCard>
            <FeatureIcon>🚀</FeatureIcon>
            <FeatureTitle>Talent Upskilling</FeatureTitle>
            <FeatureText>
              Enhance your skills with personalized learning paths and resources.
            </FeatureText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Talent Evaluations</FeatureTitle>
            <FeatureText>
              Gain insights into your strengths and areas for improvement.
            </FeatureText>
          </FeatureCard>
          <FeatureCard>
            <FeatureIcon>🗺️</FeatureIcon>
            <FeatureTitle>Pathway Identification</FeatureTitle>
            <FeatureText>
              Discover the best career paths tailored to your skills and aspirations.
            </FeatureText>
          </FeatureCard>
        </FeaturesSection>
      </AnimatedSection>

      <AnimatedSection delay={0.6}>
        <TestimonialsSection>
          <SectionTitle>What Our Users Say</SectionTitle>
          <TestimonialGrid>
            <Testimonial>
              <TestimonialText>
                "TalentHarness helped me identify my strengths and land my dream job in AI!"
              </TestimonialText>
              <TestimonialAuthor>- Sarah K., Data Scientist</TestimonialAuthor>
            </Testimonial>
            <Testimonial>
              <TestimonialText>
                "The personalized learning paths were a game-changer for my career growth."
              </TestimonialText>
              <TestimonialAuthor>- Mike R., Full Stack Developer</TestimonialAuthor>
            </Testimonial>
          </TestimonialGrid>
        </TestimonialsSection>
      </AnimatedSection>

      <AnimatedSection delay={0.8}>
        <CTASection>
          <CTATitle>Ready to Harness Your Potential?</CTATitle>
          <CTAButton as={Link} to="/signup">Sign Up Now</CTAButton>
        </CTASection>
      </AnimatedSection>
    </Container>
  );
};

// Add these styled component definitions
const Container = styled.div`
  font-family: 'Inter', sans-serif;
  color: #1a202c;
`;

const HeroSection = styled.section`
  background-color: #ebf8ff;
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h2`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2b6cb0;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: #4a5568;
  margin-bottom: 2rem;
`;

const CTAButton = styled(Link)`
  background-color: #4299e1;
  color: white;
  font-weight: bold;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
  &:hover {
    background-color: #2b6cb0;
  }
`;

const IntroSection = styled.section`
  padding: 4rem 2rem;
  text-align: center;
  background-color: #fff;
`;

const SectionTitle = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2d3748;
`;

const SectionText = styled.p`
  font-size: 1.125rem;
  color: #4a5568;
  max-width: 600px;
  margin: 0 auto;
`;

const FeaturesSection = styled.section`
  display: flex;
  justify-content: space-around;
  padding: 4rem 2rem;
  background-color: #f7fafc;
`;

const FeatureCard = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 300px;
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  color: #4a5568;
`;

const TestimonialsSection = styled.section`
  padding: 4rem 2rem;
  background-color: #ebf8ff;
  text-align: center;
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const Testimonial = styled.div`
  background-color: #fff;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TestimonialText = styled.p`
  font-style: italic;
  margin-bottom: 1rem;
`;

const TestimonialAuthor = styled.p`
  font-weight: bold;
  color: #2d3748;
`;

const CTASection = styled.section`
  background-color: #4299e1;
  color: white;
  padding: 4rem 2rem;
  text-align: center;
`;

const CTATitle = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
`;

export default LandingPage;
