import React, { useState, useEffect } from "react";
import WebLayout from "../../../components/WebLayout";
import JobModal from "../../../components/JobDetailModal";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import axios from "axios";
import TimeAgo from "../../../utils/TimeAgo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function JobBoard() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activePackage, setActivePackage] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Package types with unique styling
  const packageTypes = {
    silver: {
      name: "Silver",
      color: "secondary",
      badgeClass: "bg-secondary",
      borderClass: "border-secondary",
      icon: "bi bi-star",
    },
    gold: {
      name: "Gold",
      color: "warning",
      badgeClass: "bg-warning",
      borderClass: "border-warning",
      icon: "bi bi-star-fill",
    },
    platinum: {
      name: "Platinum",
      color: "primary",
      badgeClass: "bg-primary",
      borderClass: "border-primary",
      icon: "bi bi-gem",
    },
  };

  // Sample data with package types
  const jobCategories = [
    {
      icon: "bi bi-code-slash",
      title: "Information Technology",
      desc: "Software development and IT positions",
      count: 18,
    },
    {
      icon: "bi bi-graph-up",
      title: "Marketing",
      desc: "Digital marketing and sales roles",
      count: 15,
    },
    {
      icon: "bi bi-calculator",
      title: "Finance",
      desc: "Accounting and financial services",
      count: 12,
    },
    {
      icon: "bi bi-heart-pulse",
      title: "Healthcare",
      desc: "Medical and healthcare professionals",
      count: 20,
    },
    {
      icon: "bi bi-mortarboard",
      title: "Education",
      desc: "Teaching and academic positions",
      count: 8,
    },
  ];

  // Fetch jobs from API
  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}job/getJobPosts`, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      // Transform API data to match your component structure
      const transformedJobs = response.data.map((job) => ({
        id: job._id,
        title: job.title,
        company: job.companyName,
        location: job.location,
        type: job.type,
        salary: job.salary,
        category: job.category,
        posted: new Date(job.posted).toLocaleDateString(),
        urgent: job.urgent,
        package: job.package.toLowerCase(),
        featured: job.featured,
        highlights: job.highlights || ["Standard Listing"],
        description: job.description,
        requirements: job.requirements
          ? [
              `Working Hours: ${
                job.requirements[0]?.workingHours || "Not specified"
              }`,
              `Shift: ${job.requirements[0]?.shift || "Not specified"}`,
              `Flexible Hours: ${
                job.requirements[0]?.flexibleWorkingHours ? "Yes" : "No"
              }`,
              `Notice Period: ${
                job.requirements[0]?.noticePeriod || "Not specified"
              }`,
              `Bond Time: ${job.requirements[0]?.bondTime || "Not specified"}`,
            ]
          : ["No specific requirements listed"],
        benefits: job.benefits
          ? job.benefits.split(", ").map((benefit) => benefit.trim())
          : ["Standard benefits package"],
        applicationDeadline: job.applicationDeadline || job.posted,
        experienceLevel: job.experienceLevel,
        education: job.education,
        companyName: job.companyName,
        companyType: job.companyType,
        companyWebsite: job.companyWebsite,
        companyPhone: job.companyPhone,
        companyEmail: job.companyEmail,
        companyAddress: job.companyEddress,
        companyLogo: job.companyLogo,
        companyId:job.companyid
      }));

      setJobListings(transformedJobs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again later.");
      setLoading(false);
    }
  };

  // Combined filter function
  const filteredJobs = jobListings.filter((job) => {
    const categoryMatch =
      activeCategory === "All" || job.category === activeCategory;
    const packageMatch =
      activePackage === "All" || job.package === activePackage;
    return categoryMatch && packageMatch;
  });

  // Function to get package styling
  const getPackageStyle = (pkg) => {
    return packageTypes[pkg] || packageTypes.silver;
  };

  // Toggle function for package filter
  const togglePackageFilter = (pkgType) => {
    if (activePackage === pkgType) {
      setActivePackage("All");
    } else {
      setActivePackage(pkgType);
    }
  };

  // Handle Apply Now button click
  const handleApplyNow = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  if (loading) {
    return (
      <WebLayout>
        <section className="featured-jobs section bg-light">
          <div className="container">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading jobs...</p>
            </div>
          </div>
        </section>
      </WebLayout>
    );
  }

  if (error) {
    return (
      <WebLayout>
        <section className="featured-jobs section bg-light">
          <div className="container">
            <div className="text-center py-5">
              <i className="bi bi-exclamation-triangle display-1 text-danger"></i>
              <h4 className="mt-3">Error Loading Jobs</h4>
              <p className="text-muted">{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      </WebLayout>
    );
  }

  

  return (
    <WebLayout>
      {/* Job Detail Modal */}

      {/* Featured Jobs */}
      <section className="featured-jobs section bg-light">
        <div className="container">
          <div className="section-title pb-3" data-aos="fade-up">
            <div className="justify-content-between section-title text-center p-0">
              <div className="mb-4">
                <h2>Job Board</h2>
                <p>Latest opportunities from top employers</p>
              </div>

              {/* Package Cards - Toggle Functionality */}
              <div className="container">
                <div className="row text-center">
                  <div className="col-md-4 mb-3">
                    <div
                      className={`package-card card h-100 ${
                        activePackage === "silver"
                          ? "border-secondary border-3 shadow"
                          : "border-secondary"
                      }`}
                      onClick={() => togglePackageFilter("silver")}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <div className="card-body">
                        <i className="bi bi-star fs-1 text-secondary"></i>
                        <h5 className="card-title mt-2">Silver Package</h5>
                        <p className="card-text text-muted">
                          Standard job listing with basic visibility
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div
                      className={`package-card card h-100 ${
                        activePackage === "gold"
                          ? "border-warning border-3 shadow"
                          : "border-warning"
                      }`}
                      onClick={() => togglePackageFilter("gold")}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <div className="card-body">
                        <i className="bi bi-star-fill fs-1 text-warning"></i>
                        <h5 className="card-title mt-2">Gold Package</h5>
                        <p className="card-text text-muted">
                          Featured listing with highlighted placement
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div
                      className={`package-card card h-100 ${
                        activePackage === "platinum"
                          ? "border-primary border-3 shadow"
                          : "border-primary"
                      }`}
                      onClick={() => togglePackageFilter("platinum")}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <div className="card-body">
                        <i className="bi bi-gem fs-1 text-primary"></i>
                        <h5 className="card-title mt-2">Platinum Package</h5>
                        <p className="card-text text-muted">
                          Premium visibility with urgent priority
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filters */}
              <div className="category-filters mt-4 mb-4">
                <button
                  className={`btn ${
                    activeCategory === "All"
                      ? "btn-primary"
                      : "btn-outline-primary"
                  } me-2 mb-2`}
                  onClick={() => setActiveCategory("All")}
                >
                  All Jobs
                </button>
                {jobCategories.map((category) => (
                  <button
                    key={category.title}
                    className={`btn ${
                      activeCategory === category.title
                        ? "btn-primary"
                        : "btn-outline-primary"
                    } me-2 mb-2`}
                    onClick={() => {
                      if (activeCategory === category.title) {
                        setActiveCategory("All");
                      } else {
                        setActiveCategory(category.title);
                      }
                    }}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="row">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, index) => {
                const pkg = getPackageStyle(job.package);
                return (
                  <div
                    className="col-lg-6 mb-4"
                    key={job.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <div
                      className={`job-card card h-100 shadow-sm border-3 ${
                        pkg.borderClass
                      } ${job.featured ? "featured-job" : ""}`}
                    >
                      <div className="card-body position-relative">
                        {/* Package Badge */}
                        <div
                          className={`package-badge ${pkg.badgeClass} text-white px-3 py-1 rounded-pill position-absolute top-0 start-50 translate-middle`}
                        >
                          <i className={`${pkg.icon} me-1`}></i>
                          {pkg.name} Package
                        </div>

                        <div className="d-flex justify-content-between align-items-start mb-3 mt-3">
                          <div>
                            <h5 className="card-title mb-1">
                              {job.title}
                              {job.urgent && (
                                <span className="badge bg-danger ms-2">
                                  Urgent
                                </span>
                              )}
                              {job.featured && (
                                <span className="badge bg-success ms-2">
                                  Featured
                                </span>
                              )}
                            </h5>
                            <p className="card-text text-muted mb-1">
                              <img
                                src={job.companyLogo}
                                alt=""
                                className="testimonial-img"
                                style={{ width: "20px", height: "auto" }}
                              />{" "}
                              {job.company}
                            </p>
                            <p className="card-text text-muted small">
                              <i className="bi bi-geo-alt me-1"></i>
                              {job.location} • {job.type}
                            </p>
                          </div>
                          <div className="text-end">
                            <div className="salary-badge bg-success text-white px-2 py-1 rounded mb-2">
                              ₹ {job.salary}
                            </div>
                            <small className="text-muted"> <TimeAgo postedDate={job.posted} />
                            </small>
                          </div>
                        </div>

                        {/* Package Highlights */}
                        <div className="package-highlights mb-3">
                          <div className="d-flex flex-wrap gap-1">
                            {job.highlights.map((highlight, idx) => (
                              <span
                                key={idx}
                                className={`badge bg-light text-${pkg.color} border border-${pkg.color}`}
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="job-meta d-flex justify-content-between align-items-center">
                          <span className="badge bg-light text-dark">
                            {job.category}
                          </span>
                          <div>
                            <button
                              className={`btn btn-${pkg.color} btn-sm`}
                              onClick={() => handleApplyNow(job)}
                            >
                              Apply Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <h4 className="mt-3">No jobs found</h4>
                <p className="text-muted">
                  No jobs match your current filters. Try adjusting your
                  criteria.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setActiveCategory("All");
                    setActivePackage("All");
                    fetchJobs();
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <JobModal
        job={selectedJob}
        show={showModal}
        onClose={() => setShowModal(false)}
        packageTypes={packageTypes}
      />
       <ToastContainer  style={{ width: "auto" }} />

    </WebLayout>
  );
}
