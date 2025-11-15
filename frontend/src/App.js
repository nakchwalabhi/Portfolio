import { useEffect, useState, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { MessageCircle, X, Send, Moon, Sun, Volume2, VolumeX, Github, Linkedin, Mail, Code, Award, Briefcase, Users, Sparkles } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  // Handle custom cursor
  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      
      // Add particle trail
      if (Math.random() > 0.9) {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1
        };
        setParticles(prev => [...prev.slice(-20), newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.02
          }))
          .filter(p => p.life > 0)
      );
    }, 16);
    return () => clearInterval(interval);
  }, []);

  // Easter egg handler (press 'A')
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'a') {
        setEasterEggActive(true);
        setTimeout(() => setEasterEggActive(false), 3000);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Canvas 3D background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId;
    let gridOffset = 0;
    let orbs = [];

    // Initialize floating orbs
    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 30 + Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        hue: Math.random() * 60 + 180
      });
    }

    const drawGrid = () => {
      ctx.strokeStyle = darkMode ? 'rgba(0, 255, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)';
      ctx.lineWidth = 1;
      const spacing = 50;

      for (let x = (gridOffset % spacing) - spacing; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = (gridOffset % spacing) - spacing; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    };

    const drawOrbs = () => {
      orbs.forEach(orb => {
        orb.x += orb.vx;
        orb.y += orb.vy;

        if (orb.x < 0 || orb.x > canvas.width) orb.vx *= -1;
        if (orb.y < 0 || orb.y > canvas.height) orb.vy *= -1;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 60%, 0.4)`);
        gradient.addColorStop(0.5, `hsla(${orb.hue}, 100%, 50%, 0.2)`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      ctx.fillStyle = darkMode ? 'rgba(10, 10, 15, 0.3)' : 'rgba(250, 250, 255, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      gridOffset += 0.5;
      drawGrid();
      drawOrbs();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [darkMode]);

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(`${API}/chat`, { message: chatInput });
      const botMessage = { role: 'bot', content: response.data.response };
      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { role: 'bot', content: "Sorry, I'm having trouble connecting." };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleAudio = () => {
    if (!audioEnabled && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioEnabled(!audioEnabled);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`} data-testid="portfolio-app">
      {/* Canvas Background */}
      <canvas ref={canvasRef} className="canvas-bg" />

      {/* Custom Cursor */}
      <div 
        className="custom-cursor" 
        style={{ left: cursorPos.x, top: cursorPos.y }}
      />
      {particles.map(p => (
        <div
          key={p.id}
          className="cursor-particle"
          style={{
            left: p.x,
            top: p.y,
            opacity: p.life
          }}
        />
      ))}

      {/* Navigation */}
      <nav className="navbar" data-testid="navbar">
        <div className="nav-logo">PORTFOLIO</div>
        <div className="nav-links">
          <button onClick={() => scrollToSection('hero')} data-testid="nav-home">Home</button>
          <button onClick={() => scrollToSection('about')} data-testid="nav-about">About</button>
          <button onClick={() => scrollToSection('skills')} data-testid="nav-skills">Skills</button>
          <button onClick={() => scrollToSection('projects')} data-testid="nav-projects">Projects</button>
          <button onClick={() => scrollToSection('contact')} data-testid="nav-contact">Contact</button>
        </div>
        <div className="nav-actions">
          <button onClick={() => setDarkMode(!darkMode)} className="icon-btn" data-testid="theme-toggle">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={toggleAudio} className="icon-btn" data-testid="audio-toggle">
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero-section" data-testid="hero-section">
        <div className="hero-content">
          <div className="hero-profile">
            <div className="profile-hologram">
              <div className="hologram-ring" />
              <div className="hologram-ring" style={{ animationDelay: '0.5s' }} />
              <div className="profile-image" />
            </div>
          </div>
          <h1 className="hero-title" data-testid="hero-title">
            <span className="glitch" data-text="JOHN DEVELOPER">JOHN DEVELOPER</span>
          </h1>
          <p className="hero-subtitle" data-testid="hero-subtitle">
            Full-Stack Developer • 3D Enthusiast • AI Innovator
          </p>
          <div className="hero-cta">
            <button className="cta-btn primary" onClick={() => scrollToSection('projects')} data-testid="view-work-btn">
              <Sparkles size={18} />
              View My Work
            </button>
            <button className="cta-btn secondary" onClick={() => scrollToSection('contact')} data-testid="contact-btn">
              <Mail size={18} />
              Get In Touch
            </button>
          </div>
        </div>
        <div className="scroll-indicator" data-testid="scroll-indicator">
          <div className="scroll-line" />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section section" data-testid="about-section">
        <h2 className="section-title" data-testid="about-title">ABOUT ME</h2>
        <div className="about-grid">
          <div className="about-card glass-card" data-testid="about-card-1">
            <div className="card-icon"><Code size={32} /></div>
            <h3>Background</h3>
            <p>Passionate developer with 5+ years of experience building innovative web applications and 3D experiences.</p>
          </div>
          <div className="about-card glass-card" data-testid="about-card-2">
            <div className="card-icon"><Award size={32} /></div>
            <h3>Expertise</h3>
            <p>Specialized in React, Three.js, Node.js, and modern web technologies with a focus on cutting-edge design.</p>
          </div>
          <div className="about-card glass-card" data-testid="about-card-3">
            <div className="card-icon"><Sparkles size={32} /></div>
            <h3>Philosophy</h3>
            <p>Creating immersive digital experiences that blend functionality with stunning visual design.</p>
          </div>
        </div>
        <div className="timeline" data-testid="timeline">
          <div className="timeline-item" data-testid="timeline-item-1">
            <div className="timeline-dot" />
            <div className="timeline-content glass-card">
              <h4>2024 - Present</h4>
              <p>Senior Full-Stack Developer at Tech Innovations Inc.</p>
            </div>
          </div>
          <div className="timeline-item" data-testid="timeline-item-2">
            <div className="timeline-dot" />
            <div className="timeline-content glass-card">
              <h4>2021 - 2024</h4>
              <p>Full-Stack Developer at Digital Solutions Co.</p>
            </div>
          </div>
          <div className="timeline-item" data-testid="timeline-item-3">
            <div className="timeline-dot" />
            <div className="timeline-content glass-card">
              <h4>2019 - 2021</h4>
              <p>Junior Developer at StartUp Labs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills-section section" data-testid="skills-section">
        <h2 className="section-title" data-testid="skills-title">SKILLS</h2>
        <div className="skills-container">
          <div className="skill-wheel" data-testid="skill-wheel">
            <div className="skill-orb" style={{ '--i': 0 }} data-testid="skill-react">
              <span>React</span>
            </div>
            <div className="skill-orb" style={{ '--i': 1 }} data-testid="skill-threejs">
              <span>Three.js</span>
            </div>
            <div className="skill-orb" style={{ '--i': 2 }} data-testid="skill-nodejs">
              <span>Node.js</span>
            </div>
            <div className="skill-orb" style={{ '--i': 3 }} data-testid="skill-python">
              <span>Python</span>
            </div>
            <div className="skill-orb" style={{ '--i': 4 }} data-testid="skill-typescript">
              <span>TypeScript</span>
            </div>
            <div className="skill-orb" style={{ '--i': 5 }} data-testid="skill-webgl">
              <span>WebGL</span>
            </div>
          </div>
        </div>
        <div className="skill-bars" data-testid="skill-bars">
          <div className="skill-bar-item" data-testid="skill-bar-frontend">
            <div className="skill-bar-label">Frontend Development</div>
            <div className="skill-bar-bg">
              <div className="skill-bar-fill" style={{ width: '95%' }} />
            </div>
          </div>
          <div className="skill-bar-item" data-testid="skill-bar-backend">
            <div className="skill-bar-label">Backend Development</div>
            <div className="skill-bar-bg">
              <div className="skill-bar-fill" style={{ width: '90%' }} />
            </div>
          </div>
          <div className="skill-bar-item" data-testid="skill-bar-3d">
            <div className="skill-bar-label">3D Graphics & Animation</div>
            <div className="skill-bar-bg">
              <div className="skill-bar-fill" style={{ width: '85%' }} />
            </div>
          </div>
          <div className="skill-bar-item" data-testid="skill-bar-uiux">
            <div className="skill-bar-label">UI/UX Design</div>
            <div className="skill-bar-bg">
              <div className="skill-bar-fill" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="projects-section section" data-testid="projects-section">
        <h2 className="section-title" data-testid="projects-title">FEATURED PROJECTS</h2>
        <div className="projects-grid">
          <div className="project-card glass-card" data-testid="project-1">
            <div className="project-image" style={{ backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} />
            <div className="project-content">
              <h3>3D Portfolio Showcase</h3>
              <p>Interactive 3D portfolio built with Three.js and React showcasing creative projects.</p>
              <div className="project-tags">
                <span>React</span>
                <span>Three.js</span>
                <span>WebGL</span>
              </div>
            </div>
          </div>
          <div className="project-card glass-card" data-testid="project-2">
            <div className="project-image" style={{ backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }} />
            <div className="project-content">
              <h3>AI Chat Application</h3>
              <p>Real-time chat app with AI integration and modern UI/UX design patterns.</p>
              <div className="project-tags">
                <span>Node.js</span>
                <span>OpenAI</span>
                <span>Socket.io</span>
              </div>
            </div>
          </div>
          <div className="project-card glass-card" data-testid="project-3">
            <div className="project-image" style={{ backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }} />
            <div className="project-content">
              <h3>E-Commerce Platform</h3>
              <p>Full-stack e-commerce solution with payment integration and admin dashboard.</p>
              <div className="project-tags">
                <span>React</span>
                <span>FastAPI</span>
                <span>MongoDB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services-section section" data-testid="services-section">
        <h2 className="section-title" data-testid="services-title">SERVICES</h2>
        <div className="services-grid">
          <div className="service-card magnetic-card" data-testid="service-1">
            <div className="service-icon"><Code size={48} /></div>
            <h3>Web Development</h3>
            <p>Custom web applications built with modern frameworks and best practices.</p>
          </div>
          <div className="service-card magnetic-card" data-testid="service-2">
            <div className="service-icon"><Sparkles size={48} /></div>
            <h3>3D Experiences</h3>
            <p>Immersive 3D web experiences using Three.js and WebGL technologies.</p>
          </div>
          <div className="service-card magnetic-card" data-testid="service-3">
            <div className="service-icon"><Briefcase size={48} /></div>
            <h3>Consulting</h3>
            <p>Technical consulting and architecture design for complex projects.</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section section" data-testid="testimonials-section">
        <h2 className="section-title" data-testid="testimonials-title">TESTIMONIALS</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card flip-card" data-testid="testimonial-1">
            <div className="card-inner">
              <div className="card-front glass-card">
                <Users size={32} />
                <p>"Exceptional work on our 3D product showcase. Highly recommended!"</p>
                <h4>Sarah Johnson</h4>
                <span>CEO, TechCorp</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card flip-card" data-testid="testimonial-2">
            <div className="card-inner">
              <div className="card-front glass-card">
                <Users size={32} />
                <p>"Delivered beyond expectations. Great communication and technical skills."</p>
                <h4>Michael Chen</h4>
                <span>CTO, StartupLabs</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card flip-card" data-testid="testimonial-3">
            <div className="card-inner">
              <div className="card-front glass-card">
                <Users size={32} />
                <p>"Amazing developer with incredible attention to detail and design."</p>
                <h4>Emily Rodriguez</h4>
                <span>Designer, Creative Studio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section section" data-testid="contact-section">
        <h2 className="section-title" data-testid="contact-title">GET IN TOUCH</h2>
        <div className="contact-container">
          <form className="contact-form glass-card" data-testid="contact-form">
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Your Name" 
                className="form-input glow-input"
                data-testid="contact-name"
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Your Email" 
                className="form-input glow-input"
                data-testid="contact-email"
              />
            </div>
            <div className="form-group">
              <textarea 
                placeholder="Your Message" 
                className="form-input glow-input"
                rows="5"
                data-testid="contact-message"
              />
            </div>
            <button type="submit" className="submit-btn" data-testid="contact-submit">
              <Send size={18} />
              Send Message
            </button>
          </form>
          <div className="contact-info">
            <div className="contact-item glass-card" data-testid="contact-github">
              <Github size={24} />
              <span>github.com/johndeveloper</span>
            </div>
            <div className="contact-item glass-card" data-testid="contact-linkedin">
              <Linkedin size={24} />
              <span>linkedin.com/in/johndeveloper</span>
            </div>
            <div className="contact-item glass-card" data-testid="contact-mail">
              <Mail size={24} />
              <span>john@developer.com</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" data-testid="footer">
        <p>© 2025 John Developer. All rights reserved.</p>
        <div className="footer-links">
          <button onClick={() => scrollToSection('hero')}>Home</button>
          <button onClick={() => scrollToSection('about')}>About</button>
          <button onClick={() => scrollToSection('projects')}>Projects</button>
          <button onClick={() => scrollToSection('contact')}>Contact</button>
        </div>
      </footer>

      {/* AI Chatbot */}
      <div className={`chatbot-container ${showChatbot ? 'open' : ''}`} data-testid="chatbot-container">
        {!showChatbot ? (
          <button 
            className="chatbot-trigger" 
            onClick={() => setShowChatbot(true)}
            data-testid="chatbot-trigger"
          >
            <MessageCircle size={24} />
          </button>
        ) : (
          <div className="chatbot-window glass-card" data-testid="chatbot-window">
            <div className="chatbot-header">
              <div className="chatbot-avatar" />
              <span>AI Assistant</span>
              <button 
                className="close-btn" 
                onClick={() => setShowChatbot(false)}
                data-testid="chatbot-close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="chatbot-messages" data-testid="chatbot-messages">
              {chatMessages.length === 0 && (
                <div className="welcome-message" data-testid="welcome-message">
                  <p>Hi! I'm your AI assistant. Ask me anything about my skills and projects!</p>
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`chat-message ${msg.role}`}
                  data-testid={`chat-message-${idx}`}
                >
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div className="chat-message bot typing" data-testid="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              )}
            </div>
            <div className="chatbot-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Type your message..."
                className="chat-input"
                data-testid="chatbot-input"
              />
              <button 
                onClick={sendChatMessage} 
                className="send-btn"
                data-testid="chatbot-send"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Easter Egg */}
      {easterEggActive && (
        <div className="easter-egg" data-testid="easter-egg">
          <div className="easter-egg-content">
            <h2>🎉 You found the secret!</h2>
            <p>Press 'A' anytime to activate this easter egg</p>
          </div>
        </div>
      )}

      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUR8NTqXh8bllGwQ9ktXyznwrBSh+zPHajkALFl+16+yrWRQLS6Hf8r9uIwU3jtLz1YU3BiV1xPDcmFUgD1Oo4/K7aB4FP5XY8tGCLwYleMnw34tADBhitOrtrFkUDlCm4PG/bCYGPpPU8diGNwYnecjw3Y9DDBphtertsVoUD1Kn4fG8aBoEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBoEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsEPpPU8daFNgYncsjw3I9CDBphtertsVoUD1Kn4fG8aBsE" type="audio/wav" />
      </audio>
    </div>
  );
}

export default App;