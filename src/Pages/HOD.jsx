import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import CryptoJS from 'crypto-js';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';

const ENCRYPTION_KEY = 'DBBDRSSR54321';

export default function HOD() {
  const [departmentHeads, setDepartmentHeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedDepartmentHead, setEditedDepartmentHead] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartmentHeadId, setSelectedDepartmentHeadId] = useState(null);
  const [departmentHeadToDelete, setDepartmentHeadToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const decryptPassword = (encryptedPassword) => {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting password:', error);
      return '';
    }
  };

  const encryptPassword = (password) => {
    try {
      return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    } catch (error) {
      console.error('Error encrypting password:', error);
      return '';
    }
  };

  useEffect(() => {
    fetchDepartmentHeads();
  }, []);

  const fetchDepartmentHeads = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/department-heads');
      console.log('API Response:', response.data);
      setDepartmentHeads(response.data);
    } catch (error) {
      toast.error('Failed to fetch department heads');
      console.error('Error fetching department heads:', error);
    }
  };

  const handleEditClick = (departmentHead) => {
    const decryptedPassword = decryptPassword(departmentHead.password);
    setSelectedDepartmentHeadId(departmentHead.id);
    setEditedDepartmentHead({
      first_name: departmentHead.first_name,
      last_name: departmentHead.last_name,
      email: departmentHead.email,
      password: decryptedPassword,
      start_date: departmentHead.start_date,
      commission: departmentHead.commission,
      manager_id: departmentHead.manager_id
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (departmentHead) => {
    setDepartmentHeadToDelete(departmentHead);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/department-heads/${departmentHeadToDelete.id}`);
      toast.success('Department head deleted successfully!');
      fetchDepartmentHeads();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete department head');
      console.error('Error deleting department head:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditedDepartmentHead({});
    setSelectedDepartmentHeadId(null);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedDepartmentHead(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const encryptedPassword = encryptPassword(editedDepartmentHead.password);
      const updatedDepartmentHead = {
        ...editedDepartmentHead,
        password: encryptedPassword
      };
      await axios.put(`http://localhost:8000/api/department-heads/${selectedDepartmentHeadId}`, updatedDepartmentHead);
      toast.success('Department head updated successfully!');
      fetchDepartmentHeads();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to update department head');
      console.error('Error updating department head:', error);
    }
  };

  const filteredDepartmentHeads = departmentHeads.filter(departmentHead => {
    const fullName = `${departmentHead?.first_name} ${departmentHead?.last_name}`.toLowerCase();
    const email = departmentHead?.email?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) ||
           email.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="w-full pt-12">
          <h1 className="text-[28px] leading-[42px] text-themeGreen font-[600] ml-[-10px]">
            Department Heads
          </h1>

          <div className="flex flex-col w-[95%]  gap-10 p-5 pb-12 mt-6 card">
            <div className="flex items-center justify-end mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Department Head"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="p-2 bg-gray-100 border rounded-lg w-72 te border-themeGreen placeholder:text-center"
                />
                <span className="absolute transform -translate-y-1/2 right-3 top-1/2 text-themeGreen">
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
              </div>
            </div>

            <table>
              <thead className="text-themeGreen h-[30px] mb-12">
                <tr>
                  <th className="px-4 font-[500]">Name</th>
                  <th className="px-4 font-[500]">Email</th>
                  <th className="px-4 font-[500]">Password</th>
                  <th className="px-4 font-[500]">Start Date</th>
                  <th className="px-4 font-[500]">Commission</th>
                  <th className="px-4 font-[500]">Manager</th>
                  <th className="px-4 font-[500]">Actions</th>
                </tr>
              </thead>
              <br/>
              <tbody className="font-[400] bg-white space-y-10">
                {filteredDepartmentHeads.length > 0 ? (
                  filteredDepartmentHeads.map((departmentHead) => (
                    <tr key={departmentHead.id} className="bg-[#F8FEFD] text-center">
                      <td className="px-4">{`${departmentHead.first_name} ${departmentHead.last_name}`}</td>
                      <td className="px-4">{departmentHead.email}</td>
                      <td className="px-4">••••••••</td>
                      <td className="px-4">{departmentHead.start_date}</td>
                      <td className="px-4">{departmentHead.commission || 'N/A'}</td>
                      <td className="px-4">{departmentHead.manager?.manager_name || 'N/A'}</td>
                      <td className="px-4 py-[10px]">
                        <span className="mx-1 cursor-pointer" onClick={() => handleEditClick(departmentHead)}>
                          <img src="../images/edit.png" className="inline h-[18px] w-[18px]" alt="Edit" />
                        </span>
                        <span className="mx-1 cursor-pointer" onClick={() => handleDeleteClick(departmentHead)}>
                          <img src="../images/delete.png" className="inline h-[18px] w-[18px]" alt="Delete" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">No department heads found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Edit Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg">
                  <h2 className="mb-4 text-xl font-semibold">Edit Department Head Details</h2>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editedDepartmentHead.first_name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={editedDepartmentHead.last_name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editedDepartmentHead.email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={editedDepartmentHead.password || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute text-gray-500 transform -translate-y-1/2 right-2 top-1/2"
                      >
                        {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Start Date</label>
                    <input
                      type="date"
                      name="start_date"
                      value={editedDepartmentHead.start_date || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Commission</label>
                    <input
                      type="number"
                      name="commission"
                      value={editedDepartmentHead.commission || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 mr-2 text-gray-700 bg-gray-300 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-white rounded bg-themeGreen"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                  <h2 className="mb-4 text-xl font-bold text-gray-900">Confirm Deletion</h2>
                  <p className="mb-6 text-gray-700">
                    Are you sure you want to delete the record for{' '}
                    <span className="font-semibold">
                      {`${departmentHeadToDelete?.first_name} ${departmentHeadToDelete?.last_name}`}
                    </span>?
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}