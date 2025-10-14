import React, { useState, useEffect } from "react";
import WebLayout from "../../../components/WebLayout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import TimeAgo from "../../../utils/TimeAgo";

export default function FeedBack() {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testimonials ,setTestimonials] =useState([]);
  const Env = process.env;
  useEffect(() => {
    getFeedback();
    // eslint-disable-next-line
  }, []);

  const getFeedback = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${Env.REACT_APP_API_URL}feedback/getFeedback`,
        headers: {
          "Cache-Control": "no-cache",
        },
      };

      const response = await axios.request(config);
     setTestimonials(response.data)
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };
  const handleRating = (value) => {
    setRating(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!name || !email || !feedback) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    const data = JSON.stringify({
      name: name,
      email: email,
      message: feedback,
      rating: rating,
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${Env.REACT_APP_API_URL}feedback/add`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    try {
      const response = await axios.request(config);
      toast.success(
        response.data.message || "Feedback submitted successfully!"
      );

      // Reset form
      setRating(0);
      setFeedback("");
      setName("");
      setEmail("");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`bi bi-star-fill ${
          index < rating ? "text-warning" : "text-muted"
        }`}
      ></i>
    ));
  };
 


  return (
    <WebLayout>
      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="testimonials section light-background"
      >
        <div className="container section-title" data-aos="fade-up">
          <h2>Testimonials</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            navigation={{
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 40,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1200: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
            }}
            className="testimonials-swiper"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <div className="testimonial-wrap">
                  <div className="testimonial-item">
                    <img
                      src={Env.REACT_APP_PROJECT_ICON}
                      className="testimonial-img"
                      alt={testimonial.name}
                    />
                    <h3>{testimonial.name}</h3>
                    <h4><TimeAgo postedDate={testimonial.createdAt} /></h4>
                    <div className="stars">
                      {renderStars(testimonial.rating)}
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>{testimonial.message}</span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Custom Pagination */}
            <div className="swiper-pagination"></div>

            {/* Navigation Buttons */}
            <div className="swiper-button-next"></div>
            <div className="swiper-button-prev"></div>
          </Swiper>
        </div>
      </section>

      {/* Feedback Form Section */}
      <section id="contact" className="contact section">
        <div className="container section-title pb-1" data-aos="fade-up">
          <h2>Feed Back</h2>
          <p>
            Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
            consectetur velit
          </p>
        </div>

        <div
          className="container position-relative"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="col-lg-12">
            <form
              onSubmit={handleSubmit}
              className="php-email-form"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <div className="row gy-4">
                {/* Star Rating */}
                <div className="col-md-12">
                  <div className="d-flex justify-content-center mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`bi ${
                          star <= rating
                            ? "bi-star-fill text-warning"
                            : "bi-star text-muted"
                        } fs-1 mx-1`}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => handleRating(star)}
                        onMouseEnter={(e) => {
                          if (star > rating) {
                            e.target.classList.add("text-warning");
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (star > rating) {
                            e.target.classList.remove("text-warning");
                          }
                        }}
                      ></i>
                    ))}
                  </div>
                  <p className="text-center text-muted mb-4">
                    Click on stars to rate
                  </p>
                </div>

                {/* Name Input */}
                <div className="col-md-6">
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Email Input */}
                <div className="col-md-6">
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    placeholder="Your Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Feedback Textarea */}
                <div className="col-md-12">
                  <textarea
                    className="form-control"
                    name="message"
                    rows={5}
                    placeholder="Your Feedback Message"
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Submit Button */}
                <div className="col-md-12 text-center">
                  {isLoading && (
                    <div className="loading">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-lg px-5"
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Submitting...
                      </>
                    ) : (
                      "Send Feedback"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer style={{ width: "auto" }} />
    </WebLayout>
  );
}
