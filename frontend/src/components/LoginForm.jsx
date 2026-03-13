import React, { useState } from "react";
import { Container, Box, Typography, TextField, Button, Paper, InputAdornment, IconButton, Alert } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Notice we added { onLoginSuccess } here
const LoginForm = ({ onLoginSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  const formatPhone = (input) => {
    const digits = input.replace(/\D/g, "");
    return digits.length === 10 ? `+1${digits}` : `+${digits}`;
  };

  const handleSendPin = async (e) => {
    e.preventDefault();
    const finalPhone = formatPhone(phoneNumber);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: finalPhone }),
      });

      if (response.ok) {
        setStep(2);
        setMessage("Check your WhatsApp!");
      }
    } catch {
      setMessage("Server error. Is the backend running?");
    }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    const finalPhone = formatPhone(phoneNumber);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: finalPhone, pin: pin }),
      });

      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        // THIS IS THE KEY: We tell App.jsx we are done!
        if (onLoginSuccess) onLoginSuccess();
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || "Login failed");
      }
    } catch {
      setMessage("Verification failed.");
    }
  };

  // We ONLY render the login box.
  // If the user is logged in, App.jsx will handle hiding this component.
  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%", borderRadius: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            align="center"
            sx={{ fontWeight: "bold", color: "#1976d2" }}
          >
            Lunch Dash
          </Typography>

          {message && (
            <Alert severity={message.includes("error") || message.includes("failed") ? "error" : "info"} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {step === 1 ? (
            <Box component="form" onSubmit={handleSendPin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Phone Number"
                placeholder="555 555 5555"
                autoFocus
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+1</InputAdornment>,
                }}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                Send WhatsApp PIN
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyPin} sx={{ mt: 1 }}>
              <IconButton onClick={() => setStep(1)} sx={{ mb: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <TextField
                margin="normal"
                required
                fullWidth
                label="6-digit PIN"
                placeholder="123456"
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                inputProps={{ maxLength: 6 }}
              />
              <Button type="submit" fullWidth variant="contained" color="success" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                Verify & Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginForm;
