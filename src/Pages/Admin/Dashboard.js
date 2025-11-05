import React, { useEffect, useState } from "react";
import { UserCheck, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import ContentHeader from "../../components/ContentHeader";
import CountUp from "react-countup";
import axios from "axios";
import DataTable from "react-data-table-component";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar} from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [count, setCount] = useState({
    country: 0,
    states: 0,
    city: 0,
    users: 0,
    job: 0,
    resume: 0,
    company: 0,
  });
  const [chartData, setChartData] = useState({
    daily: { dates: [], newUsers: [], newJobs: [] },
    monthly: { dates: [], newUsers: [], newJobs: [] },
    yearly: { months: [], newUsers: [], newJobs: [] },
    scheduleStatusData: [],
  });
  const [chartLoading, setChartLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const Env = process.env;

  useEffect(() => {
    if (!localStorage.getItem("alertShown")) {
      // Replace toast with alert
     toast.success("Login successfully");
      localStorage.setItem("alertShown", "true");
    }
    fetchRecords();
    fetchCount();
    fetchChartData();
    // eslint-disable-next-line
  }, []);

  const fetchCount = async () => {
    try {
      const response = await axios.get(`${apiUrl}reports/getCount`, {
        headers: {
          Authorization: token,
          "Cache-Control": "no-cache",
        },
      });
      const data = response.data;
      setCount({
        country: data.totalCountries || 0,
        states: data.totalStates || 0,
        city: data.totalCities || 0,
        users: data.totalUsers || 0,
        job: data.totalJobs || 0,
        company: data.totalCompanies || 0,
      });
    } catch (error) {
      // Replace toast with alert
      alert(error.response?.data?.message || "Error fetching count");
    }
  };

  const fetchChartData = async () => {
    setChartLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}reports/getChartDataForSuperAdminDashboard`,
        {
          headers: {
            Authorization: token,
            "Cache-Control": "no-cache",
          },
        }
      );
      setChartData(response.data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      alert("Failed to load chart data");
    } finally {
      setChartLoading(false);
    }
  };

  // Prepare bar chart data based on selected period
  const prepareBarChartData = () => {
    let labels = [];
    let userData = [];
    let jobData = [];

    if (selectedPeriod === "daily") {
      labels = chartData.daily.dates.map((date) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      );
      userData = chartData.daily.newUsers;
      jobData = chartData.daily.newJobs;
    } else if (selectedPeriod === "monthly") {
      // Show only every 5th date for better readability
      labels = chartData.monthly.dates
        .filter((date, index) => index % 5 === 0)
        .map((date) =>
          new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        );
      userData = chartData.monthly.newUsers.filter(
        (_, index) => index % 5 === 0
      );
      jobData = chartData.monthly.newJobs.filter((_, index) => index % 5 === 0);
    } else {
      labels = chartData.yearly.months.map((month) =>
        new Date(month + "-01").toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        })
      );
      userData = chartData.yearly.newUsers;
      jobData = chartData.yearly.newJobs;
    }

    return {
      labels,
      datasets: [
        {
          label: "New Users",
          data: userData,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: "New Jobs",
          data: jobData,
          backgroundColor: "rgba(75, 192, 192, 0.8)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  };

  // Prepare doughnut chart data for schedule status
  const prepareDoughnutChartData = () => {
    const statusData = chartData.scheduleStatusData;

    const colors = {
      pending: "#ffc107",
      offered: "#28a745",
      rejected: "#dc3545",
      accepted: "#17a2b8",
      completed: "#6f42c1",
      cancelled: "#6c757d",
    };

    return {
      labels: statusData.map(
        (item) => item._id.charAt(0).toUpperCase() + item._id.slice(1)
      ),
      datasets: [
        {
          data: statusData.map((item) => item.count),
          backgroundColor: statusData.map((item) => colors[item._id] || "#999"),
          borderColor: statusData.map((item) => colors[item._id] || "#999"),
          borderWidth: 2,
        },
      ],
    };
  };

  const barChartOptions = {
    responsive: true,
    
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const links = [
    {
      to: "/admin/companys/list",
      text: "Manage Company",
      icon: <i className="fas fa-building"></i>,
      bg: "bg-secondary",
      count: count.company,
    },
    {
      to: "/admin/userlist",
      text: "Manage Users",
      icon: <i className="fas fa-users"></i>,
      bg: "bg-primary",
      count: count.users,
    },
    {
      to: "/admin/location",
      text: "Manage Locations",
      icon: <i className="fas fa-map-marker-alt"></i>,
      bg: "bg-info",
      count: count.city + count.states + count.country,
    },
    {
      to: "/admin/joblist",
      text: "Manage jobs",
      icon: <i className="fas fa-briefcase"></i>,
      bg: "bg-success",
      count: count.job,
    },
  ];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiUrl}company/getLettestFiveCompanies`,
        {
          headers: {
            Authorization: `${token}`,
            "Cache-Control": "no-cache",
          },
        }
      );
      setLoading(false);
      const data = response.data?.data || [];
      setRecords(data);
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Error fetching companies");
    }
  };

  const columns = [
    {
      name: "No",
      selector: (row, index) =>
        row.isSkeleton ? (
          <Skeleton width={60} />
        ) : (
          (currentPage - 1) * perPage + index + 1
        ),
      width: "40px",
      center: true,
    },
    {
      name: "Logo",
      width: "150px",
      center: true,
      cell: (row) =>
        row.isSkeleton ? (
          <Skeleton circle height={45} width={45} />
        ) : (
          <img
            src={row.logo || Env.REACT_APP_PROJECT_ICON}
            alt="Profile"
            height={40}
            width={"auto"}
            className="p-1"
          />
        ),
    },
    {
      name: "Name",
      cell: (row) =>
        row.isSkeleton ? <Skeleton width={120} /> : `${row.name}`,
    },
    {
      name: "Type",
      width: "80px",
      center: true,
      cell: (row) => (row.isSkeleton ? <Skeleton width={60} /> : row.type),
    },
    {
      name: "Actions",
      width: "70px",
      center: true,
      cell: (row) =>
        row.isSkeleton ? (
          <Skeleton width={50} height={30} />
        ) : (
          <div className="d-flex">
            <button
              type="button"
              className={`btn btn-xs mr-1 d-flex align-items-center justify-content-center rounded-circle ${
                row.isActive ? "btn-success" : "btn-secondary"
              }`}
              onClick={() => handleToggleStatus(row._id, row.isActive)}
              disabled={statusLoading[row._id]}
              style={{ width: "32px", height: "32px" }}
              title={row.isActive ? "Deactivate" : "Activate"}
            >
              {statusLoading[row._id] ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : row.isActive ? (
                <UserCheck size={16} />
              ) : (
                <UserX size={16} />
              )}
            </button>
          </div>
        ),
    },
  ];

  const skeletonData = Array(10)
    .fill({})
    .map((_, index) => ({
      _id: index,
      isSkeleton: true,
    }));

  const handleToggleStatus = async (id) => {
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const response = await axios.put(
        `${apiUrl}company/activate/${id}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      alert(response.data.data.message);
      fetchRecords();
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    } finally {
      setStatusLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const barChartData = prepareBarChartData();
  const doughnutChartData = prepareDoughnutChartData();

  return (
    <Layout ac1="active">
      <ContentHeader
        title="Dashboard"
        breadcrumbs={[{ label: "Admin Dashboard" }]}
      />
      <section className="content mb-1">
        <div className="container-fluid">
          <div className="row">
            {links.map(({ to, text, icon, bg, count }, idx) => (
              <div key={idx} className="col-lg-3 col-6">
                <Link to={to} className="text-dark">
                  <div className={`small-box ${bg}`}>
                    <div className="inner">
                      <h3>
                        <CountUp end={count} />
                      </h3>
                      <p>{text}</p>
                    </div>
                    <div className="icon">{icon}</div>
                    <span className="small-box-footer">
                      More info <i className="fas fa-arrow-circle-right"></i>
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="content mb-1">
        <div className="container-fluid">
          <div className="row">
            {/* Bar Chart */}
            <div className="col-12 col-lg-6">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-chart-bar"></i> &nbsp;
                      <span className="font-weight-bold">
                        Analytics Overview
                      </span>
                    </div>
                    <div className="btn-group">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          selectedPeriod === "daily"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedPeriod("daily")}
                      >
                        Last 7 Days
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          selectedPeriod === "monthly"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedPeriod("monthly")}
                      >
                        Last 30 Days
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          selectedPeriod === "yearly"
                            ? "btn-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={() => setSelectedPeriod("yearly")}
                      >
                        Last 12 Months
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-body">
                  {chartLoading ? (
                    <div className="text-center py-5">
                      <Skeleton height={100} />
                    </div>
                  ) : (
                    <Bar
                      data={barChartData}
                      options={barChartOptions}
                      height={220}
                      width={400}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card card-primary card-outline">
                <div className="card-header">
                  <div className="d-flex font-weight-bold align-items-center py-1">
                    <i className="fas fa-building"></i> &nbsp; Companies{" "}
                  </div>
                </div>
                <div className="card-body text-center p-2">
                  {loading ? (
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
                      onChangePage={(page) => setCurrentPage(page)}
                      onChangeRowsPerPage={(newPerPage) =>
                        setPerPage(newPerPage)
                      }
                      className="custom-table"
                      noDataComponent="No data available"
                      highlightOnHover
                      striped
                      customStyles={{
                        headCells: { style: { justifyContent: "center" } },
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

      <section className="content">
        <div className="container-fluid">
          <div className="row"></div>
        </div>
      </section>
      <ToastContainer style={{ width: "auto" }} />
    </Layout>
  );
}
