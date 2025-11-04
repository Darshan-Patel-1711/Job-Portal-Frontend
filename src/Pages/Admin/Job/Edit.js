import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import Layout from "../../../components/Layout";
import ContentHeader from "../../../components/ContentHeader";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Select from "react-select";

export default function Edit() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("id");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    experience: "",
    field: "",
    country: "",
    state: "",
    city: "",
    salary: 0,
    workingHours: "",
    type: "",
    flexibleWorkingHours: true,
    shift: "",
    bondTime: "",
    bondDescription: "",
    noticePeriod: "",
    benefits: "",
  });
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    fields: [],
    countries: [],
    states: [],
    cities: [],
  });
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("token");

  // Job type options
  const jobTypeOptions = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Internship", label: "Internship" },
  ];

  // Flexible working hours options
  const flexibleWorkingHoursOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  // Fetch job data from API
  const fetchJobData = async () => {
    try {
      const response = await axios.get(`${apiUrl}job/get/${jobId}`, {
        headers: {
          Authorization: `${token}`,
          "Cache-Control": "no-cache",
        },
      });

      const jobData = response.data;

      // Update form data with fetched job data
      setFormData({
        title: jobData.title || "",
        description: jobData.description || "",
        experience: jobData.experience || "",
        field: jobData.field || "",
        country: jobData.country || "",
        state: jobData.state || "",
        city: jobData.city || "",
        salary: jobData.salary || 0,
        workingHours: jobData.workingHours || "",
        type: jobData.type || "",
        flexibleWorkingHours:
          jobData.flexibleWorkingHours !== undefined
            ? jobData.flexibleWorkingHours
            : true,
        shift: jobData.shift || "",
        bondTime: jobData.bondTime || "",
        bondDescription: jobData.bondDescription || "",
        noticePeriod: jobData.noticePeriod || "",
        benefits: jobData.benefits || "",
      });

      // Set selected country and state IDs for filtering
      if (jobData.country) {
        setSelectedCountryId(jobData.country);
      }
      if (jobData.state) {
        setSelectedStateId(jobData.state);
      }
    } catch (error) {
      console.error("Error fetching job data:", error);
      toast.error(error.response?.data?.message);
    }
  };

  // Fetch countries from API
  const fetchCountries = async () => {
    try {
      const response = await axios.get(`${apiUrl}country/get`, {
        headers: {
          Authorization: `${token}`,
          "Cache-Control": "no-cache",
        },
      });

      const countries = response.data.data || [];
      const countryOptions = countries.map((country) => ({
        value: country._id,
        label: (
          <div className="d-flex align-items-center">
            <img
              src={country.flag}
              alt={country.name}
              style={{ width: "20px", height: "15px", marginRight: "8px" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            {country.name}
          </div>
        ),
        name: country.name,
      }));

      setOptions((prev) => ({
        ...prev,
        countries: countryOptions,
      }));
    } catch (error) {
      console.error("Error fetching countries:", error);
      toast.error(error.response?.data?.message || "Error fetching countries");
    }
  };

  // Fetch all states from API
  const fetchAllStates = async () => {
    try {
      const response = await axios.get(`${apiUrl}state/get`, {
        headers: {
          Authorization: `${token}`,
          "Cache-Control": "no-cache",
        },
      });

      const states = response.data.data || [];
      setAllStates(states);
      // If a country is already selected, filter states
      if (selectedCountryId) {
        filterStates(selectedCountryId);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      toast.error(error.response?.data?.message || "Error fetching states");
    }
  };

  // Fetch all cities from API
  const fetchAllCities = async () => {
    try {
      const response = await axios.get(`${apiUrl}city/get`, {
        headers: {
          Authorization: `${token}`,
          "Cache-Control": "no-cache",
        },
      });

      const cities = response.data.data || [];
      setAllCities(cities);
      // If a state is already selected, filter cities
      if (selectedStateId) {
        filterCities(selectedStateId);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      toast.error(error.response?.data?.message || "Error fetching cities");
    }
  };

  // Filter states based on selected country
  const filterStates = (countryId) => {
    if (!countryId) {
      setOptions((prev) => ({ ...prev, states: [] }));
      return;
    }
    // Check API response structure - state object might have countryId or country object
    const filteredStates = allStates.filter((state) => {
      // Try different possible property names
      return (
        state.country === countryId ||
        state.countryId === countryId ||
        (state.country && state.country._id === countryId)
      );
    });
    const stateOptions = filteredStates.map((state) => ({
      value: state._id,
      label: <div className="d-flex align-items-center">{state.name}</div>,
      name: state.name,
    }));

    setOptions((prev) => ({
      ...prev,
      states: stateOptions,
    }));
  };

  // Filter cities based on selected state
  const filterCities = (stateId) => {
    if (!stateId) {
      setOptions((prev) => ({ ...prev, cities: [] }));
      return;
    }
    const filteredCities = allCities.filter((city) => {
      return (
        city.state === stateId ||
        city.stateId === stateId ||
        (city.state && city.state._id === stateId)
      );
    });
    const cityOptions = filteredCities.map((city) => ({
      value: city._id,
      label: <div className="d-flex align-items-center">{city.name}</div>,
      name: city.name,
    }));

    setOptions((prev) => ({
      ...prev,
      cities: cityOptions,
    }));
  };

  // Fetch options from API
  useEffect(() => {
    // Fetch field options (using sample data as before)
    setOptions((prev) => ({
      ...prev,
      fields: [
        { value: "Information Technology", label: "Information Technology" },
        { value: "Healthcare", label: "Healthcare" },
        { value: "Finance", label: "Finance" },
        { value: "Education", label: "Education" },
        { value: "Marketing", label: "Marketing" },
      ],
    }));

    // Fetch job data, countries, states and cities
    if (jobId) {
      fetchJobData();
    }
    fetchCountries();
    fetchAllStates();
    fetchAllCities();
  }, [apiUrl, token, jobId]);

  // When country changes, filter states
  useEffect(() => {
    if (allStates.length > 0) {
      filterStates(selectedCountryId);
    }
  }, [selectedCountryId, allStates]);

  // When state changes, filter cities
  useEffect(() => {
    if (allCities.length > 0) {
      filterCities(selectedStateId);
    }
  }, [selectedStateId, allCities]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: selectedOption ? selectedOption.value : "",
    }));

    // Update the selected IDs for country and state to trigger filtering of related data
    if (field === "country") {
      setSelectedCountryId(selectedOption ? selectedOption.value : "");
      // Reset state and city when country changes
      setFormData((prev) => ({
        ...prev,
        state: "",
        city: "",
      }));
      setSelectedStateId("");
    } else if (field === "state") {
      setSelectedStateId(selectedOption ? selectedOption.value : "");
      // Reset city when state changes
      setFormData((prev) => ({
        ...prev,
        city: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create the data object to send, including the job ID
      const dataToSend = {
        ...formData,
        id: jobId, // Add the job ID here
      };

      const response = await axios.put(`${apiUrl}job/update`, dataToSend, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Get current values for select components
  const getCurrentValue = (field, optionsArray) => {
    if (!formData[field]) return null;
    return (
      optionsArray.find((option) => option.value === formData[field]) || null
    );
  };

  return (
    <Layout ac5="active">
      <ContentHeader
        title="View Job"
        breadcrumbs={[
          { label: "Dashboard", to: "/admin/dashboard" },
          { label: "Manage Job", to: "/admin/joblist" },
          { label: "View Job" },
        ]}
      />
      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="title">Job Title</label>
                      <span className="text-danger">*</span>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        placeholder="Enter Job Title"
                        required
                        value={formData.title}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="field">Field</label>
                      <span className="text-danger">*</span>
                      <Select
                        id="field"
                        options={options.fields}
                        value={getCurrentValue("field", options.fields)}
                        onChange={(selected) =>
                          handleSelectChange(selected, "field")
                        }
                        placeholder="Select Field"
                        isSearchable
                        required
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="flexibleWorkingHours">
                        Flexible Working Hours
                      </label>
                      <Select
                        id="flexibleWorkingHours"
                        options={flexibleWorkingHoursOptions}
                        value={flexibleWorkingHoursOptions.find(
                          (option) =>
                            option.value === formData.flexibleWorkingHours
                        )}
                        onChange={(selected) =>
                          handleSelectChange(selected, "flexibleWorkingHours")
                        }
                        placeholder="Select Flexible Hours Option"
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="description">Job Description</label>
                      <span className="text-danger">*</span>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="5"
                        placeholder="Enter Job Description"
                        required
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="experience">Experience Required</label>
                      <input
                        type="text"
                        className="form-control"
                        id="experience"
                        placeholder="e.g., 1 to 3 years"
                        value={formData.experience}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="salary">Salary</label>
                      <input
                        type="number"
                        className="form-control"
                        id="salary"
                        placeholder="Enter Salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="type">Job Type</label>
                      <Select
                        id="type"
                        options={jobTypeOptions}
                        value={getCurrentValue("type", jobTypeOptions)}
                        onChange={(selected) =>
                          handleSelectChange(selected, "type")
                        }
                        placeholder="Select Job Type"
                        isSearchable
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <Select
                        id="country"
                        options={options.countries}
                        value={getCurrentValue("country", options.countries)}
                        onChange={(selected) =>
                          handleSelectChange(selected, "country")
                        }
                        placeholder="Select Country"
                        isSearchable
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <Select
                        id="state"
                        options={options.states}
                        value={getCurrentValue("state", options.states)}
                        onChange={(selected) =>
                          handleSelectChange(selected, "state")
                        }
                        placeholder="Select State"
                        isSearchable
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <Select
                        id="city"
                        options={options.cities}
                        value={getCurrentValue("city", options.cities)}
                        onChange={(selected) =>
                          handleSelectChange(selected, "city")
                        }
                        placeholder="Select City"
                        isSearchable
                        isDisabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="workingHours">Working Hours</label>
                      <input
                        type="time"
                        step="1"
                        className="form-control"
                        id="workingHours"
                        value={formData.workingHours}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="shift">Shift</label>
                      <input
                        type="text"
                        className="form-control"
                        id="shift"
                        placeholder="e.g., Day Shift, Night Shift"
                        value={formData.shift}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-12">
                    <div className="form-group">
                      <label htmlFor="noticePeriod">Notice Period</label>
                      <input
                        type="text"
                        className="form-control"
                        id="noticePeriod"
                        placeholder="e.g., 15 days, 1 month"
                        value={formData.noticePeriod}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-12">
                    <div className="form-group">
                      <label htmlFor="bondTime">Bond Time</label>
                      <input
                        type="text"
                        className="form-control"
                        id="bondTime"
                        placeholder="e.g., 1 year"
                        value={formData.bondTime}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-12">
                    <div className="form-group">
                      <label htmlFor="benefits">Benefits</label>
                      <input
                        type="text"
                        className="form-control"
                        id="benefits"
                        placeholder="e.g., Health insurance, Paid time off"
                        value={formData.benefits}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <label htmlFor="bondDescription">Bond Description</label>
                      <textarea
                        className="form-control"
                        id="bondDescription"
                        rows="3"
                        placeholder="Enter bond details if applicable"
                        value={formData.bondDescription}
                        onChange={handleInputChange}
                        disabled
                      />
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <div className="float-right">
                    <button
                      type="button"
                      className="btn btn-secondary mx-2"
                      onClick={() => window.history.back()}
                      disabled={loading}
                    >
                      <i className="fas fa-arrow-left"></i> Back
                    </button>
                    {/* <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Job"}
                    </button> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ToastContainer style={{ width: "auto" }} />
    </Layout>
  );
}
