import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserEdit } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// =================Protecting Routes===================== //
import { useAuth } from '../AuthContext';


const Login = () => {

  // Route Encapulation //

  // const { login } = useAuth()

    const navigate = useNavigate();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [adminId, setAdminId] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const admins = [
        { email: 'mathew@gmail.com', password: 'admin', adminId: 'admin1', superAdminName:'Mathew' },
        { email: 'wajidsaleem693@gmail.com', password: 'wajid', adminId: '554433',superAdminName:'Wajid Ahmed'  },
        { email: 'admin3@example.com', password: 'admin3pass', adminId: 'admin003',superAdminName:'Mathew'  }
    ];

    const handleSignin = () => {

        if (!email || !password || !adminId) {
            toast.warning("Kindly Fill All The Fields!")
            return;
        }

        const admin = admins.find(
            (admin) => admin.email === email && admin.password === password && admin.adminId === adminId
        );
        if (admin) {

          localStorage.setItem('Super_Admin', JSON.stringify(admin));
          
          toast.success('Login successful!');
          // login(); 

          setTimeout(() => navigate('/Dashboard'), 2000);
       
        } else {
            toast.error('Invalid credentials');
        }
    };

    return (


        <div className="flex items-center justify-center min-h-screen p-4 overflow-hidden bg-gray-200">
        {/* Decorative elements with adjusted positioning to prevent overflow */}
        <div className="fixed top-0 left-0 z-0 hidden transform rotate-45 opacity-50 w-60 h-60 rounded-xl bg-themeGreen md:block"></div>
        <div className="fixed bottom-0 right-0 hidden w-48 h-48 transform rotate-45 opacity-50 rounded-xl bg-themeGreen md:block"></div>

        <div className="fixed top-0 hidden w-40 h-40 transform rotate-45 opacity-50 rounded-xl bg-themeGreen right-12 md:block"></div>
        
        <div className="fixed hidden w-40 h-40 transform opacity-50 rounded-xl bg-themeGreen bottom-20 left-10 md:block rotate-12"></div>
  
        <div className="z-20 w-full max-w-md px-8 py-8 bg-white shadow-xl md:px-12 rounded-2xl">
          <div className="mb-6 text-center">
            <img src="/images/logo.png" alt="" className="w-[197px] h-[40px] mx-auto cursor-pointer mb-4" />
            {/* <h1 className="mb-4 text-2xl font-bold cursor-pointer md:text-3xl">Admin Login</h1> */}
          </div>
  
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="email"
                name="email"
                placeholder="Enter your email"
                className="block w-full px-4 py-3 text-sm border rounded-lg outline-purple-500"
              />
            </div>
  
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="password"
                placeholder="Enter your Password"
                className="block w-full px-4 py-3 text-sm border rounded-lg outline-purple-500"
              />
            </div>
  
            <div className="flex flex-col gap-2">
              <label htmlFor="adminId" className="text-sm font-semibold text-gray-700">Unique Id</label>
              <input
                type="text"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                required
                id="adminId"
                placeholder="Enter your Unique Super Admin Id"
                className="block w-full px-4 py-3 text-sm border rounded-lg outline-purple-500"
              />
            </div>
          </div>
  
          <div className="mt-6">
            <button
              onClick={handleSignin}
              className="w-full py-3 text-xl text-white transition-all rounded-lg bg-themeGreen hover:bg-gray-400 hover:text-black"
            >
              Login
            </button>
          </div>
        </div>
  
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    );
};

export default Login;
