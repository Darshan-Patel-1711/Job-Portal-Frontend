import React, { useState, useEffect } from "react";
import WebLayout from "../../../components/WebLayout";
import { Link } from "react-router-dom";
import axios from 'axios';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const Env = process.env;

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `${Env.REACT_APP_API_URL}company/getCompanyWithJobsPublic`,
        headers: { 
          "Cache-Control": "no-cache",
        }
      };
      const response = await axios.request(config);
      if (response.data.success) {
        // Map API response to match component structure
        const mappedCompanies = response.data.data.map(company => ({
          _id: company._id,
          name: company.name,
          address: company.address,
          email: company.email,
          phone: company.phone,
          website: company.website,
          logo: company.logo,
          isActive: company.isActive,
          type: company.type,
          activeJobs: company.jobs || 0, // Using jobs count from API
          candidates: company.candidates || 0,
          offered: company.offered || 0
        }));
        
        setCompanies(mappedCompanies);
      } else {
        throw new Error('Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to load companies. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && company.isActive) ||
      (filterStatus === "inactive" && !company.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <WebLayout>
        <section id="services" className="services section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Companies</h2>
          </div>
          <div className="container text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading companies...</p>
          </div>
        </section>
      </WebLayout>
    );
  }

  if (error) {
    return (
      <WebLayout>
        <section id="services" className="services section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Companies</h2>
          </div>
          <div className="container text-center py-5">
            <i className="bi bi-exclamation-triangle fs-1 text-danger"></i>
            <h4 className="text-danger mt-3">Error</h4>
            <p className="text-muted">{error}</p>
            <button className="btn btn-primary" onClick={fetchCompanies}>
              Try Again
            </button>
          </div>
        </section>
      </WebLayout>
    );
  }

  return (
    <WebLayout>
      <section id="services" className="services section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Companies</h2>
          <p>
            Companies are organizations that provide goods or services to customers. They play a key role in the economy by creating jobs and driving innovation.
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-4">
            {/* Search and Filter */}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <select
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Companies Grid */}
            <div className="row">
              {filteredCompanies.map((company) => (
                <div key={company._id} className="col-xl-4 col-md-6 mb-4">
                  <div className="card shadow-sm border-1 h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-start mb-3">
                        <div className="flex-shrink-0">
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "60px", height: "60px" }}
                          >
                            {company.logo && company.logo.startsWith('data:image') ? (
                              <img
                                src={company.logo}
                                alt={`${company.name} logo`}
                                className=" img-fluid"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                            ) : (
                              <i className="bi bi-building fs-4 text-muted"></i>
                            )}
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-3">
                          <h5 className="card-title mb-1">{company.name}</h5>
                          <p className="text-muted small mb-1">
                            <i className="bi bi-building me-1"></i>
                            {company.type}
                          </p>
                          <span
                            className={`badge ${
                              company.isActive ? "bg-success" : "bg-danger"
                            } small`}
                          >
                            {company.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-muted small mb-2">
                          <i className="bi bi-geo-alt me-1"></i>
                          {company.address}
                        </p>
                        <p className="text-muted small mb-2">
                          <i className="bi bi-envelope me-1"></i>
                          {company.email}
                        </p>
                        <p className="text-muted small mb-0">
                          <i className="bi bi-phone me-1"></i>
                          {company.phone}
                        </p>
                        {company.website && (
                          <p className="text-muted small mb-0">
                            <i className="bi bi-globe me-1"></i>
                            {company.website}
                          </p>
                        )}
                      </div>

                      <div className="row text-center mb-3">
                        <div className="col-4">
                          <div className="border-end">
                            <h6 className="text-primary mb-0">
                              {company.offered}
                            </h6>
                            <small className="text-muted">Offered</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="border-end">
                            <h6 className="text-success mb-0">
                              {company.activeJobs}
                            </h6>
                            <small className="text-muted">Jobs</small>
                          </div>
                        </div>
                        <div className="col-4">
                          <h6 className="text-info mb-0">{company.candidates}</h6>
                          <small className="text-muted">Candidates</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredCompanies.length === 0 && (
              <div className="text-center py-5">
                <i className="bi bi-building fs-1 text-muted"></i>
                <h4 className="text-muted mt-3">No companies found</h4>
                <p className="text-muted">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </WebLayout>
  );
}