
import React, { useEffect, useState, useRef } from "react";
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';
import Select from "react-select";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch as faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactPaginate from "react-paginate";

// --------------------------- Saving Data ------------------------------//
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const UpdateModal = ({ isOpen, onClose, data }) => {
  const [manager, setManager] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(data.team_id);

  const [campaigns, setCampaigns] = useState([]);
  const [team_And_Teamleader, setTeam_And_TeamLeader] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(
    data.campaign_detail?.name || ""
  );

  const [admins, setAdmins] = useState([]);
  const [selectedmanager, setSelectedmanager] = useState(
    data.manager?.manager_name || ""
  );

  const [commissionName, setCommissionName] = useState(data.commission);
  const [lead_name, setLead_name] = useState(data.first_name);
  const [lead_sname, setLead_sname] = useState(data.last_name);
  const [imageFile, setImageFile] = useState(data.image_path);
  const [newImageFile, setNewImageFile] = useState();
  const [lead_stname, setLead_stname] = useState("");

  const [targetValue, setTargetValue] = useState(data.target_value);

  const [frequencyName, setFrequencyName] = useState(data.frequency);
  const [targetName, setTargetName] = useState(data.target);
  const [isCreated, setIsCreated] = useState(false);

  const managersIds = useRef({});
  const addManager = (name, id) => {
    managersIds.current[name] = id;
  };
  const getManagerId = (name) => {
    return managersIds.current[name];
  };

  const teamsIds = useRef({});
  const addTeam = (name, id) => {
    teamsIds.current[name] = id;
  };
  const getTeamId = (name) => {
    return teamsIds.current[name];
  };

  const campaignsIds = useRef({});
  const addCampaign = (name, id) => {
    campaignsIds.current[name] = id;
  };
  const getCampaignId = (name) => {
    return campaignsIds.current[name];
  };

  useEffect(() => {
    const today = new Date().toLocaleDateString("en-CA");
    setLead_stname(today);
  }, []);

  useEffect(() => {
    let fetchedTeams = [];
    let fetchedTeamAndLeaders = [];

    axios
      .get("http://localhost:8000/api/teams")
      .then((response) => {
        fetchedTeams = response.data.filter(
          (team) => team.manager_id == localStorage.getItem("id")
        );
        setTeams(fetchedTeams);
      })
      .catch((error) => {
        console.error("Error fetching the teams:", error);
      });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (validImageTypes.includes(file.type)) {
        const reader = new FileReader();

        reader.onloadend = () => {
          setImageFile(file);
          setNewImageFile(file);
          console.log("Uploaded Image:", file.name);
        };

        reader.readAsDataURL(file);
      } else {
        alert("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
        e.target.value = null;
      }
    }
  };

  const handleAdminChange = (selectedOption) => {
    setManager(selectedOption);
  };

  const adminOptions = admins.map((admin) => ({
    value: admin.id,
    label: admin.first_name,
  }));

  // ========================== team ==================================//

  const handleManagerChange = (event) => {
    setSelectedmanager(event.target.value);
  };

  const teamOptions = teams.map((team) => ({
    value: team.id,
    label: team.team_name,
  }));

  // ============================== campaign ------------------------------------------------------------//

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/campaigns")
      .then((response) => {
        setCampaigns(response.data);
        response.data.forEach((campaign) =>
          addCampaign(campaign.name, campaign.id)
        );
      })
      .catch((error) => {
        console.error("Error fetching the campaigns:", error);
      });
  }, [isCreated]);

  const handleCampaignChange = (e) => {
    setSelectedCampaign(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("first_name", lead_name);
    formData.append("last_name", lead_sname);
    formData.append("start_date", lead_stname);
    formData.append("team_id", parseInt(selectedTeam));

    if (newImageFile) {
      formData.append("image_path", newImageFile);
    }

    if (!data) {
      toast.error("Error Updating data. Try Again.");
      console.error("No valid data object or ID found");
      return;
    }

    const id = data.id;

    axios
      .post(
        `http://127.0.0.1:8000/api/sales_agents/${id}?_method=PUT`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        toast.success("Sales Agent successfully updated", {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        onClose();
        // window.location.reload();
      })
      .catch((error) => {
        toast.error("Error Updating Data");
        console.error("Error updating Sales Agent:", error);
        return;
      });
  };

  const handleFrequencyChange = (e) => {
    setFrequencyName(e.target.value);
  };

  const handleTargetChange = (e) => {
    setTargetName(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75"></div>
      <div className="z-50 p-6 m-20 bg-white rounded-lg shadow-lg sm:p-8 w-[800px] h-[600px]">
        <h2 className="mb-4 text-2xl font-semibold text-center text-themeGreen">
          Update Information
        </h2>
        <div className="w-full">
          <div className="flex flex-col items-center w-full gap-1 mb-1">
            <p className="font-[400] text-[14px] text-dGreen text-center">
              Update Picture
            </p>
            <label className="flex flex-col  items-center justify-center w-[100px] h-[100px] rounded-full  cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-7 ">
                <img
                  src={imageFile}
                  className="w-[82px] h-[82px]  rounded-full mt-[-30px]"
                  alt=""
                />
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleImageChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </label>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <label
                htmlFor="name"
                className="block text-themeGray text-sm font-[500] mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                className="w-full rounded-[6px] border-none bg-lGreen p-2 text-[14px]"
                value={lead_name}
                onChange={(e) => setLead_name(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="surname"
                className="block text-themeGray text-sm font-[500] mb-1"
              >
                Surname
              </label>
              <input
                type="text"
                id="surname"
                className="w-full rounded-[6px] border-none bg-lGreen p-2 text-[14px]"
                value={lead_sname}
                onChange={(e) => setLead_sname(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <label
                htmlFor="date"
                className="block text-themeGray text-sm font-[500] mb-1"
              >
                Start Date
              </label>
              <div className="relative custom-date-input">
                <img
                  src="/icons/calendarIcon.png"
                  alt=""
                  className="absolute w-[18px] h-[17px] top-[14px] right-[9px]"
                />
                <input
                  type="date"
                  id="date"
                  className="date-input text-[#8fa59c] w-full border-none rounded-[6px] bg-lGreen p-2 text-[14px]"
                  value={lead_stname}
                  onChange={(e) => setLead_stname(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1">
              <label
                htmlFor="campaignSelect"
                className="block text-themeGray text-sm font-[500] mb-1"
              >
                Campaign
              </label>
              <input
                id="campaignSelect"
                value={selectedCampaign}
                className="shadow-[0px_4px_4px_0px_#40908417] w-full rounded-[6px] bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]"
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <label className="block text-themeGray text-sm font-[500] mb-1">
                Select Teams
              </label>
              <select
                name="team_leader_id"
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                }}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="0">No Team Assigned</option>
                {teamOptions.map((leader) => (
                  <option key={leader.value} value={leader.value}>
                    {leader.label}
                  </option>
                ))}
              </select>

            </div>
            <div className="flex-1">
              <label
                htmlFor="selectManager"
                className="block text-themeGray text-sm font-[500] mb-1"
              >
                Manager
              </label>
              <input
                id="managerSelect"
                value={selectedmanager}
                readOnly
                className="shadow-[0px_4px_4px_0px_#40908417] w-full rounded-[6px] bg-lGreen p-2 text-[14px] font-[500] border-none h-[45px]"
              />
            </div>
          </div>

          <div className="flex justify-between gap-4 mb-2">
            <div className="flex-1">
              <label className="block text-themeGray text-sm font-[500] mb-1">
                Commission
              </label>
              <input
                type="text"
                id="commission"
                onChange={(e) => setCommissionName(e.target.value)}
                defaultValue={data.commission || "kpi Not Assigned"}
                readOnly
                className="w-full border-none rounded-[6px] bg-lGreen p-2 text-[10px] text-center"
              />
            </div>
          </div>

          <div className="flex flex-row-reverse justify-between gap-1">
            <button
              onClick={handleSubmit}
              type="submit"
              className="flex-1 px-4 py-2 font-bold text-white rounded bg-themeGreen focus:outline-none focus:shadow-outline"
            >
              Save
            </button>
            <button
              type="button"
              className="flex-1 px-4 py-2 font-bold text-white bg-red-600 rounded focus:outline-none focus:shadow-outline"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesAgents = () => {
  const [agents, setAgents] = useState([]);
  const [isCreated, setIsCreated] = useState(false);
  const [managerFName, setManagerFName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const agentsPerPage = 9;
  const [selectedData, setSelectedData] = useState({});
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    const storedManagerFName = localStorage.getItem("userFName");
    if (storedManagerFName) {
      setManagerFName(storedManagerFName);
    }

    axios
    .get("http://127.0.0.1:8000/api/sales_agents")
    .then((response) => {
      setAgents(response.data); 
    })
    .catch((error) => {
      console.error("Error fetching sales agents:", error);
    });
  }, []);

  const filterAgentsByTeam = (agents, selectedTeam, searchQuery) => {
    return agents.filter(
      (agent) =>
        (selectedTeam === "All Teams" ||
          (agent.team_id !== null && agent.team.team_name === selectedTeam)) &&
        agent.first_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  const handleStoreCSV = async () => {
    try {
      const filteredAgents = filterAgentsByTeam(
        agents,
        selectedTeam,
        searchQuery
      );
      const headers = [
        "Name",
        "Surname",
        "Start Date",
        "Manager",
        "Team",
        "KPI",
      ];
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sales Agents");
      worksheet.addRow(headers);
      worksheet.getRow(1).font = { bold: true };

      filteredAgents.forEach((agent) => {
        const rowData = [
          agent.first_name,
          agent.last_name,
          agent.start_date,
          managerFName,
          agent.team.team_name,
          "KPI not assigned",
        ];
        worksheet.addRow(rowData);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, "Sales_Agents_Data.xlsx");
    } catch (error) {
      console.error("Error generating Excel:", error);
    }
  };

  const handleUpdate = (data) => {
    console.log(data);
    setIsUpdateModalOpen(true);
    setSelectedData(data);
  };

  const handlemyDelete = (team) => {
    console.log(team);
    const confirmed = window.confirm(
      `Are you sure you want to delete ${team.first_name}?`
    );
    if (!confirmed) return;

    fetch(`http://127.0.0.1:8000/api/sales_agents/${team.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          toast.success("Sale Agent successfully deleted", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          // window.location.reload();
        } else {
          console.error("Failed to delete the Sales Agent.");
        }
      })
      .catch((error) => {
        console.error("Error deleting the Sales Agent:", error);
        return;
      });
  };

  const renderTable = () => {
    const filteredAgents = filterAgentsByTeam(
      agents,
      selectedTeam,
      searchQuery
    );
    const noDataAvailable = filteredAgents.length === 0;

    // Pagination Logic
    const offset = currentPage * agentsPerPage;
    const paginatedAgents = filteredAgents.slice(
      offset,
      offset + agentsPerPage
    );
    const pageCount = Math.ceil(filteredAgents.length / agentsPerPage);

    return (
      <>
        {noDataAvailable ? (
          <p className="mt-4 text-center">No Data available</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-[14px]">
                <thead className="text-themeGreen h-[30px]">
                  <tr className="flex flex-row items-center justify-between w-full text-center custom flex-nowrap">
                    <th className="px-[10px] font-[500] w-[42px]"></th>
                    <th className="px-[10px] font-[500] w-[84px]">Name</th>
                    <th className="px-[10px] font-[500] w-[84px]">Surname</th>
                    <th className="px-[10px] font-[500] w-[84px]">StartDate</th>
                    <th className="px-[10px] font-[500] w-[84px]">Manager</th>
                    <th className="px-[10px] font-[500] w-[84px]">Team</th>
                    <th className="px-[10px] font-[500] w-[84px]">KPI</th>
                    <th className="px-[10px] font-[500] w-[71px]"></th>
                  </tr>
                </thead>
                <tbody className="font-[400]">
                  {paginatedAgents.map((agent, index) => (
                    <tr
                      key={index}
                      className="bg-[#F8FEFD] my-[8px] text-center custom w-full flex flex-row flex-nowrap justify-between items-center"
                    >
                      <td className="px-[10px]">
                        <img
                          src={agent.image_path}
                          className="w-[40px] h-[40px] rounded-full m-auto"
                        />
                      </td>
                      <td className="px-[10px] w-[91px] text-mm">
                        <p>{agent.first_name}</p>
                      </td>
                      <td className="px-[10px] w-[91px] text-mm">
                        <p>{agent.last_name}</p>
                      </td>
                      <td className="w-[91px] text-mm">
                        <p>{agent.start_date}</p>
                      </td>
                      <td className="px-[10px] w-[91px] text-mm">
                        <p>{agent.manager.manager_name}</p>
                      </td>
                      <td className="px-[10px] w-[91px] text-mm">
                        <p>
                          {agent.team_id && agent.team && agent.team.team_name
                            ? agent.team.team_name
                            : "(No Team Assigned)"}
                        </p>
                      </td>
                      <td className="px-[10px] w-[91px] text-xs">
                        <p>(Kpi not assigned)</p>
                      </td>
                      <td className="px-4 sm:px-[10px] py-[10px]">
                        <span
                          className="mx-1 cursor-pointer"
                          onClick={() => {
                            handleUpdate(agent);
                          }}
                        >
                          <img
                            src="../images/edit.png"
                            className="inline h-[18px] w-[18px]"
                            alt="Edit"
                          />
                        </span>
                        <span
                          className="mx-1 cursor-pointer"
                          onClick={() => handlemyDelete(agent)}
                        >
                          <img
                            src="../images/delete.png"
                            className="inline h-[18px] w-[18px]"
                            alt="Delete"
                          />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination UI */}
            <div className="flex justify-center mt-4 pagination-container">
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                containerClassName={"pagination flex gap-2 ml-[660px]"}
                pageClassName={
                  "page py-2 px-3 rounded-lg bg-gray-200 text-center text-themeGreen cursor-pointer hover:bg-themeGreen hover:text-black w-[40px]"
                }
                activeClassName={"active bg-themeGreen text-white"}
                previousClassName={
                  "previous py-2 px-3 rounded-lg bg-gray-200 text-themeGreen cursor-pointer hover:bg-gray-300 hover:text-black shadow-md"
                }
                nextClassName={
                  "next py-2 px-3 rounded-lg bg-gray-200 text-themeGreen cursor-pointer hover:bg-gray-300 hover:text-black shadow-md"
                }
                disabledClassName={"disabled  pointer-events-none"}
              />
            </div>
          </>
        )}

        {isUpdateModalOpen && (
          <UpdateModal
            isOpen={isUpdateModalOpen}
            onClose={() => setIsUpdateModalOpen(false)}
            data={selectedData}
          />
        )}
      </>
    );
  };

  const renderTeamOptions = () => {
    const teamNames = [
      ...new Set(
        agents
          .filter((agent) => agent.team_id !== null)
          .map((agent) => agent.team.team_name)
      ),
    ];
    return (
      <div className="flex space-x-2">
        <div
          className="cursor-pointer"
          onClick={() => setSelectedTeam("All Teams")}
        >
          <p
            className={`w-[100px] h-[44px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${
              selectedTeam === "All Teams"
                ? "bg-themeGreen text-white font-[600]"
                : "bg-lGreen text-black font-[400]"
            }`}
          >
            All Teams
          </p>
        </div>
        {teamNames.map((teamName, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => {
              setSelectedTeam(teamName);
              setCurrentPage(0);
            }}
          >
            <p
              className={`w-[100px] h-[44px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${
                selectedTeam === teamName
                  ? "bg-themeGreen text-white font-[600]"
                  : "bg-lGreen text-black font-[400]"
              }`}
            >
              {teamName}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <Navbar />
      <div className="flex ">
      <Sidebar/>
        <div className="flex flex-col w-full mt-12 mb-4 ">
          <h1 className="text-[28px]  text-themeGreen font-[600] ">
            Sales Agent
          </h1>
          <div
            className="flex flex-col w-[95%] gap-6 p-8 mt-6 card"
            id="currentAgent"
          >
      
            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="flex flex-col ml-4">{renderTeamOptions()}</div>
                <div className="ml-[280px]">
                  <input
                    type="text"
                    placeholder="Search Agent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 pl-10 mr-2 bg-gray-100 border rounded-lg border-themeGreen focus:outline-none"
                  />
                  <span className="text-themeGreen ml-[-40px]">
                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end w-full">
              <button
                onClick={handleStoreCSV}
                className="px-4 py-2 text-white transition duration-300 rounded-lg bg-themeGreen hover:bg-green-600"
              >
                Export to Excel
              </button>
            </div>

            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAgents;
