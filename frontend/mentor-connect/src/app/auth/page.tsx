"use client";

import React, { useContext, useState } from "react";
import {
  Container,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Select,
  Group,
  Anchor,
  Text,
  Title,
} from "@mantine/core";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/AuthContext";
import { jwtDecode } from 'jwt-decode';
import api from "@/api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [formValues, setFormValues] = useState({
    name: "",
    username: "",
    email: "",
    role: "Mentee",
    password: "",
    confirmPassword: "",
  });
  const router = useRouter();
  const handleInputChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };
  const { setIsAuthenticated } = useContext<any>(AuthContext);
  const handleSubmit = async (e : any) => {
    e.preventDefault();
    if (isLogin) {
      try{
      const response = await api.post('/token/', {
        email: formValues.email,
        password: formValues.password
      });
      
      const { access, refresh } = response.data;  
      const decodedToken = jwtDecode<any>(access); // jwt_decode parses the JWT
      localStorage.setItem('token', access);   
      localStorage.setItem('username', decodedToken.username);  
      localStorage.setItem('user_id', decodedToken.user_id);  
      localStorage.setItem('role', decodedToken.role);  
      localStorage.setItem('refresh_token', refresh);  
      console.log(access);
      setIsAuthenticated(true); 
      alert(`Logged in with Email: ${formValues.email}`);
      router.push("/")
    } catch(err : any) {
        alert(err.response?.data?.detail || "Login failed. Please try again.");
    }} 
    else {
      if (formValues.password !== formValues.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      try {
      
        const response = await api.post('/signup/', {
          email: formValues.email,
          username: formValues.username,
          name: formValues.name,
          role: formValues.role,          
          password: formValues.password,
        });
  
        
        alert('Registration Successful');
        router.push('/auth');
      } catch (err : any) {
        alert(err.response?.data?.detail || "Signup failed. Please try again.");
      }
  
      alert(`Registered with Email: ${formValues.email}`);
    }
  };

  return (
    <Container size={400} my={40}>
      <Title ta="center" mb={20}>
        {isLogin ? "Welcome Back" : "Create an Account"}
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        {isLogin
          ? "Don't have an account yet? "
          : "Already have an account? "}
        <Anchor
          size="sm"
          onClick={() => setIsLogin(!isLogin)}
          style={{ cursor: "pointer" }}
        >
          {isLogin ? "Register" : "Login"}
        </Anchor>
      </Text>
      <form onSubmit={handleSubmit}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {!isLogin && (
            <TextInput
                label="Name"
                placeholder="Your name"
                required
                value={formValues.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                mb="md"
            />
        )}
        
        {!isLogin && (
            <TextInput
                label="Username"
                placeholder="Your username"
                required
                value={formValues.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                mb="md"
            />
        )}
        <TextInput
          label="Email"
          placeholder="you@example.com"
          required
          value={formValues.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          mb="md"
        />
        {!isLogin && (
          <Select
          label="You're registering as a"
          value={formValues.role}
          required
          data={['Mentor', 'Mentee']}
          onChange={(value) => handleInputChange("role", value ? value : "Mentee")}
          mb = "md"
        />
        )}
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          value={formValues.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          mb="md"
        />
        {!isLogin && (
          <PasswordInput
            label="Confirm Password"
            placeholder="Re-enter your password"
            required
            value={formValues.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            mb="md"
          />
        )}
        <Group  mt="lg">
          <Button fullWidth variant="gradient" gradient={{from : "cyan", to : "blue"}} type="submit">
            {isLogin ? "Login" : "Register"}
          </Button>
        </Group>
      </Paper>
      </form>      
    </Container>
  );
}
