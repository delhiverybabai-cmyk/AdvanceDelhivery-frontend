import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const navItems = [
  { path: "/", label: "Overview" },
  { path: "/live-dispatch", label: "Live Dispatch" },
  { path: "/rider-management", label: "Rider Management" },
  { path: "/token-management", label: "Token Management" },
];

const styles = {
  header: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "72px",
  },
  leftSection: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  headerSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "3px",
  },
  nav: {
    display: "flex",
    gap: "28px",
    alignItems: "center",
    marginLeft: "60px",
  },
  navItem: {
    textDecoration: "none",
    color: "#e2e8f0",
    fontWeight: "600",
    fontSize: "16px",
    paddingBottom: "3px",
    transition: "color 0.17s, border-bottom 0.13s",
    borderBottom: "2.5px solid transparent",
  },
  navItemActive: {
    color: "#22d487",
    borderBottom: "2.5px solid #22d487",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    position: "relative",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "14px",
    overflow: "hidden",
    border: "2px solid rgba(59, 130, 246, 0.3)",
    cursor: "pointer",
    transition: "border-color 0.2s, transform 0.2s",
  },
  userAvatarHover: {
    borderColor: "#22d487",
    transform: "scale(1.05)",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  welcomeText: {
    fontSize: "14px",
    color: "#e2e8f0",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: "55px",
    right: "0",
    backgroundColor: "rgba(30, 41, 59, 0.98)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
    minWidth: "200px",
    padding: "8px 0",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease-in-out",
  },
  dropdownItem: {
    padding: "12px 20px",
    color: "#e2e8f0",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.15s, color 0.15s",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  dropdownItemHover: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    color: "#22d487",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "rgba(148, 163, 184, 0.2)",
    margin: "6px 0",
  },
};

const HeaderNav = () => {
  const navigate = useNavigate(); // ✅ Added navigate hook
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const dropdownRef = useRef(null);

  const avatarUrl = "https://pbs.twimg.com/media/Dy6ltwaV4AAiZ1r.jpg";
  const userInitials = "AD";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownAction = (action) => {
    console.log(`Action selected: ${action}`);
    setShowDropdown(false);

    if (action === "bulk-gi") {
      navigate("/bulk-gi");
    } else if (action === "waybill-formater") {
      navigate("/waybill-formater");
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.leftSection}>
          <span style={styles.headerTitle}>DeliveryPro</span>
          <span style={styles.headerSubtitle}>Management Console</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) =>
                isActive
                  ? { ...styles.navItem, ...styles.navItemActive }
                  : styles.navItem
              }
              end
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userSection} ref={dropdownRef}>
          <span style={styles.welcomeText}>Admin Dashboard</span>
          <div
            style={{
              ...styles.userAvatar,
              ...(isAvatarHovered ? styles.userAvatarHover : {}),
            }}
            onClick={() => setShowDropdown(!showDropdown)}
            onMouseEnter={() => setIsAvatarHovered(true)}
            onMouseLeave={() => setIsAvatarHovered(false)}
          >
            <img
              src={avatarUrl}
              alt="User Avatar"
              style={styles.avatarImage}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.textContent = userInitials;
              }}
            />
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div style={styles.dropdown}>
              <div
                style={{
                  ...styles.dropdownItem,
                  ...(hoveredItem === "bulk-gi"
                    ? styles.dropdownItemHover
                    : {}),
                }}
                onMouseEnter={() => setHoveredItem("bulk-gi")}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleDropdownAction("bulk-gi")}
              >
                <span>📦</span>
                <span>Bulk GI</span>
              </div>
              <div style={styles.dropdownDivider} />
              <div
                style={{
                  ...styles.dropdownItem,
                  ...(hoveredItem === "waybill-formater"
                    ? styles.dropdownItemHover
                    : {}),
                }}
                onMouseEnter={() => setHoveredItem("waybill-formater")}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleDropdownAction("waybill-formater")}
              >
                <span>📝</span>
                <span>Format String</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </header>
  );
};

export default HeaderNav;
