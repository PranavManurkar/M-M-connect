"use client";

import React, { useState } from "react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { AppShell, Burger } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import Navbar from "@/components/Navbar";
import AuthProvider from "../contexts/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();
  const [hovered, setHovered] = useState(false); // State to handle hover effect
  const [showLabels, setShowLabels] = useState(false); // State to delay label rendering

  // Handle hover with delay for label rendering
  const handleMouseEnter = () => {
    setHovered(true);
    setTimeout(() => setShowLabels(true), 100);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setShowLabels(false);
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider defaultColorScheme="dark">
          <AuthProvider>
            <AppShell
              navbar={{
                width: hovered ? 300 : 80,
                breakpoint: "sm",
                collapsed: { mobile: !opened },
              }}
              styles={{
                root: {
                  height: "100vh",
                  width: "100vw",
                },
              }}
              padding="md"
            >
              <Navbar
                opened={opened}
                close={close}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
                hovered={hovered}
                showLabels={showLabels}
              />

              <AppShell.Main>
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                {children}
              </AppShell.Main>
            </AppShell>
          </AuthProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
