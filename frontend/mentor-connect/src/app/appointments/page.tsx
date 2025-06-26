"use client";
import React, { useEffect, useState } from "react";
import { Text, Container, Grid, Card, Group, Button, SegmentedControl } from "@mantine/core";
import api from "@/api";
import PrivateRoute from "@/components/PrivateRoute";
import { redirect, useRouter } from "next/navigation";

// Define the shape of an appointment
interface Appointment {
  id: number;
  mentorName: string;
  studentName: string; // Added for mentor view
  start_time: string;
  end_time: string;
  topic: string;
  date: string; // Date field
  status: "Pending" | "Confirmed" | "Rejected"; // Status for mentor
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("All"); // Filter state for segmented control
  const router = useRouter();
  const currentTime = new Date();

  // Helper function to combine date and time
  const combineDateAndTime = (date: string, time: string): Date => {
    const dateTimeString = `${date}T${time}`;
    return new Date(dateTimeString); // Parse the combined date and time into a valid Date object
  };

  // Fetch appointments and role from backend/localStorage
  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");
      console.log(storedRole)
      setRole(storedRole);

      if (!token) {
        redirect('/auth');
      }

      try {
        const response = (storedRole == "Mentee" ? await api.get<Appointment[]>("/appointments/") : await api.get<Appointment[]>("/mentor-appointments/"));
        setAppointments(response.data);
        console.log("hello: ", response.data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Helper functions
  const isUpcoming = (startTime: string): boolean => {
    const start = new Date(startTime);
    return start > currentTime;
  };

  const handleStatusChange = async (id: number, status: "Confirmed" | "Rejected") => {
    try {
      const data = {"status": status, "id": id}
      await api.post(`/mentor-appointments/`, data);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === id ? { ...appointment, status } : appointment
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Filter appointments based on the filter and upcoming status
  const filteredAppointments = appointments
  .filter((appointment) =>
    isUpcoming(combineDateAndTime(appointment.date, appointment.end_time).toISOString())
  )
  .filter((appointment) =>
    filter === "Confirmed" ? appointment.status === "Confirmed" : true
  )
  .sort((a, b) => {
    const aStartTime = combineDateAndTime(a.date, a.start_time);
    const bStartTime = combineDateAndTime(b.date, b.start_time);
    return aStartTime.getTime() - bStartTime.getTime(); // Sort in ascending order
  });

  // Handle loading and error states
  if (loading) {
    return (
      <Container>
        <Text fz="h2" ta="center" c="dimmed">
          Loading appointments...
        </Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text fz="h2" ta="center" c="red">
          {error}
        </Text>
      </Container>
    );
  }

  return (
    <PrivateRoute>
      <Container>
        <Text fz="h1" fw="bold" ta="center" mb="xl">
          Upcoming Appointments
        </Text>

        <SegmentedControl
          fullWidth
          size="md"
          value={filter}
          color="cyan"
          onChange={setFilter}
          data={[
            { label: "All Appointments", value: "All" },
            { label: "Confirmed Appointments", value: "Confirmed" },
          ]}
          mb="xl"
        />

        <Grid gutter="lg">
          {filteredAppointments.map((appointment, index) => {
            const startTime = combineDateAndTime(appointment.date, appointment.start_time);
            const endTime = combineDateAndTime(appointment.date, appointment.end_time);
            const date = new Date(appointment.date).toLocaleDateString();
            console.log(date)
            return (
              <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={index}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text fz="h3" fw="bold">
                        {role === "Mentor" ? `Student: ${appointment.studentName}` : `Mentor: ${appointment.mentorName}`}
                      </Text>
                      <Text fz="sm" c="dimmed">
                        Topic: {appointment.topic}
                      </Text>

                      {/* Date below Topic */}
                      <Text fz="sm" fw="500" mt="xs">
                        Date: {date}
                      </Text>

                      {/* Time Information */}
                      <Group mt="xs">
                        <Text fz="sm" fw="500">
                          Start Time: {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <Text fz="sm" fw="500">
                          End Time: {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </Group>
                    </div>

                    {/* Status and Buttons */}
                    <div style={{ textAlign: "right" }}>
                      <Text
                        fz="sm"
                        fw="bold"
                        c={
                          appointment.status === "Pending"
                            ? "yellow"
                            : appointment.status === "Confirmed"
                            ? "green"
                            : "red"
                        }
                      >
                        Status: {appointment.status || "Pending"}
                      </Text>

                      {/* Confirm and Reject Buttons */}
                      {role === "Mentor" && appointment.status === "Pending" && (
                        <div style={{ marginTop: "1rem" }}>
                          <Button
                            variant="gradient"
                            gradient={{ from: "#74b816", to: "#2f9e44" }}
                            fullWidth
                            onClick={() => handleStatusChange(appointment.id, "Confirmed")}
                            style={{ marginBottom: "0.5rem" }}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="gradient"
                            gradient={{ from: "#f76707", to: "#e03131" }}
                            fullWidth
                            onClick={() => handleStatusChange(appointment.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {/* Start Chat Button */}
                      {appointment.status === "Confirmed" &&
                        currentTime >= startTime &&
                        currentTime <= endTime && (
                          <Button
                            variant="gradient"
                            gradient={{ from: "cyan", to: "blue" }}
                            fullWidth
                            style={{ marginTop: "1rem" }}
                            onClick={() => {
                              router.push(`/chat/${appointment.id}`);
                            }}
                          >
                            Start Chat
                          </Button>
                        )}
                    </div>
                  </Group>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Container>
    </PrivateRoute>
  );
}
