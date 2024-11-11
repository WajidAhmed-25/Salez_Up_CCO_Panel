
import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const Manager = () => {
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState(null); 
    const [showModal, setShowModal] = useState(false); 
    const [formData, setFormData] = useState({
        manager_name: '',
        email: '',
        password: '',
        manager_secret_id: ''
    });

    // Fetch data from API
    useEffect(() => {
        axios.get('https://crmapi.devcir.co/api/managers')
            .then(response => {
                setManagers(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the data!", error);
            });
    }, []);

    const successfulMsg = () => {
        toast.success("Manager is updated successfully", {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    };
    

    const handleEditClick = (manager) => {
        setSelectedManager(manager);
        setFormData({
            manager_name: manager.manager_name,
            email: manager.email,
            password: CryptoJS.AES.decrypt(manager.password, 'DBBDRSSR54321').toString(CryptoJS.enc.Utf8),
            manager_secret_id: manager.manager_secret_id
        });
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        // Your delete logic here
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = () => {
        // Encrypt password before sending it to the API
        const encryptedPassword = CryptoJS.AES.encrypt(formData.password, 'DBBDRSSR54321').toString();

        // Send PUT request to update the manager's data
        axios.put(`https://crmapi.devcir.co/api/managers/${selectedManager.id}`, {
            manager_name: formData.manager_name,
            email: formData.email,
            password: encryptedPassword,
            manager_secret_id: formData.manager_secret_id
        })
        .then(response => {
            // Update the local state with the updated manager
            setManagers(managers.map(manager =>
                manager.id === selectedManager.id ? response.data : manager
            ));
            setShowModal(false); // Close the modal after updating
            successfulMsg();
            setTimeout(() => {
                window.location.reload(); // Reload the page
            }, 5000);
        })
        .catch(error => {
            console.error("There was an error updating the data!", error);
        });
    };

    return (
        <>
            <Navbar />
            <div className='flex'>
                <Sidebar />
                <div className='w-full pt-12'>
                    <h1 className='text-[28px] leading-[42px] text-[#555555] font-[500]'>Managers</h1>
                    <div className='w-full flex-col flex gap-[32px]'></div>
                    <div className="flex flex-col w-full gap-10 p-5 pb-12 mt-3 card ml-[-20px]">
                        <table>
                            <thead className="text-themeGreen h-[30px]">
                                <tr>
                                    <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Name</th>
                                    <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Email</th>
                                    <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Password</th>
                                    <th className="px-4 sm:px-[10px] font-[500] min-w-[50px]">Manager Id</th>
                                    <th className="px-4 sm:px-[10px] min-w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="font-[400] bg-white space-y-10">
                                {managers.map((manager) => (
                                    <tr key={manager.id} className="bg-[#F8FEFD] text-center">
                                        <td className="px-2 sm:px-[10px]">{manager.manager_name}</td>
                                        <td className="px-2 sm:px-[10px]">{manager.email}</td>
                                        <td className="px-2 sm:px-[10px]">{CryptoJS.AES.decrypt(manager.password, 'DBBDRSSR54321').toString(CryptoJS.enc.Utf8)}</td>
                                        <td className="px-2 sm:px-[10px]">{manager.manager_secret_id}</td>
                                        <td className="px-4 sm:px-[10px] py-[10px]">
                                            <span
                                                className="mx-1 cursor-pointer"
                                                onClick={() => handleEditClick(manager)}
                                            >
                                                <img
                                                    src="../images/edit.png"
                                                    className="inline h-[18px] w-[18px]"
                                                    alt="Edit"
                                                />
                                            </span>
                                            <span className="mx-1 cursor-pointer" onClick={() => handleDeleteClick(manager.id)}>
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

                    {/* Modal for editing manager */}
                    {showModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
                            <div className="bg-white p-6 rounded-lg max-w-md w-full">
                                <h2 className="text-xl font-semibold mb-4">Edit Manager</h2>
                                <form>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            name="manager_name"
                                            value={formData.manager_name}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 p-2 w-full rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 p-2 w-full rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Password</label>
                                        <input
                                            type="text"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 p-2 w-full rounded"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium mb-2">Manager Id</label>
                                        <input
                                            readOnly
                                            type="text"
                                            name="manager_secret_id"
                                            value={formData.manager_secret_id}
                                            onChange={handleInputChange}
                                            className="border border-gray-300 p-2 w-full rounded"
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleUpdate}
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="bg-themeGreen text-white px-4 py-2 rounded"
                                    >
                                        Cancel
                                    </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                    <ToastContainer />

                </div>
            </div>
        </>
    );
};

export default Manager;