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
import api from "@/api"; // Ensure this points to your Axios setup or API service

type TopicDetailsProps = {
  topic: string;
};

interface Mentor {
  name: string;
  username: string;
  rating: number;
  college: string;
  specialization: string;
  avatar: string; // Avatar URL
}

const TopicDetails = ({ topic }: TopicDetailsProps) => {
  const router = useRouter();
  const formattedTopic = decodeURIComponent(topic);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.get(`/mentor-list/${topic}/`);
        const sortedMentors = response.data.sort(
          (a: Mentor, b: Mentor) => b.rating - a.rating
        ); 
        setMentors(response.data);
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, [topic]);

  // Filter mentors based on the search input
  const filteredMentors = mentors.filter((mentor) =>
    mentor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Container>
      {formattedTopic == "all" ? (
        <>
        <Text fz="h1" fw="bold" ta="center">
            All mentors
          </Text>
          <Text fz="h4" ta="center" mt="md" mb="lg">
            Search among all mentors or explore the top mentors below.
          </Text>
        </>
      ) : (
        <>
          <Text fz="h1" fw="bold" ta="center">
            {formattedTopic}
          </Text>
          <Text fz="h4" ta="center" mt="md" mb="lg">
            Search for mentors in {formattedTopic} or explore the top mentors below.
          </Text>
        </>
      )}
      

      {/* Search Bar */}
      <TextInput
        placeholder="Search for a mentor by name..."
        size="lg"
        radius="md"
        mb="lg"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {/* Loader while fetching data */}
      {loading ? (
        <Loader size="lg" style={{ display: "block", margin: "auto" }} />
      ) : (
        <Grid gutter="lg">
          {(filteredMentors.length > 0 ? filteredMentors : mentors).map(
            (mentor, index) => (
              <Grid.Col span={{ base: 12, md: 12, lg: 12 }} key={index}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Group align="start" justify="space-between">
                    {/* Mentor Avatar */}
                    <Avatar
                      src={mentor.avatar}
                      alt={mentor.name}
                      size={90}
                      radius="xl"
                      mr="md"
                    />
                    <div style={{ flex: 1, marginLeft: "12px" }}>
                      {/* Mentor Details */}
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
                          ⭐ {mentor.rating}
                        </Text>
                      </Group>
                    </div>
                    {/* Action Button */}
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
            )
          )}
        </Grid>
      )}
    </Container>
  );
};

export default TopicDetails;
