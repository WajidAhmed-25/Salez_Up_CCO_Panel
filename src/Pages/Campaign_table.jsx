
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';

const Campaign_table = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('All Teams');
  const [teams, setTeams] = useState([]);
  const [originalTeams, setOriginalTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [juniorDepartmentHeads, setJuniorDepartmentHeads] = useState([]);
  const [filteredJuniorHeads, setFilteredJuniorHeads] = useState([]);
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [selectedCampaignId ,setSelectedCampaignId] = useState('');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [
          campaignsResponse,
          teamsResponse,
          juniorHeadsResponse,
          departmentHeadsResponse
        ] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/campaigns_and_teams'),
          axios.get('http://127.0.0.1:8000/api/teams'),
          axios.get('http://127.0.0.1:8000/api/junior-department-heads'),
          axios.get('http://127.0.0.1:8000/api/department-heads')
        ]);

        setCampaigns(campaignsResponse.data);
        setOriginalTeams(campaignsResponse.data);
        setTeams(teamsResponse.data);
        setJuniorDepartmentHeads(juniorHeadsResponse.data);
        setDepartmentHeads(departmentHeadsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchAllData();
  }, []);

useEffect(() => {
    setFilteredTeams(teams); 
    setFilteredJuniorHeads(juniorDepartmentHeads); 
  }, [teams, juniorDepartmentHeads]);

  const findDepartmentHeadByJuniorHead = (selectedJuniorHeadName) => {
    const selectedJuniorHead = juniorDepartmentHeads.find(
      head => head.first_name === selectedJuniorHeadName
    );
    console.log("name",selectedJuniorHead.Dept_Head_id)
    
    if (selectedJuniorHead) {
      const matchingDepartmentHead = departmentHeads.find(
        
        deptHead => deptHead.id == selectedJuniorHead.Dept_Head_id
        
      );
      console.log('Selected Junior Head:', selectedJuniorHead);
      console.log('Matching Department Head:', matchingDepartmentHead);
      
      
      return matchingDepartmentHead ? matchingDepartmentHead.first_name : '';
    }
    return '';
  };

  const handleJuniorHeadChange = (e) => {
    const selectedJuniorHeadName = e.target.value;
    const correspondingDepartmentHead = findDepartmentHeadByJuniorHead(selectedJuniorHeadName);
    
    console.log('Selected Junior Head Name:', selectedJuniorHeadName);
    console.log('Corresponding Department Head:', correspondingDepartmentHead);

    setEditedCampaign({
      ...editedCampaign,
      juniorDepartmentHead: selectedJuniorHeadName,
      departmentHead: correspondingDepartmentHead
    });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.campaign.campaign_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesTeam =
      selectedTeam === 'All Teams' || campaign.team.team_name === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const handleEditClick = (campaign) => {
    console.log('Campaign and Teams ID:', campaign.id);
    setSelectedCampaignId(campaign.id); 
    
    setEditedCampaign({
      campaignName: campaign.campaign?.campaign_name || 'Not Assigned', 
      teamName: campaign.team?.team_name || 'Not Assigned',
      departmentHead: campaign.department_head?.first_name || 'Not Assigned', 
      juniorDepartmentHead: campaign.junior_department_head?.first_name || 'Not Assigned', 
    });
    
    setIsModalOpen(true);
  };
  

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDeleteClick = (id) => {
    console.log('Delete clicked for ID:', id);
  };

  const renderTeamOptions = () => {
    const teamNames = [
      ...new Set(originalTeams.map((team) => team.team.team_name)),
    ];
    return (
      <div className="flex mb-4 space-x-2">
        <div
          className="cursor-pointer"
          onClick={() => setSelectedTeam('All Teams')}
        >
          <p
            className={`w-[100px] h-[44px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${
              selectedTeam === 'All Teams'
                ? 'bg-themeGreen text-white font-[600]'
                : 'bg-lGreen text-black font-[400]'
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
            }}
          >
            <p
              className={`w-[100px] h-[44px] flex items-center justify-center text-[14px] leading-[21px] rounded-[10px] ${
                selectedTeam === teamName
                  ? 'bg-themeGreen text-white font-[600]'
                  : 'bg-lGreen text-black font-[400]'
              }`}
            >
              {teamName}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const handleSave = async () => {
    try {
      const juniorDepartmentHeadId = juniorDepartmentHeads.find(head => head.first_name === editedCampaign.juniorDepartmentHead)?.id;
      const departmentHeadId = departmentHeads.find(deptHead => deptHead.first_name === editedCampaign.departmentHead)?.id;

      const conflictingCampaign = campaigns.find(campaign => 
        campaign.junior_department_head_id === juniorDepartmentHeadId || 
        campaign.department_head_id === departmentHeadId
      );

      if (conflictingCampaign) {
        const confirmation = window.confirm("These IDs are already assigned to another campaign. Do you want to proceed?");
        if (!confirmation) return;
      }

      await axios.put(`http://127.0.0.1:8000/api/campaigns_and_teams_update/${selectedCampaignId}`, {
        junior_department_head_id: juniorDepartmentHeadId,
        department_head_id: departmentHeadId
      });

      alert("Campaign updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert("An error occurred while updating the campaign.");
    }
  };
  

  return (
    <>
    <Navbar />
    <div className='flex'>
      <Sidebar />
      <div className='w-full pt-12'>
        <h1 className='text-[28px] leading-[42px] text-themeGreen font-[600] ml-[-10px]'>Campaigns</h1>
        
        <div className="flex flex-col w-[95%]  gap-10 p-5 pb-12 mt-6 card ">
          <div className="flex items-center justify-between mb-4">
            <div className="w-[140px] h-[44px] text-[14px] leading-[21px] rounded-[10px] mt-[10px]">
              {renderTeamOptions()}
            </div>
  
            <div className="relative">
              <input
                type="text"
                placeholder="Search Campaign"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 pl-10 bg-gray-100 border rounded-lg border-themeGreen"
              />
              <span className="absolute transform -translate-y-1/2 right-3 top-1/2 text-themeGreen">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
            </div>
          </div>
  
          <table>
            <thead className="text-themeGreen h-[30px]">
              <tr>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Campaign</th>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Team Name</th>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Department Head</th>
                <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Junior Department Head</th>
                <th className="px-4 sm:px-[10px] min-w-[50px]">Actions</th>
              </tr>
            </thead>
  
            <tbody className="font-[400] bg-white space-y-10">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.campaign_id} className="bg-[#F8FEFD] text-center">
                    <td className="px-4 sm:px-[10px]">{campaign.campaign.campaign_name}</td>
                    <td className="px-4 sm:px-[10px]">{campaign.team.team_name}</td>
                    <td className="px-4 sm:px-[10px]">
                      {campaign.department_head?.first_name ? (
                        campaign.department_head.first_name
                      ) : (
                        <span style={{ fontSize: "12px" }}>Not Assigned</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-[10px]">
                      {campaign.junior_department_head?.first_name ? (
                        campaign.junior_department_head.first_name
                      ) : (
                        <span style={{ fontSize: "12px" }}>Not Assigned</span>
                      )}
                    </td>
  
                    <td className="px-4 sm:px-[10px] py-[10px]">
                      <span className="mx-1 cursor-pointer" onClick={() => handleEditClick(campaign)}>
                        <img src="../images/edit.png" className="inline h-[18px] w-[18px]" alt="Edit" />
                      </span>
                      <span className="mx-1 cursor-pointer" onClick={() => handleDeleteClick(campaign.campaign_id)}>
                        <img src="../images/delete.png" className="inline h-[18px] w-[18px]" alt="Delete" />
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center">No campaigns found</td>
                </tr>
              )}
            </tbody>
          </table>
  
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="w-full max-w-md p-6 bg-white rounded-lg">
                <h2 className="mb-4 text-xl font-semibold">Campaign Details</h2>
  
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Campaign Name</label>
                  <input
                    type="text"
                    name="campaignName"
                    value={editedCampaign.campaignName || ''}
                    onChange={() => {}}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
  
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Team Name</label>
                  <select
                    name="teamName"
                    value={editedCampaign.teamName || ''}
                    onChange={(e) => setEditedCampaign({ ...editedCampaign, teamName: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="" disabled>Select a team</option>
                    {filteredTeams.map((team) => (
                      <option key={team.id} value={team.team_name}>
                        {team.team_name}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Junior Department Head</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={editedCampaign.juniorDepartmentHead}
                    onChange={handleJuniorHeadChange}
                  >
                    <option value="">Select Junior Department Head</option>
                    {filteredJuniorHeads.map((head) => (
                      <option key={head.id} value={head.first_name}>
                        {head.first_name}
                      </option>
                    ))}
                  </select>
                </div>
  
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Department Head</label>
                  <input
                    type="text"
                    value={editedCampaign.departmentHead || ''}
                    readOnly
                    className="w-full p-2 border border-gray-300 rounded bg-gray-50"
                  />
                </div>
  
                <div className="flex justify-end">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 mr-2 text-gray-700 bg-gray-300 rounded"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white rounded bg-themeGreen"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </>
  
  );
};

export default Campaign_table;
