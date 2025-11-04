import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import ContentHeader from "../../../components/ContentHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DataTable from "react-data-table-component";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const apiUrl = process.env.REACT_APP_API_URL;

const ChartSkeleton = ({ type }) => {
  return (
    <div className="card-body">
      <div className="card-header border-0 mb-3">
        <h3 className="card-title">
          <Skeleton
            width={type === "bar" ? 150 : type === "doughnut" ? 180 : 160}
          />
        </h3>
      </div>

      <div
        style={{
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {type === "bar" ? (
          <div style={{ width: "90%", height: "100%" }}>
            <div className="mb-3">
              <Skeleton width="40%" height={16} />
            </div>
            <Skeleton height="85%" />
          </div>
        ) : type === "doughnut" ? (
          <div className="d-flex justify-content-center align-items-center w-100">
            <div
              style={{ width: "200px", height: "200px", marginRight: "30px" }}
            >
              <Skeleton circle height="100%" />
            </div>
            <div className="d-flex flex-column justify-content-center">
              <Skeleton count={4} width={120} style={{ marginBottom: "8px" }} />
            </div>
          </div>
        ) : (
          <div style={{ width: "90%", height: "100%" }}>
            <div className="mb-3">
              <Skeleton width="40%" height={16} />
            </div>
            <Skeleton height="85%" />
          </div>
        )}
      </div>
    </div>
  );
};

const StatsCardSkeleton = () => {
  return (
    <div className="col-lg-3 col-md-6 col-sm-12 mb-4">
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Skeleton width={120} height={20} />
              <Skeleton width={80} height={30} className="mt-2" />
            </div>
            <Skeleton circle width={50} height={50} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddCompanys() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullReportLoading, setFullReportLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [statsData, setStatsData] = useState(null);

  const fetchChartData = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${apiUrl}reports/getChartData`,
        headers: {
          authorization: ` ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      };
      const response = await axios.request(config);
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      toast.error("Failed to fetch chart data.");
    }
  };

  const fetchFullReport = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${apiUrl}reports/getFullReport`,
        headers: {
          authorization: ` ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      };
      const response = await axios.request(config);
      setRecords([response.data]);
      setFullReportLoading(false);
    } catch (error) {
      console.error("Error fetching full report:", error);
      toast.error("Failed to fetch full report data.");
      setFullReportLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      const config = {
        method: "get",
        maxBodyLength: Infinity,
        url: `${apiUrl}reports/getStats`,
        headers: {
          authorization: ` ${localStorage.getItem("token")}`,
          "Cache-Control": "no-cache",
        },
      };
      const response = await axios.request(config);
      setStatsData(response.data);
    } catch (error) {
      console.error("Error fetching stats data:", error);
      toast.error("Failed to fetch statistics data.");
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([fetchChartData(), fetchFullReport(), fetchStatsData()]);
      setLoading(false);
    };
    fetchAllData();
  }, []);

  const barChartData = chartData
    ? {
        labels: chartData.dates,
        datasets: [
          {
            label: "New Users",
            data: chartData.newUsersLast7Days,
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "New Jobs",
            data: chartData.newJobsLast7Days,
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const doughnutChartData = chartData
    ? {
        labels: chartData.scheduleStatusData.map((item) =>
          item._id.toUpperCase()
        ),
        datasets: [
          {
            label: "Schedule Count",
            data: chartData.scheduleStatusData.map((item) => item.count),
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
              "rgba(199, 199, 199, 0.7)",
            ],
            borderColor: "#fff",
            borderWidth: 1,
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "New Users and Jobs Created (Last 7 Days)",
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Schedule Status Distribution",
      },
    },
  };

  // Define columns for the DataTable
  const columns = [
    {
      name: "Total Users",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.totalUsers),
      center: true,
    },
    {
      name: "Total Candidates",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.totalCandidates),
      center: true,
    },
    {
      name: "Total Companies",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.totalCompanies),
      center: true,
    },
    {
      name: "Total Jobs",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.totalJobs),
      center: true,
    },
    {
      name: "Total Schedules",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.totalSchedules),
      center: true,
    },
    {
      name: "Pending",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.pending),
      center: true,
    },
    {
      name: "Completed",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.completed),
      center: true,
    },
    {
      name: "Offered",
      selector: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.offered),
      center: true,
    },
  ];

  const skeletonData = Array(1)
    .fill({})
    .map((_, index) => ({
      _id: index,
      isSkeleton: true,
    }));

  if (loading) {
    return (
      <Layout ac6="active">
        <ContentHeader
          title="Reports "
          breadcrumbs={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Reports" },
          ]}
        />
        {/* Data Table Skeleton */}
        <section className="content mb-1">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12 col-md-12">
                <div className="card card-primary card-outline">
                  <div className="card-header">
                    <Skeleton width={200} height={25} />
                  </div>
                  <div className="card-body text-center p-2">
                    <DataTable
                      columns={columns}
                      data={skeletonData}
                      className="custom-table"
                      noHeader
                      highlightOnHover
                      striped
                      customStyles={{
                        headCells: { style: { justifyContent: "center" } },
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts Skeleton */}
        <section className="content mb-1">
          <SkeletonTheme baseColor="#f3f3f3" highlightColor="#ecebeb">
            <div className="row">
              <div className="col-lg-7 col-md-12 mb-4">
                <div className="card">
                  <ChartSkeleton type="bar" />
                </div>
              </div>

              <div className="col-lg-5 col-md-12 mb-4">
                <div className="card">
                  <ChartSkeleton type="doughnut" />
                </div>
              </div>
            </div>
          </SkeletonTheme>
        </section>
        <ToastContainer style={{ width: "auto" }} />
      </Layout>
    );
  }

  return (
    <Layout ac6="active">
      <ContentHeader
        title="Reports Dashboard"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Reports" },
        ]}
      />
      
     

      {/* Data Table Section */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-12">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <h3 className="card-title font-weight-bold">
                    <i className="fas fa-table mr-2"></i>
                    Detailed Report Summary
                  </h3>
                </div>
                <div className="card-body text-center p-2">
                  {fullReportLoading ? (
                    <DataTable
                      columns={columns}
                      data={skeletonData}
                      className="custom-table"
                      noHeader
                      highlightOnHover
                      striped
                      customStyles={{
                        headCells: { style: { justifyContent: "center" } },
                      }}
                    />
                  ) : (
                    <DataTable
                      columns={columns}
                      data={records}
                      pagination={false}
                      className="custom-table"
                      noDataComponent="No data available"
                      highlightOnHover
                      striped
                      customStyles={{
                        headCells: { 
                          style: { 
                            justifyContent: "center",
                            backgroundColor: "#f8f9fa",
                            fontWeight: "bold"
                          } 
                        },
                        cells: {
                          style: {
                            justifyContent: "center"
                          }
                        }
                      }}
                      pointerOnHover
                      responsive
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="content">
        <div className="row">
          <div className="col-lg-7 col-md-12 mb-4">
            <div className="card">
              <div className="card-header border-0 bg-light">
                <h3 className="card-title font-weight-bold text-dark">
                  <i className="fas fa-chart-bar mr-2 text-primary"></i>
                  Weekly Platform Activity
                </h3>
              </div>
              <div className="card-body">
                <div style={{ height: "400px" }}>
                  {barChartData ? (
                    <Bar data={barChartData} options={barOptions} />
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                      <p>No chart data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5 col-md-12 mb-4">
            <div className="card">
              <div className="card-header border-0 bg-light">
                <h3 className="card-title font-weight-bold text-dark">
                  <i className="fas fa-chart-pie mr-2 text-success"></i>
                  Schedule Status Distribution
                </h3>
              </div>
              <div className="card-body">
                <div style={{ height: "400px" }}>
                  {doughnutChartData ? (
                    <Doughnut
                      data={doughnutChartData}
                      options={doughnutOptions}
                    />
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                      <p>No chart data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer style={{ width: "auto" }} />
    </Layout>
  );
}