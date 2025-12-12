import React, { useState } from 'react';

function RSVPPage() {
  const [formData, setFormData] = useState({ name: '', email: '', attending: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission, e.g., send to Firebase or save locally
    console.log(formData);
  };

  return (
    <div className="rsvp">
      <h2>RSVP</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Your Name" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Your Email" onChange={handleChange} required />
        <label>
          <input type="checkbox" name="attending" onChange={handleChange} />
          I will attend
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default RSVPPage;