import React, { useState, useEffect } from "react";
import Layout from "../../../components/Layout";
import ContentHeader from "../../../components/ContentHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

// Skeleton Loading Imports
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // 👈 Skeleton CSS

// Chart.js Imports
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

// Chart.js कंपोनेंट्स को रजिस्टर करें (यह आवश्यक है!)
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// API URL और आपका Auth Token
const API_URL = 'http://localhost:3000/api/reports/getChartData';
// ध्यान दें: यह टोकन जल्द ही एक्सपायर हो जाएगा, इसे सर्वर-साइड या सुरक्षित तरीके से मैनेज करें।
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDVkOGQ3YmNiODUzYmEzOTJmZDQ1OCIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc2MjE0ODY5NCwiZXhwIjoxNzYyMTc3NDk0fQ.79soIX8T6xYhcKLZdB57x39BeYimKVhCcFPo-dXijn4';

/**
 * Chart Skeleton Component - लोडिंग के दौरान प्लेसहोल्डर दिखाता है।
 * @param {string} type - 'bar' या 'doughnut'
 */
const ChartSkeleton = ({ type }) => {
    return (
        <div className="card-body">
            {/* Card Header Title Placeholder */}
            <div className="card-header border-0 mb-3">
                 <h3 className="card-title">
                    <Skeleton width={type === 'bar' ? 150 : 180} />
                </h3>
            </div>
            
            {/* Chart Area Placeholder */}
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {type === 'bar' ? (
                    // Bar Chart: एक बड़ा आयत और लीजेंड के लिए छोटे आयत
                    <div style={{ width: '90%', height: '100%' }}>
                        <div className="mb-3"><Skeleton width="40%" height={16} /></div> 
                        <Skeleton height="85%" />
                    </div>
                ) : (
                    // Doughnut Chart: एक वृत्त और लीजेंड के लिए टेक्स्ट
                    <div className="d-flex justify-content-center align-items-center w-100">
                        <div style={{ width: '200px', height: '200px', marginRight: '30px' }}>
                            <Skeleton circle height="100%" /> 
                        </div>
                        <div className="d-flex flex-column justify-content-center">
                            <Skeleton count={4} width={120} style={{ marginBottom: '8px' }}/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function AddCompanys() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    // API से डेटा Fetch करने का फंक्शन
    const fetchChartData = async () => {
        try {
            const config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: API_URL,
                headers: {
                    'authorization': AUTH_TOKEN
                }
            };
            const response = await axios.request(config);
            setChartData(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching chart data:", error);
            toast.error("Failed to fetch report data.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChartData();
    }, []);

    // यदि डेटा लोड हो रहा है, तो Skeleton दिखाएं
    if (loading) {
        return (
            <Layout ac6="active">
                <ContentHeader title="Reports" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Reports" },]} />
                <section className="content mb-1">
                    {/* SkeletonTheme पूरे लोडिंग क्षेत्र के लिए रंग और प्रभाव सेट करता है */}
                    <SkeletonTheme baseColor="#f3f3f3" highlightColor="#ecebeb">
                        <div className="row">
                            {/* Bar Chart Skeleton Container */}
                            <div className="col-lg-7 col-md-12 mb-4">
                                <div className="card">
                                    <ChartSkeleton type="bar" />
                                </div>
                            </div>
                            
                            {/* Doughnut Chart Skeleton Container */}
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
    
    // यदि डेटा नहीं मिला
    if (!chartData) {
        return (
            <Layout ac6="active">
                <ContentHeader title="Reports" breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Reports" },]} />
                <section className="content mb-1">
                    <p>No chart data available.</p>
                </section>
                <ToastContainer style={{ width: "auto" }} />
            </Layout>
        );
    }

    // 4. Bar Chart के लिए डेटा तैयार करना
    const barChartData = {
        labels: chartData.dates, // X-अक्ष पर तारीखें
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
    };

    // 5. Doughnut Chart के लिए डेटा तैयार करना
    const statusLabels = chartData.scheduleStatusData.map(item => item._id.toUpperCase());
    const statusCounts = chartData.scheduleStatusData.map(item => item.count);
    
    const doughnutChartData = {
        labels: statusLabels,
        datasets: [
            {
                label: 'Schedule Count',
                data: statusCounts,
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
    };

    // 6. Bar Chart के Options
    const barOptions = {
        responsive: true,
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

    // 7. Doughnut Chart के Options
    const doughnutOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Overall Schedule Status Breakdown',
            },
        },
    };

    return (
        <Layout ac6="active">
            <ContentHeader 
                title="Reports Dashboard" 
                breadcrumbs={[{ label: "Dashboard", to: "/admin/dashboard" }, { label: "Reports" },]}
            />

            <section className="content">
                {/* Bootstrap Row for Charts */}
                <div className="row">
                    {/* Bar Chart - Left Column */}
                    <div className="col-lg-7 col-md-12 mb-4">
                        <div className="card">
                            <div className="card-header border-0">
                                <h3 className="card-title">Weekly Activity</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ height: '400px' }}>
                                    <Bar data={barChartData} options={barOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doughnut Chart - Right Column */}
                    <div className="col-lg-5 col-md-12 mb-4">
                        <div className="card">
                            <div className="card-header border-0">
                                <h3 className="card-title">Schedule Statuses</h3>
                            </div>
                            <div className="card-body">
                                <div style={{ height: '400px' }}>
                                    <Doughnut data={doughnutChartData} options={doughnutOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* You can add more rows for other data/charts here */}
            </section>
            
            <ToastContainer style={{ width: "auto" }} />
        </Layout>
    );
}