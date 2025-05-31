import { useState, useEffect, useMemo } from "react";
import { Menu } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  HomeOutlined,
  UserDeleteOutlined,
  UnorderedListOutlined,
  ProfileOutlined,
  ScheduleOutlined,
  MinusSquareOutlined,
  SnippetsOutlined,
  VideoCameraAddOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "./AdminMenu.scss";
import PropTypes from "prop-types";

const AdminMenu = ({ onLogout }) => {
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [lastOpenKeys, setLastOpenKeys] = useState([]);

  // Map paths to menu keys
  const pathToKeyMap = useMemo(
    () => ({
      "/adminpage": "1",
      "/sopending": "2",
      "/userlist": "3.1",
      "/adminlist": "3.2",
      "/soaccount": "3.3",
      "/adminpackage": "4.1",
      "/createpackage": "4.2",
      "/adminpayment": "5",
    }),
    []
  );

  // Initialize menu state
  useEffect(() => {
    const savedState = localStorage.getItem("adminMenuState");
    const currentPathKey = pathToKeyMap[location.pathname] || "";

    let newOpenKeys = [];
    let newSelectedKeys = [];

    if (savedState) {
      const parsedState = JSON.parse(savedState);
      newOpenKeys = parsedState.openKeys;
      newSelectedKeys = parsedState.selectedKeys;
    }

    // If current path is in a submenu, ensure parent is open
    if (currentPathKey.includes(".") && !newOpenKeys.includes("3")) {
      newOpenKeys = ["3", ...newOpenKeys];
    }

    // Set current path as selected if it exists in our map
    if (currentPathKey) {
      newSelectedKeys = [currentPathKey];
    }

    setOpenKeys(newOpenKeys);
    setSelectedKeys(newSelectedKeys);
    setLastOpenKeys(newOpenKeys);
  }, [location.pathname, pathToKeyMap]);

  // Handle submenu open/close
  const handleOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => !openKeys.includes(key));
    const newOpenKeys = latestOpenKey ? [latestOpenKey] : [];

    setOpenKeys(newOpenKeys);
    setLastOpenKeys(newOpenKeys);
    persistMenuState(newOpenKeys, selectedKeys);
  };

  // Persist state to localStorage
  const persistMenuState = (currentOpenKeys, currentSelectedKeys) => {
    localStorage.setItem(
      "adminMenuState",
      JSON.stringify({
        openKeys: currentOpenKeys,
        selectedKeys: currentSelectedKeys,
      })
    );
  };

  // Menu items configuration
  const items = [
    {
      key: "1",
      icon: <UnorderedListOutlined />,
      label: <Link to="/adminpage">Dashboard</Link>,
    },
    {
      key: "2",
      icon: <SettingOutlined />,
      label: <Link to="/sopending">School Owner Pending</Link>,
    },
    {
      key: "3",
      icon: <SettingOutlined />,
      label: <Link to="/adpending">Advertiser Pending</Link>,
    },
    {
      key: "4",
      icon: <UserOutlined />,
      label: "User Management",
      children: [
        {
          key: "4.1",
          icon: <UserDeleteOutlined />,
          label: <Link to="/userlist">User List</Link>,
        },
        {
          key: "4.2",
          icon: <UserDeleteOutlined />,
          label: <Link to="/advertiseraccount">Advertiser Account</Link>,
        },
        {
          key: "4.3",
          icon: <HomeOutlined />,
          label: <Link to="/soaccount">School Owner Account</Link>,
        },
      ],
    },
    {
      key: "5",
      icon: <ScheduleOutlined />,
      label: "Package Management",
      children: [
        {
          key: "5.1",
          icon: <ProfileOutlined />,
          label: <Link to="/adminpackage">Admin Package</Link>,
        },
        {
          key: "5.2",
          icon: <MinusSquareOutlined />,
          label: <Link to="/createpackage">Create Package</Link>,
        },
      ],
    },
    {
      key: "6",
      icon: <SnippetsOutlined />,
      label: <Link to="/adminpayment">Admin Payment Management</Link>,
    },
    {
      key: "7",
      icon: <VideoCameraAddOutlined />,
      label: <Link to="/ads">Ads Management</Link>,
    },
    {
      key: "8",
      icon: <CalendarOutlined />,
      label: <Link to="/schedule-management">Schedule Management</Link>,
    },
    {
      key: "9",
      icon: <LogoutOutlined />,
      label: "Log out",
      onClick: onLogout,
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKeys}
      onOpenChange={handleOpenChange}
      onSelect={({ selectedKeys: newSelectedKeys }) => {
        // Keep the submenu open when selecting items
        setSelectedKeys(newSelectedKeys);
        setOpenKeys(lastOpenKeys);
        persistMenuState(lastOpenKeys, newSelectedKeys);
      }}
      items={items}
      className="admin-menu"
      forceSubMenuRender={true} // Important for smooth transitions
    />
  );
};

AdminMenu.propTypes = {
  onLogout: PropTypes.func,
};

export default AdminMenu;
