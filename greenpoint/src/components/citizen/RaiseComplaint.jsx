import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './RaiseComplaint.css';

export default function RaiseComplaint() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    anonymous: false
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null); 

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Attach stream to video
  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const handleLogout = async () => {
    try {
      if (logout) await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(newStream);
      setCameraActive(true);
    } catch (err) {
      setError('Camera error. Try using localhost or HTTPS.');
      console.error(err);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setImage(blob);
        setImagePreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: `Lat: ${position.coords.latitude.toFixed(2)}, Lng: ${position.coords.longitude.toFixed(2)}`
          });
        },
        (err) => {
          // Fallback if location fails (Mock Location)
          console.warn("Location failed, using mock data");
          setLocation({
            latitude: 18.5204,
            longitude: 73.8567,
            region: "Pune, Maharashtra (Demo)"
          });
        }
      );
    } else {
      setError('Geolocation not supported.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleAnonymous = () => {
    setFormData(prev => ({ ...prev, anonymous: !prev.anonymous }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please capture a photo.');
    if (!location) return setError('Please get location.');

    setLoading(true);

    // --- FRONTEND SIMULATION START ---
    
    // 1. Simulate Network Delay (2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 2. Create a "Fake" Complaint Object
    const newComplaint = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      imageUrl: imagePreview, 
      region: location.region,
      userId: formData.anonymous ? null : (currentUser?.uid || 'demo-user'),
      anonymous: formData.anonymous,
      status: 'pending',
      upvotes: 0,
      createdAt: new Date().toISOString()
    };

    const existingComplaints = JSON.parse(localStorage.getItem('local_complaints') || '[]');
    localStorage.setItem('local_complaints', JSON.stringify([newComplaint, ...existingComplaints]));

    console.log("Complaint Saved Locally:", newComplaint);
    
    // --- FRONTEND SIMULATION END ---

    setLoading(false);
    navigate('/citizen/dashboard');
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand"><h2>🌱 GreenPoints</h2></div>
        <div className="nav-links">
          <button onClick={() => navigate('/citizen/dashboard')} className="nav-link">Dashboard</button>
          <button onClick={() => navigate('/citizen/feed')} className="nav-link">Community Feed</button>
          <button className="nav-link active">Raise Complaint</button>
          <button onClick={handleLogout} className="nav-link logout">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="form-container">
          <h1>Raise a Complaint</h1>
          <p className="form-subtitle">Report environmental issues (Demo Mode)</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="complaint-form">
            <div className="form-group">
              <label>Complaint Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue..."
                rows="5"
                required
              />
            </div>

            <div className="form-group">
              <label>Capture Photo</label>
              {!cameraActive && !imagePreview && (
                <button type="button" onClick={startCamera} className="camera-button">
                  📷 Open Camera
                </button>
              )}
              {cameraActive && (
                <div className="camera-container">
                  <video ref={videoRef} autoPlay playsInline muted />
                  <button type="button" onClick={capturePhoto} className="capture-button">
                    Capture Photo
                  </button>
                  <button type="button" onClick={stopCamera} className="cancel-button">
                    Cancel
                  </button>
                </div>
              )}
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                    className="remove-button"
                  >
                    Remove & Retake
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            <div className="form-group">
              <label>Location</label>
              {!location ? (
                <button type="button" onClick={getLocation} className="location-button">
                  📍 Get Location
                </button>
              ) : (
                <div className="location-display">
                  <span>✅ {location.region}</span>
                </div>
              )}
            </div>

            {/* Anonymous reporting toggle (glass switch) */}
            <div className="form-group">
              <div className="anonymous-toggle-row">
                <div className="anonymous-toggle-text">
                  <span className="anonymous-toggle-label">Submit as Anonymous</span>
                  <span className="anonymous-toggle-helper">
                    When enabled, your name will be hidden on the public feed.
                  </span>
                </div>

                <button
                  type="button"
                  className={`glass-toggle ${formData.anonymous ? 'on' : ''}`}
                  role="switch"
                  aria-checked={formData.anonymous}
                  onClick={toggleAnonymous}
                >
                  <span className="glass-toggle-knob" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !image || !location}
              className="submit-button"
            >
              {loading ? 'Simulating Upload...' : 'Submit Complaint (Demo)'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}