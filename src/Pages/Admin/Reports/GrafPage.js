import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import ContentHeader from "../../../components/ContentHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,LineElement,PointElement,} from 'chart.js';
ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,ArcElement,LineElement,PointElement);
const apiUrl = process.env.REACT_APP_API_URL;

const ChartSkeleton = ({ type }) => {
    return (
        <div className="card-body">
            <div className="card-header border-0 mb-3">
                 <h3 className="card-title">
                    <Skeleton width={type === 'bar' ? 150 : type === 'doughnut' ? 180 : 160} />
                </h3>
            </div>
            
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {type === 'bar' ? (
                    <div style={{ width: '90%', height: '100%' }}>
                        <div className="mb-3"><Skeleton width="40%" height={16} /></div> 
                        <Skeleton height="85%" />
                    </div>
                ) : type === 'doughnut' ? (
                    <div className="d-flex justify-content-center align-items-center w-100">
                        <div style={{ width: '200px', height: '200px', marginRight: '30px' }}>
                            <Skeleton circle height="100%" /> 
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                            <Skeleton count={4} width={120} style={{ marginBottom: '8px' }}/>
                        </div>
                    </div>
                ) : (
                    <div style={{ width: '90%', height: '100%' }}>
                        <div className="mb-3"><Skeleton width="40%" height={16} /></div> 
                        <Skeleton height="85%" />
                    </div>
                )}
            </div>
        </div>
    );
};

