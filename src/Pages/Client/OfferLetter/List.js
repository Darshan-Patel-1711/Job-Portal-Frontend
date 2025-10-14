import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../../components/UserLayout";
import ContentHeader from "../../../components/ContentHeader";
import { Shield, Star, Crown, Gem } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function OfferLetterList() {
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchJobPosts();
    // eslint-disable-next-line
  }, []);

  const fetchJobPosts = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${apiUrl}job/getPosts`,
        headers: {
          authorization: token,
          "Cache-Control": "no-cache",
        },
      };

      const response = await axios.request(config);
      setJobPosts(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching job posts:", error);
      setLoading(false);
    }
  };

  const handleFolderClick = (job) => {
    navigate(`/admin/offerletter?jobId=${job._id}`, { state: { job } });
  };

  const packageConfig = {
    Admin: {icon: <Shield size={18} />,},
    Silver: {icon: <Star size={18} />, },
    Gold: {icon: <Crown size={18} />,},
    Platinum: {icon: <Gem size={18} />,},
  };

  return (
    <UserLayout ac5="active">
      <ContentHeader
        title="Offer Letter List"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/userdashboard" },
          { label: "Offer Letter List" },
        ]}
      />

      <section className="content">
        {loading ? (
          // 🔹 Skeleton Loader Section
          <div className="d-flex flex-wrap gap-3">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="folder p-3 text-center">
                <Skeleton circle width={30} height={30} className="" />
                <Skeleton width={80} height={20} className="mt-2" />
              </div>
            ))}
          </div>
        ) : jobPosts.length === 0 ? (
          <div className="no-jobs text-center">No job posts found</div>
        ) : (
          // 🔹 Actual Data Section
          <div className="d-flex flex-wrap">
            {jobPosts.map((job) => (
              <div
                key={job._id}
                className="folder"
                onClick={() => handleFolderClick(job)}
                style={{cursor: "pointer"}}
              >
                <span className="folder-icon d-flex align-items-center justify-content-center">
                  {packageConfig[job.package]?.icon}
                </span>
                <p className="folder-text fw-bold mb-0">{job.title}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </UserLayout>
  );
}