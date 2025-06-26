'use client';

import React from 'react';
import { Container, Text, Grid, Button, Center } from '@mantine/core';
import { useRouter } from 'next/navigation';
import {
  IconBrandHtml5,
  IconBrandOpenai,
  IconBrandDatabricks,
  IconShieldHalf,
  IconDatabase,
  IconBrandLeetcode,
  IconUsers,
} from '@tabler/icons-react';


function LandingPage( ) {
  const router = useRouter();
  const topics = [
    {
      name: 'Web Development',
      url: 'Web Development',
      gradient: { from: 'blue', to: 'cyan' },
      icon: <IconBrandHtml5 size={36} />,
    },
    {
      name: 'Machine Learning',
      url: 'Machine Learning',
      gradient: { from: 'teal', to: 'lime' },
      icon: <IconBrandOpenai size={36} />,
    },
    {
      name: 'Data Science',
      url: 'Data Science',
      gradient: { from: 'indigo', to: 'purple' },
      icon: <IconBrandDatabricks size={36} />,
    },
    {
      name: 'Cybersecurity',
      url: 'Cybersecurity',
      gradient: { from: 'red', to: 'yellow' },
      icon: <IconShieldHalf size={36} />,
    },
    {
      name: 'Database Management',
      url: 'Database Management',
      gradient: { from: 'yellow', to: 'orange' },
      icon: <IconDatabase size={36} />,
    },
    {
      name: 'Data Structures and Algorithms',
      url: 'Data Structures and Algorithms',
      gradient: { from: '#7048e8', to: '#1098ad' },
      icon: <IconBrandLeetcode size={36} />,
    },
  ];

  return (
    <Container ta="center" fluid my="md">
      <h1>
        <Text component="span" variant="text" c="cyan" inherit>
          Mentor Connect
        </Text>
      </h1>

      <Text fz="h2" fw="500" mb="md">
        Talk with India's {' '}
        <Text component="span" variant="gradient" gradient={{ from: 'purple', to: 'red' }} inherit>
          Top Mentors
        </Text>{' '}
        at the comfort of your home. <br />
        Choose a topic to get started. <br /><br />
      </Text>

      <Center>
        <Grid gutter="xl" justify="center" style={{ maxWidth: '800px' }}>
          {topics.map((topic, index) => (
            <Grid.Col span={{ base: 12, sm: 6 }} key={index}>
              <Button
                fz="h4"
                variant="gradient"
                gradient={topic.gradient}
                fullWidth
                style={{ height: '90px', fontSize: '18px', fontWeight: 600 }}
                leftSection={topic.icon}
                onClick={() => {
                  console.log("going to: ", topic.url);
                  router.push(`/topic/${topic.url}`)}}
              >
                {topic.name}
              </Button>
            </Grid.Col>
          ))}
          <Grid.Col span={{ base: 12, sm: 12 }}>
              <Button
                fz="h4"
                variant="gradient"
                gradient={{from: "#fa5252", to: "#e64980"}}
                fullWidth
                style={{ height: '90px', fontSize: '18px', fontWeight: 600 }}
                leftSection= {<IconUsers size={32}/>}
                onClick={() => router.push(`/topic/${"all"}`)}
              >
                Explore All
              </Button>
            </Grid.Col>
        </Grid>
      </Center>
    </Container>
  );
}

export default LandingPage;