const TableSkeleton = () => {
    return (
        <div className="card">
            <div className="card-header border-0">
                <h3 className="card-title">
                    <Skeleton width={200} />
                </h3>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead>
                            <tr>
                                <th><Skeleton /></th>
                                <th><Skeleton /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(item => (
                                <tr key={item}>
                                    <td><Skeleton /></td>
                                    <td><Skeleton /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default function AddCompanys() {
    const [chartData, setChartData] = useState(null);
    const [fullReportData, setFullReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fullReportLoading, setFullReportLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');

    const fetchChartData = async () => {
        try {
            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${apiUrl}reports/getChartData`,
                headers: {
                    'authorization': ` ${localStorage.getItem('token')}`,
                    "Cache-Control": "no-cache",
                }
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
                method: 'get',
                maxBodyLength: Infinity,
                url: `${apiUrl}reports/getFullReport`,
                headers: { 
                    'authorization': ` ${localStorage.getItem('token')}`,
                    "Cache-Control": "no-cache",
                }
            };
            const response = await axios.request(config);
            setFullReportData(response.data);
            setFullReportLoading(false);
        } catch (error) {
            console.error("Error fetching full report:", error);
            toast.error("Failed to fetch full report data.");
            setFullReportLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchChartData(), fetchFullReport()]);
            setLoading(false);
        };
        fetchAllData();
    }, []);

    // Report Data Structure
    const reportSections = [
        {
            id: 'executive',
            title: 'Executive Summary',
            icon: 'fas fa-chart-line',
            type: 'summary',
            data: [
                { 
                    label: 'Total Platform Activity', 
                    value: fullReportData ? (fullReportData.totalUsers + fullReportData.totalJobs + fullReportData.totalSchedules) : 0,
                    description: 'Combined platform engagement metrics',
                    trend: 'up',
                    change: '+12%'
                },
                { 
                    label: 'User Growth Rate', 
                    value: fullReportData?.totalUsers || 0,
                    description: 'New user registrations this month',
                    trend: 'up',
                    change: '+8%'
                },
                { 
                    label: 'Job Posting Velocity', 
                    value: fullReportData?.totalJobs || 0,
                    description: 'Active job listings',
                    trend: 'stable',
                    change: '+2%'
                },
                { 
                    label: 'Schedule Completion Rate', 
                    value: fullReportData ? Math.round((fullReportData.completed / fullReportData.totalSchedules) * 100) : 0,
                    suffix: '%',
                    description: 'Successful schedule completion percentage',
                    trend: 'up',
                    change: '+5%'
                }
            ]
        },
        {
            id: 'users',
            title: 'User Analytics',
            icon: 'fas fa-users',
            type: 'detailed',
            data: [
                { label: 'Total Registered Users', value: fullReportData?.totalUsers || 0, category: 'user' },
                { label: 'Candidate Profiles', value: fullReportData?.totalCandidates || 0, category: 'user' },
                { label: 'Company Accounts', value: fullReportData?.totalCompanies || 0, category: 'user' },
                { label: 'Active Teams', value: fullReportData?.totalTeams || 0, category: 'user' }
            ]
        },
        {
            id: 'engagement',
            title: 'Platform Engagement',
            icon: 'fas fa-briefcase',
            type: 'detailed',
            data: [
                { label: 'Total Job Postings', value: fullReportData?.totalJobs || 0, category: 'engagement' },
                { label: 'Interview Schedules', value: fullReportData?.totalSchedules || 0, category: 'engagement' },
                { label: 'User Feedbacks', value: fullReportData?.totalFeedbacks || 0, category: 'engagement' },
                { label: 'Inbox Messages', value: fullReportData?.totalInbox || 0, category: 'engagement' }
            ]
        },
        {
            id: 'geography',
            title: 'Geographical Coverage',
            icon: 'fas fa-globe-americas',
            type: 'detailed',
            data: [
                { label: 'Cities Covered', value: fullReportData?.totalCities || 0, category: 'location' },
                { label: 'States Represented', value: fullReportData?.totalStates || 0, category: 'location' },
                { label: 'Countries Active', value: fullReportData?.totalCountries || 0, category: 'location' }
            ]
        },
        {
            id: 'schedules',
            title: 'Schedule Performance',
            icon: 'fas fa-calendar-check',
            type: 'status',
            data: [
                { 
                    label: 'Scheduled', 
                    value: fullReportData?.scheduled || 0, 
                    status: 'scheduled',
                    percentage: fullReportData ? Math.round((fullReportData.scheduled / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Completed', 
                    value: fullReportData?.completed || 0, 
                    status: 'completed',
                    percentage: fullReportData ? Math.round((fullReportData.completed / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Pending', 
                    value: fullReportData?.pending || 0, 
                    status: 'pending',
                    percentage: fullReportData ? Math.round((fullReportData.pending / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Accepted', 
                    value: fullReportData?.accepted || 0, 
                    status: 'accepted',
                    percentage: fullReportData ? Math.round((fullReportData.accepted / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Offered', 
                    value: fullReportData?.offered || 0, 
                    status: 'offered',
                    percentage: fullReportData ? Math.round((fullReportData.offered / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Cancelled', 
                    value: fullReportData?.cancelled || 0, 
                    status: 'cancelled',
                    percentage: fullReportData ? Math.round((fullReportData.cancelled / fullReportData.totalSchedules) * 100) : 0
                },
                { 
                    label: 'Rejected', 
                    value: fullReportData?.rejected || 0, 
                    status: 'rejected',
                    percentage: fullReportData ? Math.round((fullReportData.rejected / fullReportData.totalSchedules) * 100) : 0
                }
            ]
        }
    ];

    const getStatusColor = (status) => {
        const colors = {
            scheduled: 'info',
            completed: 'success',
            pending: 'warning',
            accepted: 'primary',
            offered: 'secondary',
            cancelled: 'danger',
            rejected: 'dark'
        };
        return colors[status] || 'primary';
    };

    const getTrendIcon = (trend) => {
        return trend === 'up' ? 'fas fa-arrow-up text-success' : 
               trend === 'down' ? 'fas fa-arrow-down text-danger' : 
               'fas fa-minus text-warning';
    };

    const barChartData = chartData ? {
        labels: chartData.dates,
        datasets: [
            {
                label: 'New Users',
                data: chartData.newUsersLast7Days,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'New Jobs',
                data: chartData.newJobsLast7Days,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ],
    } : null;

    const doughnutChartData = chartData ? {
        labels: chartData.scheduleStatusData.map(item => item._id.toUpperCase()),
        datasets: [
            {
                label: 'Schedule Count',
                data: chartData.scheduleStatusData.map(item => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)', 
                    'rgba(54, 162, 235, 0.7)', 
                    'rgba(255, 206, 86, 0.7)', 
                    'rgba(75, 192, 192, 0.7)', 
                    'rgba(153, 102, 255, 0.7)', 
                    'rgba(255, 159, 64, 0.7)', 
                    'rgba(199, 199, 199, 0.7)', 
                ],
                borderColor: '#fff',
                borderWidth: 1,
            },
        ],
    } : null;

    const scheduleOverviewData = fullReportData ? {
        labels: ['Scheduled', 'Completed', 'Cancelled', 'Rejected', 'Accepted', 'Offered', 'Pending'],
        datasets: [
            {
                label: 'Schedule Status Overview',
                data: [
                    fullReportData.scheduled,
                    fullReportData.completed,
                    fullReportData.cancelled,
                    fullReportData.rejected,
                    fullReportData.accepted,
                    fullReportData.offered,
                    fullReportData.pending
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                fill: false,
                tension: 0.1
            }
        ]
    } : null;

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'New Users and Jobs Created (Last 7 Days)',
            },
        },
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Schedule Status Distribution',
            },
        },
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Schedule Status Overview',
            },
        },
    };

    if (loading) {
        return (
            <Layout ac6="active">
                <ContentHeader title="Reports Dashboard" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Reports" },]} />
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
                        <div className="row">
                            <div className="col-12">
                                <TableSkeleton />
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
                title="Comprehensive Analytics Report" 
                breadcrumbs={[
                    { label: "Dashboard", to: "/admin/dashboard" }, 
                    { label: "Detailed Report" }
                ]}
            />

            <section className="content">
                {/* Report Header */}
                

                {/* Quick Stats */}
                <div className="row mb-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="info-box bg-gradient-info">
                            <span className="info-box-icon"><i className="fas fa-users"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Total Users</span>
                                <span className="info-box-number">{fullReportData?.totalUsers || 0}</span>
                                <div className="progress">
                                    <div className="progress-bar" style={{width: '70%'}}></div>
                                </div>
                                <span className="progress-description">
                                    12% Increase in 30 Days
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="info-box bg-gradient-success">
                            <span className="info-box-icon"><i className="fas fa-briefcase"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Active Jobs</span>
                                <span className="info-box-number">{fullReportData?.totalJobs || 0}</span>
                                <div className="progress">
                                    <div className="progress-bar" style={{width: '60%'}}></div>
                                </div>
                                <span className="progress-description">
                                    8% Growth This Month
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="info-box bg-gradient-warning">
                            <span className="info-box-icon"><i className="fas fa-calendar-alt"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Total Schedules</span>
                                <span className="info-box-number">{fullReportData?.totalSchedules || 0}</span>
                                <div className="progress">
                                    <div className="progress-bar" style={{width: '80%'}}></div>
                                </div>
                                <span className="progress-description">
                                    15% More Than Last Month
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="info-box bg-gradient-danger">
                            <span className="info-box-icon"><i className="fas fa-chart-line"></i></span>
                            <div className="info-box-content">
                                <span className="info-box-text">Completion Rate</span>
                                <span className="info-box-number">
                                    {fullReportData ? Math.round((fullReportData.completed / fullReportData.totalSchedules) * 100) : 0}%
                                </span>
                                <div className="progress">
                                    <div className="progress-bar" style={{width: `${fullReportData ? Math.round((fullReportData.completed / fullReportData.totalSchedules) * 100) : 0}%`}}></div>
                                </div>
                                <span className="progress-description">
                                    Schedule Success Rate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
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
                                <div style={{ height: '400px' }}>
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
                                <div style={{ height: '400px' }}>
                                    {doughnutChartData ? (
                                        <Doughnut data={doughnutChartData} options={doughnutOptions} />
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

                {/* Detailed Report Table */}
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-header border-0 bg-dark">
                                <h3 className="card-title text-white mb-0">
                                    <i className="fas fa-file-contract mr-2"></i>
                                    Detailed Analytics Report
                                </h3>
                                <div className="card-tools">
                                    <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                                        <i className="fas fa-minus"></i>
                                    </button>
                                </div>
                            </div>
                            <div className="card-body p-0">
                                {/* Report Tabs */}
                                <div className="p-3 border-bottom bg-light">
                                    <div className="btn-group w-100" role="group">
                                        <button 
                                            type="button" 
                                            className={`btn btn-${activeTab === 'summary' ? 'primary' : 'outline-primary'} font-weight-bold`}
                                            onClick={() => setActiveTab('summary')}
                                        >
                                            <i className="fas fa-chart-line mr-2"></i>
                                            Executive Summary
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`btn btn-${activeTab === 'detailed' ? 'primary' : 'outline-primary'} font-weight-bold`}
                                            onClick={() => setActiveTab('detailed')}
                                        >
                                            <i className="fas fa-table mr-2"></i>
                                            Detailed Analysis
                                        </button>
                                        <button 
                                            type="button" 
                                            className={`btn btn-${activeTab === 'status' ? 'primary' : 'outline-primary'} font-weight-bold`}
                                            onClick={() => setActiveTab('status')}
                                        >
                                            <i className="fas fa-chart-bar mr-2"></i>
                                            Performance Metrics
                                        </button>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover mb-0 report-table">
                                        <thead className="thead-light">
                                            <tr>
                                                <th width="40%" className="py-3">
                                                    <i className="fas fa-list-alt mr-2"></i>
                                                    Metric Category
                                                </th>
                                                <th width="30%" className="text-center py-3">
                                                    <i className="fas fa-chart-bar mr-2"></i>
                                                    Current Value
                                                </th>
                                                <th width="30%" className="text-center py-3">
                                                    <i className="fas fa-trending-up mr-2"></i>
                                                    Performance & Trends
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportSections
                                                .filter(section => section.type === activeTab || activeTab === 'detailed')
                                                .map((section, sectionIndex) => (
                                                <React.Fragment key={sectionIndex}>
                                                    {/* Section Header */}
                                                    <tr className="section-header">
                                                        <td colSpan="3" className="py-2">
                                                            <h5 className="mb-0 text-dark font-weight-bold">
                                                                <i className={`${section.icon} mr-2 text-primary`}></i>
                                                                {section.title}
                                                            </h5>
                                                        </td>
                                                    </tr>
                                                    
                                                    {/* Section Data */}
                                                    {section.data.map((item, itemIndex) => (
                                                        <tr key={itemIndex} className="metric-row">
                                                            <td className="pl-4 py-3">
                                                                <div className="d-flex align-items-center">
                                                                    <div className={`metric-indicator bg-${getStatusColor(item.status || 'primary')} mr-3`}></div>
                                                                    <div>
                                                                        <strong className="text-dark d-block">{item.label}</strong>
                                                                        <small className="text-muted">
                                                                            {item.description || `Detailed metrics for ${item.label.toLowerCase()}`}
                                                                        </small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="text-center align-middle py-3">
                                                                <span className={`badge badge-${getStatusColor(item.status || 'primary')} badge-pill p-3 display-value`}>
                                                                    {item.value}{item.suffix || ''}
                                                                </span>
                                                            </td>
                                                            <td className="text-center align-middle py-3">
                                                                {item.trend ? (
                                                                    <div className="d-flex align-items-center justify-content-center">
                                                                        <i className={`${getTrendIcon(item.trend)} mr-2`}></i>
                                                                        <span className={`text-${item.trend === 'up' ? 'success' : item.trend === 'down' ? 'danger' : 'warning'} font-weight-bold`}>
                                                                            {item.change}
                                                                        </span>
                                                                        <small className="text-muted ml-2">vs last period</small>
                                                                    </div>
                                                                ) : item.percentage !== undefined ? (
                                                                    <div className="progress-wrapper">
                                                                        <div className="progress" style={{height: '8px'}}>
                                                                            <div 
                                                                                className={`progress-bar bg-${getStatusColor(item.status)}`}
                                                                                style={{width: `${item.percentage}%`}}
                                                                            ></div>
                                                                        </div>
                                                                        <small className="text-muted">{item.percentage}% of total</small>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted">No trend data</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="card-footer bg-light">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="report-meta">
                                            <small className="text-muted">
                                                <i className="fas fa-info-circle mr-1"></i>
                                                Report ID: RPT-{new Date().getFullYear()}-{Math.random().toString(36).substr(2, 9).toUpperCase()}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-6 text-right">
                                        <div className="btn-group">
                                            <button className="btn btn-outline-primary btn-sm">
                                                <i className="fas fa-file-pdf mr-1"></i>
                                                Export PDF
                                            </button>
                                            <button className="btn btn-outline-success btn-sm">
                                                <i className="fas fa-file-excel mr-1"></i>
                                                Export Excel
                                            </button>
                                            <button className="btn btn-outline-info btn-sm">
                                                <i className="fas fa-print mr-1"></i>
                                                Print
                                            </button>
                                        </div>
                                    </div>
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