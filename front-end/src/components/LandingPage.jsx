import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Import all images
import heroImage1 from '../images/Identify.png';
import heroImage2 from '../images/Sculpt.png';
import heroImage3 from '../images/Deliver.png';
import assessmentImage from '../images/Digital.png';
import resumeImage from '../images/Create_a_stylized_illustration_of_a_digital_resume.png';
import chatbotImage from '../images/robot.png';
import voiceImage from '../images/voice_chat.png';
import courseImage from '../images/workspace.png';
import imageGenImage from '../images/Studio.png';

const LandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuresRef = useRef([]);
  
  const heroSlides = [
    {
      image: heroImage1,
      title: "Identifying Talent",
      description: "Focuses on the discovery and recognition of potential within a diverse pool."
    },
    {
      image: heroImage2,
      title: "Sculpting Talent",
      description: "Emphasizes the development and refinement process, turning potential into excellence."
    },
    {
      image: heroImage3,
      title: "Delivering Talent",
      description: "Highlights the presentation and integration of honed talent into the professional sphere."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    featuresRef.current.forEach((feature) => {
      if (feature) observer.observe(feature);
    });

    return () => {
      featuresRef.current.forEach((feature) => {
        if (feature) observer.unobserve(feature);
      });
    };
  }, []);

  const features = [
    {
      title: "Assessment Building Capability",
      description: "Create dynamic, AI-powered technical assessments tailored to any role or skill level. Transform your hiring process with precision and efficiency.",
      image: assessmentImage,
      alt: "Assessment Platform",
      emoji: "🎯"
    },
    {
      title: "Resume Analyser",
      description: "Leverage advanced AI to scan and analyze resumes with unprecedented accuracy. Match candidates to roles with intelligent skill mapping and scoring.",
      image: resumeImage,
      alt: "Resume Analysis",
      emoji: "📝"
    },
    {
      title: "Technical Support Chat Bot",
      description: "Your 24/7 technical companion for instant problem-solving and guidance. Powered by cutting-edge AI to provide accurate, contextual support.",
      image: chatbotImage,
      alt: "Chat Bot",
      emoji: "🤖"
    },
    {
      title: "Technical Voice Assistant",
      description: "Experience hands-free technical assistance with our AI voice companion. Natural conversations meet technical expertise for seamless support.",
      image: voiceImage,
      alt: "Voice Assistant",
      emoji: "🗣️"
    },
    {
      title: "Training Course Outline Generator",
      description: "Automatically generate comprehensive course outlines tailored to your needs. Transform learning objectives into structured, engaging curricula.",
      image: courseImage,
      alt: "Course Generator",
      emoji: "📚"
    },
    {
      title: "Image Generation Capability",
      description: "Create stunning, relevant visuals for your learning content with AI. Transform ideas into engaging visual assets with a single prompt.",
      image: imageGenImage,
      alt: "Image Generation",
      emoji: "🖼️"
    }
  ];

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-carousel-container">
          <div className="hero-carousel">
            {heroSlides.map((slide, index) => (
              <div 
                key={index} 
                className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
              >
                <div className="image-container">
                  <img src={slide.image} alt={slide.title} />
                </div>
                <div className={`slide-content ${index === currentSlide ? 'active' : ''}`}>
                  <h2 className="slide-title">{slide.title}</h2>
                  <p className="slide-description">{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hero-content">
        <h1 className="section-title">One home for all your learning and skills</h1>
        <p className="section-description">
          Create, discover, track and manage all of your learning and skills in one beautifully smart platform.
        </p>
        <Link to="/login" className="cta-button">Try it out</Link>
      </section>

      <section className="features-section">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`feature-item ${index % 2 === 0 ? 'even' : 'odd'}`}
            ref={el => featuresRef.current[index] = el}
          >
            <div className="feature-content">
              <div className="feature-emoji">{feature.emoji}</div>
              <h2 className="feature-title">{feature.title}</h2>
              <p className="feature-description">{feature.description}</p>
            </div>
            <div className="feature-image-container">
              <img src={feature.image} alt={feature.alt} className="feature-image" />
            </div>
          </div>
        ))}
      </section>

      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonial">
          <p>"TalentHarness has revolutionized our learning and development process. It's intuitive, powerful, and exactly what we needed."</p>
          <p className="testimonial-author">- John Doe, HR Director</p>
        </div>
        {/* Add more testimonials as needed */}
      </section>
    </div>
  );
};

export default LandingPage;
