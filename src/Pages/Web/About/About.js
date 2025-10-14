import React from "react";
import WebLayout from "../../../components/WebLayout";
import { Link } from "react-router-dom";

export default function About() {
  return (
    <WebLayout>
      <section id="about" className="about section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>About Us</h2>
          <p>Welcome to TalentOS — a powerful and easy-to-use</p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-5">
            <div
              className="content col-xl-5 d-flex flex-column"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <h3>Empowering Smarter Hiring with TalentOS</h3>
              <p>
                Our mission is to simplify the hiring process for companies of
                all sizes by providing a modern, all-in-one platform to manage
                job postings, track applicants, schedule interviews, and build
                strong teams.
              </p>
            </div>
            <div className="col-xl-7" data-aos="fade-up" data-aos-delay={200}>
              <div className="row gy-4">
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-briefcase" />
                  <h4>
                    <Link className="stretched-link">
                      Job posting
                    </Link>
                  </h4>
                  <p>
                    Easily create and manage job openings in just a few clicks.
                    Reach the right talent faster and grow your team
                    effortlessly.
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-gem" />
                  <h4>
                    <Link className="stretched-link">
                      Interview scheduling
                    </Link>
                  </h4>
                  <p>
                    Schedule interviews effortlessly and keep your hiring
                    process on track. Save time, avoid conflicts, and create a
                    smooth experience for everyone.
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-broadcast" />
                  <h4>
                    <Link className="stretched-link">
                      Application tracking
                    </Link>
                  </h4>
                  <p>
                    Track every application from start to hire with ease. Stay
                    organized, never miss a candidate, and make smarter hiring
                    decisions.
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-easel" />
                  <h4>
                    <Link className="stretched-link">
                      Customizable Hiring
                    </Link>
                  </h4>
                  <p>
                    Build a hiring process that fits your team’s unique needs.
                    Customize every step to make recruiting faster and smarter.
                  </p>
                </div>
                {/* Icon-Box */}
              </div>
            </div>
          </div>
        </div>
      </section>
    </WebLayout>
  );
}
