import React, { useState } from "react";
import axios from "axios";

const JobModal = ({ job, show, onClose, packageTypes }) => {
  const [isApplying, setIsApplying] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null
  });
   const apiUrl = process.env.REACT_APP_API_URL;

  if (!job || !show) return null;

  // Function to get package styling
  const getPackageStyle = (pkg) => {
    return packageTypes[pkg] || packageTypes.silver;
  };

  // Calculate salary breakdown
  

  const pkg = getPackageStyle(job.package);
 

  // Handle apply button click
  const handleApply = async () => {
    if (!applicationData.name || !applicationData.email || !applicationData.phone || !applicationData.resume) {
      alert("Please fill all required fields and upload your resume");
      return;
    }

    setIsApplying(true);
    
    try {
      const formData = new FormData();
      formData.append('name', applicationData.name);
      formData.append('email', applicationData.email);
      formData.append('phone', applicationData.phone);
      formData.append('jobId', job._id); // Assuming job has _id field
      formData.append('resume', applicationData.resume);
      formData.append('companyId', job.companyId); // Assuming job has companyId field

      const response = await axios.post(`${apiUrl}candidate/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Application submitted:', response.data);
      alert('Application submitted successfully!');
      onClose(); // Close modal after successful application
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    setApplicationData(prev => ({
      ...prev,
      resume: e.target.files[0]
    }));
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <div>
              <h4 className="modal-title">{job.title}</h4>
              <p className="mb-0 text-muted">{job.company} • {job.location}</p>
            </div>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Header Info */}
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${pkg.badgeClass}`}>
                    <i className={`${pkg.icon} me-1`}></i>
                    {pkg.name} Package
                  </span>
                  {job.urgent && <span className="badge bg-danger">Urgent</span>}
                  {job.featured && <span className="badge bg-success">Featured</span>}
                  <span className="badge bg-info">{job.type}</span>
                  <span className="badge bg-secondary">{job.experienceLevel}</span>
                </div>
                
                <div className="d-flex flex-wrap gap-3 text-muted">
                  <div>
                    <i className="bi bi-calendar me-1"></i>
                    Posted: {job.posted}
                  </div>
                  <div>
                    <i className="bi bi-clock me-1"></i>
                    Post Date: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>
                  <div>
                    <i className="bi bi-book me-1"></i>
                    {job.education}
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-end">
                <div className="salary-display">
                  <h3 className="text-success mb-1">{job.salary}</h3>
                  <small className="text-muted">per year</small>
                </div>
              </div>
            </div>
            
            {/* Salary Breakdown */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-calculator me-2"></i>
                  Salary Breakdown & Benefits
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Component</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Base Salary</td>
                          <td className="text-end">₹</td>
                        </tr>
                        <tr>
                          <td>Tax (18%)</td>
                          <td className="text-end text-danger">-₹</td>
                        </tr>
                        <tr>
                          <td>Benefits & Bonuses</td>
                          <td className="text-end text-success">+₹</td>
                        </tr>
                        <tr className="table-success fw-bold">
                          <td>CTC (Cost to Company)</td>
                          <td className="text-end">₹</td>
                        </tr>
                        <tr className="table-primary fw-bold">
                          <td>Cash in Hand (Annual)</td>
                          <td className="text-end">₹</td>
                        </tr>
                        <tr className="table-info">
                          <td>Monthly Take Home</td>
                          <td className="text-end">₹</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="col-md-12">
                    <h6 className="mb-3">Benefits Included:</h6>
                    <div className="row">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="col-6 mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-4">
              <h5 className="mb-3">
                <i className="bi bi-file-text me-2"></i>
                Job Description
              </h5>
              <p className="text-muted">{job.description}</p>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="mb-4">
                <h5 className="mb-3">
                  <i className="bi bi-list-check me-2"></i>
                  Requirements
                </h5>
                <div className="row">
                  {job.requirements.map((requirement, index) => (
                    <div key={index} className="col-md-6 mb-2">
                      <i className="bi bi-arrow-right-short text-primary me-2"></i>
                      {requirement}
                    </div>
                  ))}
                </div>
              </div>
            )}
             {/* Application Form */}
            <div className="card mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  Application Form
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label">Full Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={applicationData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={applicationData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="phone" className="form-label">Phone <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={applicationData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="resume" className="form-label ">Resume  <span className="text-danger">*</span></label>
                    <input
                      type="file"
                      className="form-control"
                      id="resume"
                      name="resume"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx"
                      required
                    />
                    <small className="text-muted">Accepted formats: PDF, DOC, DOCX</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isApplying}
            >
              Close
            </button>
            <button 
              type="button" 
              className={`btn btn-${pkg.color}`}
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Applying...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Apply for this Position
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;