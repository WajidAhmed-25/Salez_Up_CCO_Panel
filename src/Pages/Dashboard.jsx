import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import Sidebar from '../Components/SideBar';
import { Tree, TreeNode } from 'react-organizational-chart';

const Dashboard = () => {
  const [superadminData, setSuperadminData] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [hos, setHos] = useState([]);

  useEffect(() => {
    const storedData = localStorage.getItem('Super_Admin');
    if (storedData) {
      setSuperadminData(JSON.parse(storedData));
    }

    // Fetch admins data
    fetch('http://localhost:8000/api/admin_portal_login')
      .then((response) => response.json())
      .then((data) => setAdmins(data))
      .catch((error) => console.error('Error fetching admins:', error));

    fetch('http://localhost:8000/api/head_of_sales')
      .then((response) => response.json())
      .then((data) => setHos(data))
      .catch((error) => console.error('Error fetching admins:', error));
  }, []);

  const OrganizationalChart = () => (
    <div className="flex items-center justify-center w-full mt-8">
      <Tree
        lineWidth="2px"
        lineColor="green"
        lineBorderRadius="10px"
        label={
          <div className="px-4 py-2 text-center bg-red-200 border border-red-500 rounded-md">
            Root
          </div>
        }
      >
        <TreeNode
          label={
            <div className="px-4 py-2 text-center bg-blue-200 border border-blue-500 rounded-md">
              Child 1
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child
              </div>
            }
          />
        </TreeNode>
        <TreeNode
          label={
            <div className="px-4 py-2 text-center bg-blue-200 border border-blue-500 rounded-md">
              Child 2
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child
              </div>
            }
          >
            <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 1
                </div>
              }
            />
            <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 2
                </div>
              }
            />
                <TreeNode
              label={
                <div className="px-4 py-2 text-center bg-green-200 border border-green-500 rounded-md">
                  Great Grand Child 4
                </div>
              }
            />
          </TreeNode>
        </TreeNode>
        <TreeNode
          label={
            <div className="px-4 py-2 text-center bg-blue-200 border border-blue-500 rounded-md">
              Child 3
            </div>
          }
        >
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child 1
              </div>
            }
          />
          <TreeNode
            label={
              <div className="px-4 py-2 text-center bg-yellow-200 border border-yellow-500 rounded-md">
                Grand Child 2
              </div>
            }
          />
        </TreeNode>
        
      </Tree>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-4">
          <OrganizationalChart />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
