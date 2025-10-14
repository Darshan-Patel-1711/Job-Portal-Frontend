import React, { useState, useEffect } from "react";
import WebLayout from "../../components/WebLayout";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CountUp from "react-countup";

export default function Home() {
  const Env = process.env;
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalJobs: 0,
    locatons: 0,
    totalCandidates: 0
  });
  
  const fetchCompanies = async () => {
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: `${Env.REACT_APP_API_URL}company/getAllCompaniesPublic`,
      headers: {},
    };

    try {
      const response = await axios.request(config);
      setCompanies(response?.data?.data || []);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An error occurred while fetching companies";
      toast.error(errorMessage);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${Env.REACT_APP_API_URL}reports/getStats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      console.log("finally")
    }
  };

useEffect(() => {
    fetchCompanies();
    fetchStats();
    // eslint-disable-next-line
  }, []);

  return (
    <WebLayout>
      {/* Hero Section */}
      <section id="hero" className="hero section">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-6 order-2 order-lg-1 d-flex flex-column justify-content-center">
              <h1>
                Welcome To{" "}
                <span className="text-primary">
                  {Env.REACT_APP_PROJECT_NAME}
                </span>{" "}
                Develop Anything.
              </h1>
              <p>
                Post a job in minutes and start receiving qualified resumes as
                soon as today
              </p>
              <div className="d-flex">
                <Link to="/jobboard" className=" btn-get-started">
                  Get Started
                </Link>
                <Link
                  to="/jobboard"
                  className="glightbox btn-watch-video d-flex align-items-center"
                ></Link>
              </div>
            </div>
            <div className="col-lg-6 order-1 order-lg-2 hero-img">
              <img
                src="Web/img/hero-img.png"
                className="img-fluid animated"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
      {/* clients section */}
      <section id="clients" className="clients section light-background">
        <div className="container" data-aos="fade-up">
          {companies && companies?.length > 0 ? (
            <div className="row gy-4">
              {companies?.map((company, index) => (
                <div
                  key={index}
                  className="col-xl-2 col-md-3 col-6 client-logo"
                >
                  <a
                    href={company?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={company?.logo}
                      className="img-fluid"
                      alt={company?.name}
                    />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">
                No companies available right now.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>Features</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-4">
            {[
              {
                icon: "briefcase",
                color: "#ffbb2c",
                title: "Job Posting Management",
              },
              {
                icon: "person-lines-fill",
                color: "#5578ff",
                title: "Candidate Profile Management",
              },
              {
                icon: "clipboard-data",
                color: "#e80368",
                title: "Application Tracking System (ATS)",
              },
              {
                icon: "file-earmark-person",
                color: "#e361ff",
                title: "Resume Upload & Parsing",
              },
              {
                icon: "calendar-event",
                color: "#47aeff",
                title: "Interview Scheduling",
              },
              {
                icon: "shield-lock",
                color: "#ffa76e",
                title: "Role-Based Access Control",
              },
              {
                icon: "envelope-paper",
                color: "#11dbcf",
                title: "Automated Email Notifications",
              },
              {
                icon: "search",
                color: "#4233ff",
                title: "Search & Filter Candidates",
              },
              {
                icon: "file-earmark-text",
                color: "#b2904f",
                title: "Offer Letter Generation",
              },
              {
                icon: "bar-chart-line",
                color: "#b20969",
                title: "Analytics Dashboard",
              },
              {
                icon: "globe",
                color: "#ff5828",
                title: "Careers Page Integration",
              },
              {
                icon: "clock-history",
                color: "#29cc61",
                title: "Candidate Status History",
              },
            ].map((feature, index) => (
              <div
                className="col-lg-3 col-md-4"
                data-aos="fade-up"
                data-aos-delay={100 * (index + 1)}
                key={index}
              >
                <div className="features-item">
                  <i
                    className={`bi bi-${feature.icon}`}
                    style={{ color: feature.color }}
                  />
                  <h3>
                    <span
                      className="stretched-link"
                      style={{ pointerEvents: "none", cursor: "default" }}
                    >
                      {feature.title}
                    </span>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="stats" className="stats section light-background mb-5">
        <img src="Web/img/stats-bg.jpg" alt="" data-aos="fade-in" />
        <div
          className="container position-relative"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="row gy-4">
            <div className="col-lg-3 col-md-6">
              <div className="stats-item text-center w-100 h-100">
               <CountUp className="purecounter" end={stats.totalCompanies} />
                <p>companies</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-item text-center w-100 h-100">
                <CountUp className="purecounter" end={stats.totalJobs} />
                <p>Job</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="stats-item text-center w-100 h-100">
                <CountUp className="purecounter" end={stats.locatons} />
                <p>locatons</p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="stats-item text-center w-100 h-100">
                <CountUp className="purecounter" end={stats.totalCandidates} />
                <p>Candidate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer style={{ width: "auto" }} />
    </WebLayout>
  );
}
