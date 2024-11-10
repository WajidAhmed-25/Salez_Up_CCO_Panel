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

export default function Admins_Management() {
  const [adminData, setAdminData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedAdmin, setEditedAdmin] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
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
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/admin_portal_login');
      console.log('API Response:', response.data);
      setAdminData(response.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
      console.error('Error fetching admin data:', error);
    }
  };

  const handleEditClick = (admin) => {
    const decryptedPassword = decryptPassword(admin.admin_password);
    setSelectedAdminId(admin.id);
    setEditedAdmin({
      admin_username: admin.admin_username,
      admin_email: admin.admin_email,
      admin_password: decryptedPassword
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/admin_portal_login/${adminToDelete.id}`);
      toast.success('Admin deleted successfully!');
      fetchAdminData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete admin');
      console.error('Error deleting admin:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditedAdmin({});
    setSelectedAdminId(null);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAdmin(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const encryptedPassword = encryptPassword(editedAdmin.admin_password);
      const updatedAdmin = {
        ...editedAdmin,
        admin_password: encryptedPassword
      };
      await axios.put(`http://localhost:8000/api/admin_portal_login/${selectedAdminId}`, updatedAdmin);
      toast.success('Admin updated successfully!');
      fetchAdminData();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to update admin');
      console.error('Error updating admin:', error);
    }
  };

  const filteredAdmins = adminData.filter(admin => {
    const username = admin?.admin_username || '';
    const email = admin?.admin_email || '';
    
    return username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="w-full pt-12">
          <h1 className="text-[28px] leading-[42px] text-themeGreen font-[600] ml-[-10px]">
            Admins Management
          </h1>

          <div className="flex flex-col w-[95%]  gap-10 p-5 pb-12 mt-6 card">
            <div className="flex items-center justify-end mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Admin"
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
                  <th className="px-4 font-[500]">Username</th>
                  <th className="px-4 font-[500]">Email</th>
                  <th className="px-4 font-[500]">Password</th>
                  <th className="px-4 font-[500]">Actions</th>
                </tr>
              </thead>
              <br/>
              <tbody className="font-[400] bg-white space-y-10">
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="bg-[#F8FEFD] text-center">
                      <td className="px-4">{admin.admin_username}</td>
                      <td className="px-4">{admin.admin_email}</td>
                      <td className="px-4">••••••••</td>
                      <td className="px-4 py-[10px]">
                        <span className="mx-1 cursor-pointer" onClick={() => handleEditClick(admin)}>
                          <img src="../images/edit.png" className="inline h-[18px] w-[18px]" alt="Edit" />
                        </span>
                        <span className="mx-1 cursor-pointer" onClick={() => handleDeleteClick(admin)}>
                          <img src="../images/delete.png" className="inline h-[18px] w-[18px]" alt="Delete" />
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center">No admin data found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Edit Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg">
                  <h2 className="mb-4 text-xl font-semibold">Edit Admin Details</h2>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Username</label>
                    <input
                      type="text"
                      name="admin_username"
                      value={editedAdmin.admin_username || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Email</label>
                    <input
                      type="email"
                      name="admin_email"
                      value={editedAdmin.admin_email || ''}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm font-medium">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="admin_password"
                        value={editedAdmin.admin_password || ''}
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
                    Are you sure you want to delete the admin record for{' '}
                    <span className="font-semibold">{adminToDelete?.admin_username}</span>&nbsp;?
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