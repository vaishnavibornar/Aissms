import React, { useState, useRef, useEffect } from "react";
import { storage, db, auth } from "../../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./RaiseComplaint.css";

export default function RaiseComplaint() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [details, setDetails] = useState({ title: "", description: "", anonymous: false });
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const navigate = useNavigate();

  // 1. Start Camera
  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Camera access denied or unavailable.");
    }
  };

  // 2. Capture Photo
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        setImage(blob);
        setPreview(URL.createObjectURL(blob));
        
        // Stop stream
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setIsCameraOpen(false);
      }, "image/jpeg", 0.8);
    }
  };

  // 3. Get Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => console.error("Location access denied")
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please capture a photo first!");
    setLoading(true);

    try {
      // Upload Image
      const imageRef = ref(storage, `complaints/${Date.now()}_${auth.currentUser.uid}.jpg`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

      // Save Data
      await addDoc(collection(db, "complaints"), {
        ...details,
        imageUrl,
        location,
        userId: details.anonymous ? "anonymous" : auth.currentUser.uid,
        userName: details.anonymous ? "Anonymous" : auth.currentUser.displayName || "Citizen",
        status: "pending",
        upvotes: 0,
        upvotedBy: [],
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard");
    } catch (err) {
      alert("Error submitting complaint: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card complaint-card">
        <h2>📷 Report an Issue</h2>
        
        {/* Camera Section */}
        <div className="camera-section">
          {!preview && !isCameraOpen && (
            <button onClick={startCamera} className="btn-primary">Open Camera</button>
          )}
          
          {isCameraOpen && (
            <div className="video-container">
              <video ref={videoRef} autoPlay playsInline></video>
              <button onClick={capturePhoto} className="capture-btn"></button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

          {preview && (
            <div className="preview-container">
              <img src={preview} alt="Captured issue" />
              <button onClick={() => { setPreview(null); setImage(null); }} className="text-btn">Retake</button>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Title (e.g., Garbage Pile)" 
            value={details.title} 
            onChange={(e) => setDetails({...details, title: e.target.value})} 
            required 
          />
          <textarea 
            placeholder="Describe the issue..." 
            value={details.description} 
            onChange={(e) => setDetails({...details, description: e.target.value})} 
            required 
          />
          
          <div className="checkbox-group">
            <label>
              <input 
                type="checkbox" 
                checked={details.anonymous} 
                onChange={(e) => setDetails({...details, anonymous: e.target.checked})} 
              />
              Submit Anonymously
            </label>
          </div>

          <div className="location-status">
            {location ? "📍 Location Detected" : "⚠️ Enabling GPS..."}
          </div>

          <button type="submit" disabled={loading} className="btn-primary full-width">
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}