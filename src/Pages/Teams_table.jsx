import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';

const Teams_table = () => {
  const [teams, setTeams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [editedTeam, setEditedTeam] = useState({
    team_id: "",
    team_leader_id: "",
  });
  const [uniqueTeamLeaders, setUniqueTeamLeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalTeams, setOriginalTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [teamsPerPage] = useState(9);
  const [selectedTeam, setSelectedTeam] = useState("All Teams");



  


  useEffect(() => {
    const fetchTeamLeaders = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/api/team_leaders");
          setUniqueTeamLeaders(response.data); // No filtering by manager_id
        } catch (error) {
          console.error("Error fetching all team leaders:", error);
        }
      };

    fetchTeamLeaders();
  }, []);



  useEffect(() => {
    const fetchTeamAndLeaderData = async () => {
        try {
          const response = await axios.get(
            "http://127.0.0.1:8000/api/team_and_team_leader"
          );
          
          const filteredTeams = response.data.filter((team) => {
            const teamNameMatch = team.team.team_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
            const leaderNameMatch =
              team.team_leader &&
              (team.team_leader.first_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
                team.team_leader.last_name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()));
      
            return (
              (teamNameMatch || leaderNameMatch || !searchTerm) &&
              (selectedTeam === "All Teams" ||
                team.team.team_name === selectedTeam)
            );
          });
      
          setTeams(filteredTeams);
          setOriginalTeams(response.data); 
        } catch (error) {
          console.error("Error fetching team and leader data:", error);
        }
      };
      

    fetchTeamAndLeaderData();
  }, [searchTerm, selectedTeam]);

  const renderTeamOptions = () => {
    const teamNames = [
      ...new Set(originalTeams.map((team) => team.team.team_name)),
    ];
    return (
      <div className="flex space-x-2 mb-4">
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
              setCurrentPage(1);
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

  const handleEditClick = (team) => {
    setCurrentTeam(team);
    setEditedTeam({
      team_id: team.team_id,
      team_leader_id: team.team_leader_id,
    });

    console.log(`Selected Team ID: ${team.id}`);
    console.log(`Team ID: ${team.team_id}, Name: ${team.team.team_name}`);

    setIsModalOpen(true);
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;

    if (name === "team_leader_id") {
      console.log("Selected Team Leader ID:", value); // Log the selected team leader ID

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/team_and_team_leader"
        );
        const existingLeader = response.data.find(
          (team) => team.team_leader_id === parseInt(value)
        );

        if (existingLeader) {
          alert(
            "This leader already has a team. Would you like to assign him another team?"
          );
        }
      } catch (error) {
        console.error("Error checking leader assignment:", error);
      }
    }

    setEditedTeam((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/team_and_team_leader"
      );
      const existingTeam = response.data.find(
        (team) =>
          team.team.team_name === currentTeam.team.team_name &&
          team.team_id !== currentTeam.team_id
      );

      if (existingTeam) {
        alert("Kindly use a different team name.");
        return; // Stop execution
      }

      await axios.put(
        `http://127.0.0.1:8000/api/team_and_team_leader_update/${currentTeam.id}`,
        {
          team_id: currentTeam.team_id,
          team_leader_id: editedTeam.team_leader_id,
        }
      );

      await axios.put(
        `http://127.0.0.1:8000/api/teams/update-name-from-leader/${currentTeam.team_id}`,
        {
          team_name: currentTeam.team.team_name,
        }
      );

      const updatedTeams = teams.map((team) =>
        team.team_id === currentTeam.team_id
          ? {
              ...team,
              team_leader_id: editedTeam.team_leader_id,
              team_name: currentTeam.team.team_name,
            }
          : team
      );

      setTeams(updatedTeams);
      setIsModalOpen(false);
      toast.success("Team leader is successfully updated.");
      window.location.reload();
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTeam(null);
  };

  const handleDelete = async (id, teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        // Delete team_and_team_leader data using its id
        await axios.delete(
          `http://127.0.0.1:8000/api/team_and_team_leader_delete/${id}`
        );

        // Delete associated team data using team_id
        await axios.delete(
          `http://127.0.0.1:8000/api/team_leader_team_delete/${teamId}`
        );

        // Refresh the data
        // fetchTeamAndLeaderData();
        window.location.reload();
        toast.success("Team leader is successfully deleted.");
      } catch (error) {
        console.error("Error deleting team:", error);
      }
    }
  };

  const indexOfLastTeam = currentPage * teamsPerPage;
  const indexOfFirstTeam = indexOfLastTeam - teamsPerPage;
  const currentTeams = teams.slice(indexOfFirstTeam, indexOfLastTeam);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(teams.length / teamsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(teams.length / teamsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
  <Navbar /> 
  <div className="flex">
    <Sidebar />
    <div className="w-full pt-12">
      <h1 className="text-[28px] leading-[42px] text-themeGreen font-[600] ml-[-10px]">Teams</h1>
      
      <div className="flex flex-col w-[95%]  gap-10 p-5 pb-12 mt-6 card">
        <div className="relative flex items-center justify-between mb-4 gap-6">
          <div className="w-[140px] h-[44px] text-[14px] leading-[21px] rounded-[10px] mt-[10px]">
            {renderTeamOptions()}
          </div>
          <div className="relative ml-[10px]">
            <input
              type="text"
              placeholder="Search Data"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-themeGreen p-2 rounded-lg pl-10 bg-gray-100"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-themeGreen">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </span>
          </div>
        </div>

        {currentTeams.length > 0 ? (
          <table>
            <thead className="text-themeGreen h-[30px]">
              <tr>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Team Name</th>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Team Leader Name</th>
                <th className="px-4 sm:px-[10px] min-w-[50px]">Actions</th>
              </tr>
            </thead>
            <tbody className="font-[400] bg-white space-y-10">
              {currentTeams.map((team) => (
                <tr key={team.team_id} className="bg-[#F8FEFD] text-center">
                  <td className="px-2 sm:px-[10px]">{team.team.team_name}</td>
                  <td className="px-2 sm:px-[10px]">
                    {team.team_leader ? (
                      team.team_leader.first_name
                    ) : (
                      <span style={{ fontSize: "12px" }}>(leader not assigned)</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-[10px] py-[10px]">
                    <span className="mx-1 cursor-pointer" onClick={() => handleEditClick(team)}>
                      <img
                        src="../images/edit.png"
                        className="inline h-[18px] w-[18px]"
                        alt="Edit"
                      />
                    </span>
                    <span className="mx-1 cursor-pointer" onClick={() => handleDelete(team.id, team.team_id)}>
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
        ) : (
          <div className="text-center py-4">No Team Leader is available.</div>
        )}

        <div className="flex justify-end mt-4">
          <nav>
            <ul className="flex list-none items-center">
              {pageNumbers.map((number) => (
                <li key={number} className="mx-1">
                  <button
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-lg w-[40px] ${
                      currentPage === number
                        ? "bg-themeGreen text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {number}
                  </button>
                </li>
              ))}
              <li className="mx-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg text-themeGreen ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md"
                  }`}
                >
                  Previous
                </button>
              </li>
              <li className="mx-1">
                <button
                  onClick={nextPage}
                  disabled={currentPage === Math.ceil(teams.length / teamsPerPage)}
                  className={`px-3 py-1 rounded text-themeGreen ${
                    currentPage === Math.ceil(teams.length / teamsPerPage)
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md"
                  }`}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {isModalOpen && currentTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Edit Team</h2>
              <form onSubmit={handleSave}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Team</label>
                  <input
                    type="text"
                    name="team_name"
                    value={currentTeam ? currentTeam.team.team_name : ""}
                    onChange={(e) =>
                      setCurrentTeam((prev) => ({
                        ...prev,
                        team: { ...prev.team, team_name: e.target.value },
                      }))
                    }
                    className="border border-gray-300 p-2 w-full rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Team Leader</label>
                  <select
                    name="team_leader_id"
                    value={editedTeam.team_leader_id}
                    onChange={handleInputChange}
                    className="border border-gray-300 p-2 w-full rounded"
                  >
                    <option value="">No Team Leader</option>
                    {uniqueTeamLeaders.map((leader) => (
                      <option key={leader.id} value={leader.id}>
                        {leader.first_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="bg-themeGreen text-white px-4 py-2 rounded"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ToastContainer />
      </div>
    </div>
  </div>
</>

  );
};

export default Teams_table;
