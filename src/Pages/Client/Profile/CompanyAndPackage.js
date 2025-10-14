import React, { useState, useEffect } from "react";
import axios from "axios";
import UserLayout from "../../../components/UserLayout";
import ContentHeader from "../../../components/ContentHeader";
import { MdEmail } from "react-icons/md";
import { MdAddCall } from "react-icons/md";
import { FaEarthEurope } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { TbTax } from "react-icons/tb";
import { FaRegAddressCard } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";


export default function CompanyAndPackage() {
  const [companyData, setCompanyData] = useState({});
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");
  const Env = process.env;

  useEffect(() => {
    fetchCompanyData();
    // eslint-disable-next-line
  }, []);

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`${apiUrl}company/getCompanyByUser`, {
        headers: {
          Authorization: token,
          "Cache-Control": "no-cache",
          // (for older browsers / proxies)
        },
      });
      setCompanyData(response.data.data);
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  };
  return (
    <UserLayout ac8="active">
      <ContentHeader
        title="Company & Package"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/userdashboard" },
          { label: "Company & Package" },
        ]}
      />

      <section className="content">
        <div className="container-fluid py-4">
        {/* Header Section */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" 
                         style={{width: '100px', height: '100px'}}>
                      {companyData.logo ? (
                        <img 
                          src={companyData.logo || Env.REACT_APP_PROJECT_ICON} 
                          alt={`${companyData.name} logo`}
                          className=" img-fluid"
                          style={{width: '90px', height: '90px', objectFit: 'cover'}}
                        />
                      ) : (
                        <i className="bi bi-building fs-1 text-muted"></i>
                      )}
                    </div>
                  </div>
                  <div className="col">
                    <div className="d-flex align-items-center mb-2">
                      <h1 className="h2 mb-0 me-3">{companyData.name}</h1>
                      <span className={`badge ${companyData.isActive ? 'bg-success' : 'bg-danger'} fs-6`}>
                        {companyData.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-muted mb-2">
                      <i className="bi bi-building me-2"></i>
                     {companyData.name} {companyData.type}
                    </p>
                    <p className="text-muted mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      {companyData.address}
                    </p>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Left Column - Company Information */}
          <div className="col-lg-8">
            {/* Contact Information Card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="card-title mb-0">
                  <i className="bi bi-telephone me-2 text-primary"></i>
                  Contact Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-4" 
                           style={{width: '40px', height: '40px'}}>
                        
                        <MdEmail size={25} />
                      </div>
                      <div>
                        <small className="text-muted">Email</small>
                        <div className="fw-semibold">{companyData.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{width: '40px', height: '40px'}}>
                        <MdAddCall  size={25}/>
                      </div>
                      <div>
                        <small className="text-muted">Phone</small>
                        <div className="fw-semibold">{companyData.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-info rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{width: '40px', height: '40px'}}>
                        <FaEarthEurope size={25} />
                      </div>
                      <div>
                        <small className="text-muted">Website</small>
                        <div className="fw-semibold">
                          <a href={`https://${companyData.website}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                            {companyData.website}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center p-3 bg-light rounded">
                      <div className="bg-warning rounded-circle d-flex align-items-center justify-content-center me-3" 
                           style={{width: '40px', height: '40px'}}>
                        <FaLocationDot size={25} />
                      </div>
                      <div>
                        <small className="text-muted">Address</small>
                        <div className="fw-semibold">{companyData.address}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Documents Card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="card-title mb-0">
                  <i className="bi bi-file-text me-2 text-success"></i>
                  Legal Documents
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{width: '60px', height: '60px'}}>
                        <TbTax size={30} />
                      </div>
                      <h6 className="fw-semibold mb-1">GST Number</h6>
                      <p className="text-muted mb-0 font-monospace">{companyData.GSTNumber}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{width: '60px', height: '60px'}}>
                        <FaRegAddressCard size={30}/>
                      </div>
                      <h6 className="fw-semibold mb-1">PAN Number</h6>
                      <p className="text-muted mb-0 font-monospace">{companyData.PANNumber}</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border rounded p-3 text-center h-100">
                      <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                           style={{width: '60px', height: '60px'}}>
                       <FaUserTie size={30}/>
                      </div>
                      <h6 className="fw-semibold mb-1">CIN Number</h6>
                      <p className="text-muted mb-0 font-monospace">{companyData.CINNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Status & Actions */}
          <div className="col-lg-4">
            {/* Company Status Card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="card-title mb-0">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  Company Status
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Status</span>
                  <span className={`badge ${companyData.isActive ? 'bg-success' : 'bg-danger'} fs-6`}>
                    {companyData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Activation</span>
                  <span className={`badge ${companyData.isActivatedOnce ? 'bg-success' : 'bg-warning'} fs-6`}>
                    {companyData.isActivatedOnce ? 'Activated' : 'Not Activated'}
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Company Type</span>
                  <span className="fw-semibold">{companyData.type}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Created</span>
                  <small className="fw-semibold">
                    {new Date(companyData.createdAt).toLocaleDateString()}
                  </small>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Last Updated</span>
                  <small className="fw-semibold">
                    {new Date(companyData.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>

           

            {/* Statistics Card */}
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-header bg-white py-3 border-bottom">
                <h5 className="card-title mb-0">
                  <i className="bi bi-graph-up me-2 text-primary"></i>
                  Quick Stats
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-primary mb-1">{companyData.offered ||0}</h4>
                      <small className="text-muted">offer</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border-end">
                      <h4 className="text-success mb-1">{companyData.jobs ||0}</h4>
                      <small className="text-muted">Active Jobs</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div>
                      <h4 className="text-info mb-1"> {companyData.candidates || 0}</h4>
                      <small className="text-muted">Applications</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>
      
    </UserLayout>
  );
}
