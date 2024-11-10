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

const HeadofSales = () => {
 


  const [managers, setManagers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedManager, setEditedManager] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [managerToDelete, setManagerToDelete] = useState(null);
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
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/manager_details');
      const opsManagers = response.data.filter(manager => manager.manager_role === 'Head Of Sales');
      setManagers(opsManagers);
    } catch (error) {
      toast.error('Failed to fetch managers');
      console.error('Error fetching managers:', error);
    }
  };

  const handleEditClick = (manager) => {
    const decryptedPassword = decryptPassword(manager.manager_password);
    setSelectedManagerId(manager.id);
    setEditedManager({
      manager_name: manager.manager_name,
      manager_commision: manager.manager_commision, // Corrected spelling to match API
      manager_email: manager.manager_email,
      manager_secret_id: manager.manager_secret_id,
      password: decryptedPassword
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (manager) => {
    setManagerToDelete(manager);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/manager_details/${managerToDelete.id}`);
      toast.success('Manager deleted successfully!');
      fetchManagers();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete manager');
      console.error('Error deleting manager:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditedManager({});
    setSelectedManagerId(null);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedManager(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const encryptedPassword = encryptPassword(editedManager.password);
      const updatedManager = {
        manager_name: editedManager.manager_name,
        manager_commision: editedManager.manager_commision, 
        manager_email: editedManager.manager_email,
        manager_secret_id: editedManager.manager_secret_id,
        manager_password: encryptedPassword
      };
      await axios.put(`http://localhost:8000/api/manager_details/${selectedManagerId}`, updatedManager);
      toast.success('Manager updated successfully!');
      fetchManagers();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to update manager');
      console.error('Error updating manager:', error);
    }
  };

  const filteredManagers = managers.filter(manager =>
    manager.manager_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.manager_email.toLowerCase().includes(searchTerm.toLowerCase())
  );



  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="w-full pt-12">
          <h1 className="text-[28px] leading-[42px] text-themeGreen font-[600] ml-[-10px]">
           Head of Sales
          </h1>

          <div className="flex flex-col w-[95%] gap-10 p-5 pb-12 mt-6 card">
            <div className="flex items-center justify-end mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Manager"
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
              <thead className="text-themeGreen h-[30px] mb-12">
                <tr>
                  <th className="px-4 font-[500]">Head of Sales Name</th>
                  <th className="px-4 font-[500]">Email</th>
                  <th className="px-4 font-[500]">Password</th>
                  <th className="px-4 font-[500]">Commission</th>
                  <th className="px-4 font-[500]">Secret ID</th>
                  <th className="px-4 font-[500]">Actions</th>
                </tr>
              </thead>
              <br/>
              <tbody className="font-[400] bg-white space-y-10">
                {filteredManagers.length > 0 ? (
                  filteredManagers.map((manager) => (
                    <tr key={manager.id} className="bg-[#F8FEFD] text-center">
                      <td className="px-4">{manager.manager_name}</td>
                      <td className="px-4">{manager.manager_email}</td>
                      <td className="px-4">••••••••</td>
                      <td className="px-4">{manager.manager_commision}</td>
                      <td className="px-4">{manager.manager_secret_id}</td>
                      <td className="px-4 py-[10px]">
                        <span className="mx-1 cursor-pointer" onClick={() => handleEditClick(manager)}>
                          <img src="../images/edit.png" className="inline h-[18px] w-[18px]" alt="Edit" />
                        </span>
                        <span className="mx-1 cursor-pointer" onClick={() => handleDeleteClick(manager)}>
                          <img src="../images/delete.png" className="inline h-[18px] w-[18px]" alt="Delete" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center">No managers found</td>
                  </tr>
                )}
              </tbody>
            </table>



            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg">
                  <h2 className="mb-4 text-xl font-semibold">Edit Manager Details</h2>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Manager Name</label>
                    <input
                      type="text"
                      name="manager_name"
                      value={editedManager.manager_name || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
  type="email"
  name="manager_email"  // Corrected to match API field name
  value={editedManager.manager_email || ''}
  onChange={handleInputChange}
  className="w-full p-2 border border-gray-300 rounded"
  readOnly
/>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={editedManager.password || ''}
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
                    <label className="block mb-2 text-sm font-medium">Commission</label>
                    <input
  type="number"
  name="manager_commision"  // Corrected to match API field name
  value={editedManager.manager_commision || ''} // Corrected spelling
  onChange={handleInputChange}
  className="w-full p-2 border border-gray-300 rounded"
  min="0"
  step="0.01"  // More precise step for commission values
/>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Secret ID</label>
                    <input
                      type="number"
                      name="manager_secret_id"
                      readOnly
                      value={editedManager.manager_secret_id || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-50"
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
                    <span className="font-semibold">{managerToDelete?.manager_name}</span>?
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
};

export default HeadofSales;
