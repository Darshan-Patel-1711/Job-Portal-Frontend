import React from "react";
import WebLayout from "../../../components/WebLayout";

export default function About() {
  return (
    <WebLayout>
      <section id="about" className="about section">
        {/* Section Title */}
        <div className="container section-title" data-aos="fade-up">
          <h2>About Us</h2>
          <p>
            Welcome to TalentOS — a powerful and easy-to-use
          </p>
        </div>
        {/* End Section Title */}
        <div className="container">
          <div className="row gy-5">
            <div
              className="content col-xl-5 d-flex flex-column"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <h3>Voluptatem dignissimos provident quasi</h3>
              <p>
                Our mission is to simplify the hiring process for companies of all sizes by providing a modern, all-in-one platform to manage job postings, track applicants, schedule interviews, and build strong teams.
              </p>
              
            </div>
            <div className="col-xl-7" data-aos="fade-up" data-aos-delay={200}>
              <div className="row gy-4">
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-briefcase" />
                  <h4>
                    <a href="" className="stretched-link">
                      Job posting
                    </a>
                  </h4>
                  <p>
                    Consequuntur sunt aut quasi enim aliquam quae harum pariatur
                    laboris nisi ut aliquip
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-gem" />
                  <h4>
                    <a href="" className="stretched-link">
                      Interview scheduling
                    </a>
                  </h4>
                  <p>
                    Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-broadcast" />
                  <h4>
                    <a href="" className="stretched-link">
                    Application tracking
                    </a>
                  </h4>
                  <p>
                    Aut suscipit aut cum nemo deleniti aut omnis. Doloribus ut
                    maiores omnis facere
                  </p>
                </div>
                {/* Icon-Box */}
                <div className="col-md-6 icon-box position-relative">
                  <i className="bi bi-easel" />
                  <h4>
                    <a href="" className="stretched-link">
                     Customizable Hiring
                    </a>
                  </h4>
                  <p>
                    Expedita veritatis consequuntur nihil tempore laudantium
                    vitae denat pacta
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
