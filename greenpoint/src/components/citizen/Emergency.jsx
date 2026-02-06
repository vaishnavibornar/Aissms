import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Emergency.css';

export default function Emergency() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const emergencyContacts = [
    {
      name: 'Fire Brigade',
      number: '101',
      icon: '🚒',
      description: 'For fire emergencies and rescue operations'
    },
    {
      name: 'Ambulance',
      number: '102',
      icon: '🚑',
      description: 'For medical emergencies'
    },
    {
      name: 'Police',
      number: '100',
      icon: '👮',
      description: 'For law and order emergencies'
    },
    {
      name: 'Municipal Helpline',
      number: '1800-123-4567',
      icon: '🏛️',
      description: 'For civic and environmental issues'
    }
  ];

  const faqs = [
    {
      question: 'How do I raise a complaint?',
      answer: 'Go to "Raise Complaint" section, capture a photo of the issue using your camera, add a title and description, enable location, and submit. You can also choose to submit anonymously.'
    },
    {
      question: 'What happens after I submit a complaint?',
      answer: 'Your complaint will be reviewed by administrators. Once approved, it will be assigned to the relevant department for resolution. You can track the status in your dashboard.'
    },
    {
      question: 'How does the upvoting system work?',
      answer: 'You can upvote complaints in the Community Feed. Each user can upvote once per complaint. Higher upvotes increase the priority of the issue and earn points for the complaint creator.'
    },
    {
      question: 'How do I earn points?',
      answer: 'You earn points when other users upvote your complaints. Points help you climb the community leaderboard and showcase your contribution to environmental causes.'
    },
    {
      question: 'Can I edit or delete my complaint?',
      answer: 'Once submitted, complaints cannot be edited to maintain transparency. However, administrators can reject invalid complaints. Contact support if you need to update critical information.'
    },
    {
      question: 'What are the different complaint statuses?',
      answer: 'Pending: Under review | Approved: Verified by admin | Assigned: Given to department | Resolved: Issue fixed | Rejected: Not valid'
    },
    {
      question: 'Why should I enable location?',
      answer: 'Location helps administrators assign complaints to the correct department and allows community members to filter issues by region. Your exact address is not stored, only coordinates.'
    },
    {
      question: 'What types of issues can I report?',
      answer: 'You can report environmental and civic issues like waste disposal problems, illegal dumping, pollution, broken infrastructure, poor sanitation, water logging, and more.'
    }
  ];

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>🌱 GreenPoints</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate('/citizen/dashboard')} className="nav-link">
            Dashboard
          </button>
          <button onClick={() => navigate('/citizen/feed')} className="nav-link">
            Community Feed
          </button>
          <button onClick={() => navigate('/citizen/raise-complaint')} className="nav-link">
            Raise Complaint
          </button>
          <button onClick={() => navigate('/citizen/profile')} className="nav-link">
            Profile
          </button>
          <button onClick={() => navigate('/citizen/emergency')} className="nav-link active">
            Emergency
          </button>
          <button onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="emergency-container">
          <div className="emergency-header">
            <h1>Emergency & Help</h1>
            <p>Quick access to emergency contacts and frequently asked questions</p>
          </div>

          <div className="emergency-section">
            <h2>🚨 Emergency Contacts</h2>
            <div className="contacts-grid">
              {emergencyContacts.map((contact) => (
                <div key={contact.name} className="contact-card">
                  <div className="contact-icon">{contact.icon}</div>
                  <h3>{contact.name}</h3>
                  <a href={`tel:${contact.number}`} className="contact-number">
                    {contact.number}
                  </a>
                  <p className="contact-description">{contact.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="emergency-section">
            <h2>❓ Frequently Asked Questions</h2>
            <div className="faqs-list">
              {faqs.map((faq, index) => (
                <details key={index} className="faq-item">
                  <summary className="faq-question">{faq.question}</summary>
                  <p className="faq-answer">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
