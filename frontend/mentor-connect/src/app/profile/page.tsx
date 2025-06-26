"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Group,
  Avatar,
  Text,
  TextInput,
  Button,
  Card,
  Title,
  FileInput,
} from "@mantine/core";
import api from "@/api";
import PrivateRoute from "@/components/PrivateRoute";

export default function MentorProfile() {
  const [mentorDetails, setMentorDetails] = useState({
    name: "",
    username: "",
    avatar: "",
    description: "",
    specialization: "",
    college: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newProfilePicture, setNewProfilePicture] = useState<any>(null);
  const user_id = localStorage.getItem("user_id")
  const router = useRouter();
  // Fetch mentor details
  useEffect(() => {
    const role = localStorage.getItem("role")
    if(role != "Mentor") {
      router.push("/")
    }
    const fetchMentorDetails = async () => {
      try {
        const response = await api.get(`/mentor-details/${user_id}/`); // Replace with dynamic ID if needed
        setMentorDetails(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      }
    };

    fetchMentorDetails();
  }, []);

  // Handle input changes
  const handleInputChange = (field : any, value : any) => {
    setMentorDetails((prevDetails) => ({ ...prevDetails, [field]: value }));
  };

  // Handle form submission
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("description", mentorDetails.description);
      formData.append("specialization", mentorDetails.specialization);
      formData.append("college", mentorDetails.college);
      if (newProfilePicture) {
        formData.append("avatar", newProfilePicture);
      }

      const response = await api.patch(`/mentor-details/${user_id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMentorDetails(response.data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };
  
  if (isLoading) {
    return <Text>Loading...</Text>;
  }
  console.log(mentorDetails)
  return (
    <PrivateRoute>
      <Container>
        <Group mt="xl" align="center">
          <Avatar
            src={mentorDetails.avatar || "https://via.placeholder.com/150"}
            radius="xl"
            size={100}
            alt={mentorDetails.name}
          />
          <div>
            <Text fz="h2" fw="bold">
              {mentorDetails.name}
            </Text>
            <Text fz="sm" c="dimmed">
              @{mentorDetails.username}
            </Text>
          </div>
        </Group>

        <Card shadow="sm" padding="lg" mt="xl" radius="md" withBorder>
          <Title order={3}>Edit Details</Title>
          <TextInput
            label="Description"
            placeholder="Enter your description"
            value={mentorDetails.description}
            onChange={(event) => handleInputChange("description", event.target.value)}
            mt="md"
          />
          <TextInput
            label="Specialization"
            placeholder="Enter your specialization"
            value={mentorDetails.specialization}
            onChange={(event) => handleInputChange("specialization", event.target.value)}
            mt="md"
          />
          <TextInput
            label="College"
            placeholder="Enter your college"
            value={mentorDetails.college}
            onChange={(event) => handleInputChange("college", event.target.value)}
            mt="md"
          />
          <FileInput
            label="Profile Picture"
            placeholder="Upload a new profile picture"
            value={newProfilePicture}
            onChange={setNewProfilePicture}
            accept="image/*"
            mt="md"
          />
          <Button
            mt="xl"
            variant="gradient"
            gradient={{ from: "blue", to: "cyan" }}
            onClick={handleUpdate}
          >
            Update Profile
          </Button>
        </Card>
      </Container>
    </PrivateRoute>
  );
}
