import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Users, UserCircle, UserCog, SquareUser } from 'lucide-react';
import { Briefcase, User, BarChart3 ,Shield } from 'lucide-react';

const SidebarItem = ({ icon: Icon, text, path }) => (
    <Link to={path} className="flex items-center justify-between p-3 mb-6 cursor-pointer hover:bg-gray-100">
        <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-500" />
            <span className="text-[17px] font-medium text-themeGreen">{text}</span>
        </div>
    </Link>
);

const Sidebar = () => {
    const menuItems = [
        { icon: LayoutDashboard, text: 'Dashboard', path: '/Dashboard' },
        { icon: Megaphone, text: 'Campaigns', path: '/campaign' },
        { icon: Users, text: 'Teams', path: '/teams' },
        { icon: UserCircle, text: 'Team Leaders', path: '/team-leaders' },
        { icon: UserCog, text: 'Sales Agent', path: '/sales-agents' },
        { icon: Briefcase, text: 'Operation Managers', path: '/ops_manager' },
        { icon: User, text: 'Senior Operation Managers', path: '/senior_ops_manager' },
        { icon: BarChart3, text: 'Head of Sales', path: '/heads_of_sales' },
        { icon: Shield, text: 'Admins Data', path: '/admin_management' },

        { icon: Shield, text: 'Head of Departments', path: '/head_of_departments' },
        { icon: Shield, text: 'Junior Department Heads', path: '/junior_department_heads' }
        
    ];


    return (
        <main className='duration-100 pt-6 pl-[70px]  w-[350px]'>
            <div className="text-lg antialiased text-themeGreen hover:text-themeGreen">
                <div className="flex flex-col w-[293px] mt-6 h-full">
                    <div className="w-72 border-r-2 border-themeGreen/10 h-screen ml-[-40px]">
                        {menuItems.map((item, index) => (
                            <SidebarItem key={index} icon={item.icon} text={item.text} path={item.path} />
                        ))}
                    </div>
                </div>
            </div>
        </main>

    );
};

export default Sidebar;