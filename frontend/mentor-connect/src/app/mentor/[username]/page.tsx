"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Group,
  Avatar,
  Text,
  SegmentedControl,
  Card,
  Grid,
  ActionIcon,
  Badge,
  Tooltip,
  TextInput,
  Button,
  Popover,
} from "@mantine/core";
import api from "@/api";
import dayjs from 'dayjs';
import { TimeInput, DateInput } from "@mantine/dates";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { AuthContext } from "@/contexts/AuthContext";

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

interface Review {
  rating: number;
  comment: string;
}

interface MentorDetails {
  name: string;
  username: string;
  avatar: string;
  description: string;
  college: string;
  specialization: string;
}


export default function MentorProfile() {
  const [activeTab, setActiveTab] = useState<"about" | "history" | "reviews" | "book">("about");
  const role = localStorage.getItem("role");
  const [isFavorite, setIsFavorite] = useState(false);
  const [formValues, setFormValues] = useState<{ date: Date | null; startTime: string; endTime: string }>({
    date: null,
    startTime: "",
    endTime: "",
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [newReview, setNewReview] = useState<{ rating: string; comment: string }>({ rating: "", comment: "" });
  const [reviewExists, setReviewExists] = useState(false);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const username = useParams<{ username: string }>().username;
  const { isAuthenticated } = useContext(AuthContext) ?? {};
  const cumulativeRating = reviews.length
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const [mentorDetails, setMentorDetails] = useState<MentorDetails>({
    name: "",
    username,
    avatar: "",
    description: "",
    college: "",
    specialization: "",
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const combineDateAndTime = (date: string, time: string): Date => {
    const dateTimeString = `${date}T${time}`;
    return new Date(dateTimeString); // Parse the combined date and time into a valid Date object
  };

  const handleInputChange = (field: string, value: any) => {
    setFormValues((prevValues) => ({ ...prevValues, [field]: value }));
  };

  const handleSubmit = async (e : any) => {
    e.preventDefault();
    try {
      const menteeId = localStorage.getItem("user_id");
      const mentorResponse = await api.post(`/id/`, { username });
      const mentorId = mentorResponse.data.id;

      const appointmentData = {
        mentee_id: parseInt(menteeId!, 10),
        mentor_id: mentorId,
        date: dayjs(formValues.date).format("YYYY-MM-DD"),
        start_time: formValues.startTime,
        end_time: formValues.endTime,
      };

      const appointmentResponse = await api.post(`/appointments/`, appointmentData);
      if (appointmentResponse.status === 201) {
        alert("Your appointment has been booked!");
        setFormValues({ date: null, startTime: "", endTime: "" });
      } else {
        throw new Error("Unexpected response from server.");
      }
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };
  const currentTime = new Date();
  const isNotUpcoming = (endTime: string): boolean => {
    const end = new Date(endTime);
    return end < currentTime;
  };

  const filteredAppointments = appointments
  .filter((appointment) =>
    isNotUpcoming(combineDateAndTime(appointment.date, appointment.end_time).toISOString())
  )
  .sort((a, b) => {
    const aStartTime = combineDateAndTime(a.date, a.start_time);
    const bStartTime = combineDateAndTime(b.date, b.start_time);
    return bStartTime.getTime() - aStartTime.getTime(); // Sort in ascending order
  });

  const tabData = [
    { label: "About", value: "about" },
    { label: "Reviews", value: "reviews" },
  ];

  if (isAuthenticated && role === "Mentee") {
    tabData.push({ label: "History", value: "history" });
    tabData.push({ label: "Book Appointment", value: "book" });
  }

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        const response = await api.post("/userdetails/", { username });
        const mentorResponse = await api.post(`/id/`, { username });
        const mentorId = mentorResponse.data.id;
        const mentorDetailsResponse = await api.get(`/mentor-details/${mentorId}/`);
        setMentorDetails({
          name: response.data[0].name,
          username,
          avatar: mentorDetailsResponse.data.avatar,
          college: mentorDetailsResponse.data.college,
          description: mentorDetailsResponse.data.description,
          specialization: mentorDetailsResponse.data.specialization,
        });

        const reviewResponse = await api.get(`/mentor/${mentorId}/reviews/`);
        setReviews(reviewResponse.data);
        if(isAuthenticated) {
          const reviewExistResponse = await api.get(`/mentor/${mentorId}/reviews/check/`);
          setReviewExists(reviewExistResponse.data.exists)
          const favoriteResponse = await api.get(`/favorites/${mentorId}/check/`);
          setIsFavorite(favoriteResponse.data.exists)
        }
      } catch (error) {
        console.error("Error fetching mentor details:", error);
      }
    };

    fetchMentorDetails();
  }, [username, reviewExists]);

  useEffect(() => {
    const syncRating = async () => {
      const formData = new FormData();
      formData.append("cumulative_rating", cumulativeRating);
      const mentorResponse = await api.post(`/id/`, { username });
      const mentorId = mentorResponse.data.id;
      const response = await api.patch(`/mentor-details/${mentorId}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    syncRating();
  }, [cumulativeRating]);

  useEffect(() => {
    const fetchAppointments = async () => {
      console.log("booo: ", role)
      if(isAuthenticated && role === "Mentee") {
        try {
          const mentorResponse = await api.post(`/id/`, { username });
          const mentorId = mentorResponse.data.id;
          const response =  await api.get<Appointment[]>(`/appointments/${mentorId}`);
          setAppointments(response.data);
          console.log("hello: ", response.data);
        } catch (err) {
          console.error("Error fetching appointments:", err);
          setError("Failed to load appointments");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchAppointments();
  }, [])

  const handleAddReview = async () => {
    if (newReview.rating && newReview.comment) {
      const review: Review = {
        rating: parseInt(newReview.rating, 10),
        comment: newReview.comment,
      };
      const mentorResponse = await api.post(`/id/`, { username });
      const mentorId = mentorResponse.data.id;
      const response = await api.post(`/mentor/${mentorId}/reviews/`, review)
      setReviews((prevReviews) => [...prevReviews, review]);
      setUserReview(review);
      setReviewExists(true);
      setShowPopover(false);
      setNewReview({ rating: "", comment: "" });
    }
  };

  const handleDeleteReview = async () => {
    if (reviewExists) {
      const mentorResponse = await api.post(`/id/`, { username });
      const mentorId = mentorResponse.data.id;
      const response = await api.delete(`/mentor/${mentorId}/reviews/`)
      console.log(response)
      setUserReview(null);
      setReviewExists(false);
    }
  };
  const handleFavorites = async () => {
    const mentorResponse = await api.post(`/id/`, { username });
    const mentorId = mentorResponse.data.id;
    if(isFavorite) {
      const response = await api.delete(`/favorites/${mentorId}/`)
    } else {
      const response = await api.post(`/favorites/${mentorId}/`)
    }
    setIsFavorite(!isFavorite)
  }
  return (
    <Container>
      <Group mt="xl" align="center">
        <Avatar
          src={mentorDetails.avatar}
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
        {isAuthenticated && (
          <Tooltip label={isFavorite ? "Remove from Favorites" : "Mark as Favorite"}>
          <ActionIcon
            variant="transparent"
            color={isFavorite ? "red" : "white"}
            aria-label="Settings"
            onClick={handleFavorites}
            size={36}
          >
            {isFavorite ? <IconHeartFilled size={36} /> : <IconHeart size={36} />}
          </ActionIcon>
        </Tooltip>
        )}        
      </Group>

      <SegmentedControl
        mt="xl"
        color="cyan"
        value={activeTab}
        onChange={(value) => setActiveTab(value as "about" | "history" | "reviews" | "book")}
        data={tabData}
      />

      <div>
        {activeTab === "about" && (
          <Card shadow="sm" padding="lg" mt="xl" radius="md" withBorder>
            <Text fz="h3" fw="bold" mb="md">
              About
            </Text>
            <Text fz="sm" mb="sm">
              <strong>Description:</strong> {mentorDetails.description}
            </Text>
            <Text fz="sm" mb="sm">
              <strong>Specialization:</strong> {mentorDetails.specialization}
            </Text>
          </Card>
        )}

        {activeTab === "history" && (
          <Grid gutter="lg" mt="xl">
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
  
                        {/* Start Chat Button */}
                        {appointment.status === "Confirmed" && (
                            <Button
                              variant="gradient"
                              gradient={{ from: "cyan", to: "blue" }}
                              fullWidth
                              style={{ marginTop: "1rem" }}
                              onClick={() => {
                                router.push(`/chat/${appointment.id}`);
                              }}
                            >
                              View Chat
                            </Button>
                          )}
                      </div>
                    </Group>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        )}

        {activeTab === "reviews" && (
          <Card shadow="sm" padding="lg" mt="xl" radius="md" withBorder>
            <Text fz="h3" fw="bold" mb="md">
              Reviews
            </Text>
            <Group justify="space-between">
            <Badge color={parseFloat(cumulativeRating) > 2.5 ? "teal" : "red"} mb="md" size="lg">
              Cumulative Rating: {cumulativeRating}/5
            </Badge>
            {isAuthenticated  && (
              <>
                {!reviewExists ? (
                <Popover
                  opened={showPopover}
                  onClose={() => setShowPopover(false)}
                  position="top"
                  withArrow
                  shadow="md"
                >
                  <Popover.Target>
                    <Button onClick={() => setShowPopover(true)} mb="md">
                      Write a Review
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <TextInput
                      label="Rating (1-5)"
                      placeholder="Enter rating"
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
                      required
                    />
                    <TextInput
                      label="Comment"
                      placeholder="Write your comment"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                      mt="md"
                    />
                    <Button mt="md" fullWidth onClick={handleAddReview}>
                      Submit Review
                    </Button>
                  </Popover.Dropdown>
                </Popover>
              ) : (
                <Button color="red" mb="md" onClick={handleDeleteReview}>
                  Delete Your Review
                </Button>
              )}
              </>
            )}            
            </Group>
            
            {reviews.map((review, index) => (
              <Card shadow="sm" padding="md" radius="md" withBorder mb="sm" key={index}>
                <Text fz="sm" fw="bold">
                  Rating: {review.rating}/5
                </Text>
                <Text fz="sm" mt="xs">
                  {review.comment}
                </Text>
              </Card>
            ))}
            
          </Card>
        )}

        {activeTab === "book" && (
          <Card shadow="sm" padding="lg" mt="xl" radius="md" withBorder>
            <form onSubmit={handleSubmit}>
              <Text fz="h3" fw="bold" mb="md">
                Book an Appointment
              </Text>
              <DateInput
                label="Date"
                placeholder="Pick a date"
                valueFormat="YYYY-MM-DD"
                value={formValues.date}
                onChange={(value) => handleInputChange("date", value)}
                required
                mt="md"
              />
              <TimeInput
                label="Start Time"
                value={formValues.startTime}
                onChange={(event) => handleInputChange("startTime", event.target.value)}
                required
                mt="md"
              />
              <TimeInput
                label="End Time"
                value={formValues.endTime}
                onChange={(event) => handleInputChange("endTime", event.target.value)}
                required
                mt="md"
              />
              <Button
                mt="xl"
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                type="submit"
                fullWidth
              >
                Submit
              </Button>
            </form>
          </Card>
        )}
      </div>
    </Container>
  );
}
