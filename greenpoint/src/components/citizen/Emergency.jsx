import React from "react";
import "./Emergency.css";

export default function Emergency() {
  const contacts = [
    { name: "Fire Brigade", number: "101", icon: "🚒", bg: "#fee2e2" },
    { name: "Ambulance", number: "102", icon: "🚑", bg: "#e0e7ff" },
    { name: "Police", number: "100", icon: "👮", bg: "#fef3c7" },
    { name: "Civic Helpline", number: "1800-123-456", icon: "🏛️", bg: "#dcfce7" },
  ];

  return (
    <div className="container emergency-container">
      <h2>🚨 Emergency Support</h2>
      <p>Quick access to critical services in your area.</p>
      
      <div className="emergency-grid">
        {contacts.map((contact, idx) => (
          <a href={`tel:${contact.number}`} key={idx} className="emergency-card" style={{backgroundColor: contact.bg}}>
            <div className="icon">{contact.icon}</div>
            <div className="info">
              <h3>{contact.name}</h3>
              <span className="number">{contact.number}</span>
            </div>
            <div className="action">Call Now →</div>
          </a>
        ))}
      </div>

      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <details>
          <summary>How do I earn points?</summary>
          <p>You earn points when the community upvotes your valid complaints.</p>
        </details>
        <details>
          <summary>Is my identity protected?</summary>
          <p>Yes, if you select "Submit Anonymously", your name is hidden from the public feed.</p>
        </details>
      </div>
    </div>
  );
}