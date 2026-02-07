import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../../services/firebase';
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

  // Reverse geocode coordinates to a human-readable region name (for display in feed/admin)
  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'GreenPoints-App' } }
      );
      const data = await res.json();
      const addr = data?.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
      const state = addr.state || addr.region || '';
      const country = addr.country || '';
      const parts = [city, state, country].filter(Boolean);
      return parts.length ? parts.join(', ') : `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    } catch (e) {
      console.warn('Reverse geocode failed:', e);
      return `Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setError('');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const regionName = await reverseGeocode(lat, lng);
          setLocation({
            latitude: lat,
            longitude: lng,
            region: regionName
          });
        },
        (err) => {
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
    setError('');

    try {
      // Use preview URL so we don't hang on Storage upload; save to Firestore first
      let imageUrl = imagePreview;
      const userId = formData.anonymous ? null : (currentUser?.uid || null);

      await addDoc(collection(db, 'complaints'), {
        title: formData.title,
        description: formData.description,
        imageUrl,
        region: location.region,
        latitude: location.latitude,
        longitude: location.longitude,
        userId,
        anonymous: formData.anonymous,
        status: 'pending',
        upvotes: 0,
        createdAt: serverTimestamp()
      });

      if (!formData.anonymous && currentUser?.uid) {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          await updateDoc(userRef, { complaintsRaised: increment(1) });
        } else {
          await setDoc(userRef, { complaintsRaised: 1, role: 'citizen' }, { merge: true });
        }
      }

      navigate('/citizen/dashboard');
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      const message =
        err?.message ||
        (err?.code === 'permission-denied'
          ? 'Permission denied. Check Firestore rules allow create on "complaints".'
          : 'Failed to submit. Check console and Firestore rules.');
      setError(message);
    } finally {
      setLoading(false);
    }
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
          <p className="form-subtitle">Report environmental issues. Your complaint will appear in My Complaints and for admins.</p>

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
                  <span className="location-coords">
                    Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </span>
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
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}