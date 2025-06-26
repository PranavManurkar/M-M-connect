"use client";

import React, { useState, useEffect } from "react";
import {
  Text,
  Container,
  TextInput,
  Grid,
  Card,
  Group,
  Button,
  Avatar,
  Loader,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { IconChevronRight } from "@tabler/icons-react";
import api from "@/api";
import PrivateRoute from "@/components/PrivateRoute";
type Mentor = {
  name: string;
  username: string;
  cumulative_rating: number;
  college: string;
  specialization: string;
  avatar: string;
};

const FavoritesPage = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setLoading(true);
        const response = await api.get("/favorites/"); 
        console.log(response)
        setMentors(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <Loader size="xl" variant="dots" />
        <Text ta="center" mt="lg">Loading favorite mentors...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text ta="center" color="red" fw="bold" mt="lg">
          {error}
        </Text>
      </Container>
    );
  }

  return (
    <PrivateRoute>
      <Container>
        <Text fz="h1" fw="bold" ta="center">
          Favorite Mentors
        </Text>
        <Text fz="h4" ta="center" mt="md" mb="lg">
          Search your favorite mentors or explore below.
        </Text>

        {/* Search Bar */}
        <TextInput
          placeholder="Search for a mentor by name..."
          size="lg"
          radius="md"
          mb="lg"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {/* Mentor Cards */}
        <Grid gutter="lg">
          {filteredMentors.map((mentor, index) => (
            <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={index}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group align="flex-start">
                  <Avatar src={mentor.avatar} radius="xl" size={90} mr="md" />

                  <div style={{ flex: 1 }}>
                    <Text fz="h3" fw="bold">
                      {mentor.name}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {mentor.college}
                    </Text>
                    <Group mt="sm">
                      <Text fz="sm" fw="500">
                        Specialization: {mentor.specialization}
                      </Text>
                      <Text fz="sm" fw="500" c="yellow">
                        ⭐ {mentor.cumulative_rating}
                      </Text>
                    </Group>
                  </div>

                  <Button
                    mt="xl"
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    size="compact-md"
                    onClick={() => router.push(`/mentor/${mentor.username}`)}
                  >
                    <IconChevronRight />
                  </Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </PrivateRoute>
  );
};

export default FavoritesPage;
