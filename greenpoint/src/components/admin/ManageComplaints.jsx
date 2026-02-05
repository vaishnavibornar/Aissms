import React, { useState, useEffect } from "react";
import { db } from "../../services/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import "./ManageComplaints.css";

export default function ManageComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [selectedDept, setSelectedDept] = useState({});

  useEffect(() => {
    // Listen to all complaints
    const unsubscribe = onSnapshot(collection(db, "complaints"), (snapshot) => {
      setComplaints(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
      // If assigning, include department
      if (newStatus === 'assigned' && selectedDept[id]) {
        updateData.department = selectedDept[id];
      }

      await updateDoc(doc(db, "complaints", id), updateData);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeptSelect = (id, dept) => {
    setSelectedDept(prev => ({ ...prev, [id]: dept }));
  };

  return (
    <div className="container manage-container">
      <div className="header-flex">
        <h2>Manage Complaints</h2>
        <div className="filters">
          {/* Add filter UI logic here if needed */}
        </div>
      </div>

      <div className="table-responsive">
        <table className="management-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Issue Title</th>
              <th>Priority (Votes)</th>
              <th>Current Status</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((item) => (
              <tr key={item.id}>
                <td className="mono-font">#{item.id.slice(0,6)}</td>
                <td>{item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                <td>{item.title}</td>
                <td>
                  <span className={`vote-tag ${item.upvotes >= 20 ? 'high' : 'low'}`}>
                    {item.upvotes} Votes
                  </span>
                </td>
                <td><span className={`status-pill ${item.status}`}>{item.status}</span></td>
                
                {/* Department Selection Logic */}
                <td>
                  {item.status === 'approved' ? (
                    <select 
                      onChange={(e) => handleDeptSelect(item.id, e.target.value)}
                      className="dept-select"
                    >
                      <option value="">Select Dept</option>
                      <option value="Waste">Waste Mgmt</option>
                      <option value="Water">Water Supply</option>
                      <option value="Roads">Roads & Infra</option>
                    </select>
                  ) : (
                    item.department || "—"
                  )}
                </td>

                {/* Action Buttons Logic */}
                <td>
                  <div className="action-group">
                    {item.status === 'pending' && (
                      <>
                        <button onClick={() => handleStatusChange(item.id, 'approved')} className="btn-icon check">✓</button>
                        <button onClick={() => handleStatusChange(item.id, 'rejected')} className="btn-icon cross">✗</button>
                      </>
                    )}
                    
                    {item.status === 'approved' && (
                      <button 
                        onClick={() => handleStatusChange(item.id, 'assigned')} 
                        className="btn-sm assign"
                        disabled={!selectedDept[item.id]}
                      >
                        Assign
                      </button>
                    )}

                    {item.status === 'assigned' && (
                      <button onClick={() => handleStatusChange(item.id, 'resolved')} className="btn-sm resolve">
                        Close Ticket
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}