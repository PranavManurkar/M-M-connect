import React, { useState, useContext, useEffect } from "react";
import { AppShell, NavLink, Button, Group } from "@mantine/core";
import { IconHome, IconCalendarWeek, IconHeart, IconUserCircle, IconLogout, IconX, IconLogin } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthContext } from "../contexts/AuthContext"; // Import AuthContext
import { usePathname } from "next/navigation"; // Import to get the current URL path

interface NavbarProps {
    opened: boolean;
    close: () => void;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    hovered: boolean;
    showLabels: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ 
    opened, 
    close, 
    handleMouseEnter, 
    handleMouseLeave, 
    hovered, 
    showLabels 
}) => {
    // Use the AuthContext to check authentication status
    const { isAuthenticated, setIsAuthenticated } = useContext<any>(AuthContext);
    const router = useRouter();
    const pathname = usePathname(); // Get the current path
    let role;
    if (isAuthenticated) {
        role = localStorage.getItem("role");
    }

    // Dynamically set activeTab based on the URL
    const [activeTab, setActiveTab] = useState<string | null>(pathname);

    useEffect(() => {
        setActiveTab(pathname);
    }, [pathname]); // Update activeTab when the URL changes

    const handleLogout = () => {
        setActiveTab("/auth");
        router.push("/auth");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("user_id");
        setIsAuthenticated(false);
    };

    const username = localStorage.getItem("username");

    return (
        <AppShell.Navbar
            p="md"
            style={{
                transition: "width 0.3s ease",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Close button for mobile */}
            {opened && (
                <Group mb="sm">
                    <Button
                        variant="subtle"
                        onClick={close}
                        leftSection={<IconX size={16} />}
                    >
                        Close
                    </Button>
                </Group>
            )}

            {/* Navbar Links */}
            <NavLink
                component={Link}
                href="/"
                label={showLabels ? "Home" : null}
                leftSection={<IconHome stroke={1.5} />}
                active={activeTab === "/"}
            />
            {isAuthenticated ? (
                <>
                    <NavLink
                        component={Link}
                        href="/appointments"
                        label={showLabels ? "Appointments" : null}
                        leftSection={<IconCalendarWeek stroke={1.5} />}
                        active={activeTab === "/appointments"}
                    />
                    {role == "Mentee" && (
                        <NavLink
                            component={Link}
                            href="/favorites"
                            label={showLabels ? "Favorite Mentors" : null}
                            leftSection={<IconHeart stroke={1.5} />}
                            active={activeTab === "/favorites"}
                        />
                    )}

                    {role == "Mentor" && (
                        <NavLink
                            component={Link}
                            href="/profile"
                            label={showLabels ? "Profile" : null}
                            leftSection={<IconUserCircle stroke={1.5} />}
                            active={activeTab === "/profile"}
                        />
                    )}
                    <NavLink
                        label={showLabels ? "Logout" : null}
                        description={showLabels ? `@${username}` : null}
                        leftSection={<IconLogout stroke={1.5} />}
                        onClick={handleLogout}
                    />
                </>
            ) : (
                <NavLink
                    component={Link}
                    href="/auth"
                    label={showLabels ? "Login" : null}
                    leftSection={<IconLogin stroke={1.5} />}
                    active={activeTab === "/auth"}
                />
            )}
        </AppShell.Navbar>
    );
};

export default Navbar;
