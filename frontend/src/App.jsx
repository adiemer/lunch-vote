import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
  Restaurant as FoodIcon,
} from "@mui/icons-material";
import LoginForm from "./components/LoginForm";

// 1. CONFIGURE THE DARK THEME
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#4db8ff", // Electric blue
    },
    secondary: {
      main: "#ffcc00", // Gold for labels
    },
    background: {
      default: "#121212", // Deep black/gray
      paper: "#1e1e1e", // Card/Dialog background
    },
    success: {
      main: "#2ecc71",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
  },
});

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [todayChoice, setTodayChoice] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [restaurantToSchedule, setRestaurantToSchedule] = useState(null);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", address: "", label: "" });
  const [myLabel, setMyLabel] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date());
  const [viewingDate, setViewingDate] = useState(todayStr);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}-${day}-${year}`;
  };

  const displayToday = formatDisplayDate(todayStr);

  const API_BASE = import.meta.env.VITE_API_URL;

  if (!API_BASE) {
    console.error("Missing VITE_API_URL! Make sure your .env file is set up.");
  }

  // --- API LOGIC ---
  const fetchRestaurants = () => {
    axios
      .get(`${API_BASE}/api/restaurants`)
      .then((res) => setRestaurants(res.data))
      .catch(() => console.error("Fetch failed"));
  };

  const fetchTargetChoice = (date) => {
    axios
      .get(`${API_BASE}/api/schedule?date=${date}`)
      .then((res) => setTodayChoice(res.data))
      .catch(() => setTodayChoice(null));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchRestaurants();
      fetchTargetChoice(viewingDate);
    }
  }, [viewingDate, isLoggedIn]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  const handleSaveRestaurant = () => {
    const url = editingId ? `${API_BASE}/api/restaurants/${editingId}` : `${API_BASE}/api/restaurants`;
    const method = editingId ? "put" : "post";
    axios[method](url, newRestaurant)
      .then(() => {
        setIsModalOpen(false);
        fetchRestaurants();

        // If we just edited the restaurant that is currently the "Today Choice"
        // we should update the myLabel textfield to match the new name/label
        if (todayChoice && todayChoice.restaurantId === editingId) {
          setMyLabel(newRestaurant.label || "");
        }

        setNotification({ show: true, message: "Saved!", type: "success" });
      })
      .catch(() => setNotification({ show: true, message: "Error", type: "error" }));
  };

  const handleSaveDraft = () => {
    if (!restaurantToSchedule || !selectedDate) return;
    axios
      .post(`${API_BASE}/api/schedule/draft`, {
        restaurantId: restaurantToSchedule.id,
        lunchDate: selectedDate,
        label: myLabel || restaurantToSchedule.label || "",
      })
      .then((res) => {
        setTodayChoice(res.data);
        setViewingDate(selectedDate);
        setIsScheduleModalOpen(false);
      })
      .catch(() => setNotification({ show: true, message: "Draft failed", type: "error" }));
  };

  const confirmDelete = () => {
    axios.delete(`${API_BASE}/api/restaurants/${restaurantToDelete.id}`).then(() => {
      setIsDeleteModalOpen(false);
      fetchRestaurants();
    });
  };

  const handleFinalConfirm = async () => {
    setIsProcessing(true);
    try {
      await axios.post(`${API_BASE}/api/schedule/confirm`, {
        restaurantId: todayChoice.restaurantId,
        lunchDate: viewingDate,
        label: myLabel || todayChoice.label || "",
      });
      setNotification({ show: true, message: "🚀 Team Notified!", type: "success" });
    } catch {
      setNotification({ show: true, message: "Broadcast failed", type: "error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelect = async (restaurantId) => {
    const selectedRest = restaurants.find((r) => r.id === restaurantId);

    // LOGIC: If we already have text in the custom box, use it.
    // Otherwise, use the restaurant's default label.
    const currentLabelValue = myLabel.trim() !== "" ? myLabel : selectedRest?.label || "";

    try {
      const res = await axios.post(`${API_BASE}/api/schedule/draft`, {
        restaurantId,
        lunchDate: viewingDate,
        label: currentLabelValue, // Send the current live label
      });

      setTodayChoice(res.data);
      // Keep the textfield in sync with what the DB just confirmed
      setMyLabel(res.data.label || "");
    } catch (err) {
      console.error("Selection failed", err);
    }
  };

  // --- RENDER ---
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {!isLoggedIn ? (
        <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <Box sx={{ minHeight: "100vh" }}>
          <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid #333" }}>
            <Toolbar>
              <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 900 }}>
                LUNCH DASH
              </Typography>

              {/* Add the date to the AppBar */}
              <Typography variant="body2" sx={{ mr: 2, opacity: 0.7 }}>
                {displayToday}
              </Typography>

              <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
            {/* ANNOUNCEMENT HEADER */}
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 4, mb: 4, borderColor: "#333" }}>
              <Typography color="primary" variant="overline" sx={{ letterSpacing: 2, fontWeight: "bold" }}>
                {viewingDate === todayStr
                  ? `TODAY (${formatDisplayDate(viewingDate)})`
                  : `PLAN FOR ${formatDisplayDate(viewingDate)}`}
              </Typography>

              {todayChoice ? (
                <Box sx={{ my: 2 }}>
                  <Typography variant="h3">{todayChoice.restaurantName}</Typography>
                  <Typography variant="h6" color="text.secondary">
                    {todayChoice.restaurantAddress}
                  </Typography>
                  <Typography variant="h5" color="secondary" sx={{ mt: 2, fontWeight: "bold" }}>
                    🏷️{" "}
                    {myLabel.trim() !== ""
                      ? myLabel
                      : todayChoice?.label || todayChoice?.restaurantLabel || "Regular Lunch"}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="h5" sx={{ my: 3, opacity: 0.5 }}>
                  No plans yet.
                </Typography>
              )}

              <Box sx={{ mt: 3, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  fullWidth
                  variant="filled"
                  label="Custom Label"
                  value={myLabel}
                  onChange={(e) => setMyLabel(e.target.value)}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFinalConfirm}
                  disabled={!todayChoice || isProcessing}
                  sx={{ minWidth: 260, fontWeight: "bold" }}
                >
                  {isProcessing ? <CircularProgress size={24} /> : `🚀 SEND ANNOUNCEMENT ${viewingDate}`}
                </Button>
              </Box>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
              <Typography variant="h4">Spots</Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
                Add
              </Button>
            </Box>

            <Grid container spacing={3}>
              {restaurants.map((r) => (
                <Grid item xs={12} sm={6} md={4} key={r.id}>
                  <Card
                    variant="outlined"
                    onClick={() => handleSelect(r.id)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 3,
                      borderColor: todayChoice?.restaurantId === r.id ? "primary.main" : "#333",
                      bgcolor: todayChoice?.restaurantId === r.id ? "rgba(77, 184, 255, 0.05)" : "background.paper",
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRestaurantToSchedule(r);
                            setIsScheduleModalOpen(true);
                          }}
                        >
                          <CalendarIcon color="primary" fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(r.id);

                            // LOGIC: If I'm editing the highlighted card,
                            // use my custom typed label. Otherwise, use the DB label.
                            const labelToEdit =
                              todayChoice?.restaurantId === r.id && myLabel.trim() !== "" ? myLabel : r.label || "";

                            setNewRestaurant({ ...r, label: labelToEdit });
                            setIsModalOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRestaurantToDelete(r);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                        {r.name}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ mt: 2, color: "secondary.main", fontWeight: "bold" }}>
                        {todayChoice?.restaurantId === r.id
                          ? myLabel.trim() !== ""
                            ? myLabel
                            : todayChoice.label || r.label
                          : r.label || "No label set"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* MODALS */}
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>{editingId ? "Edit" : "New"} Spot</DialogTitle>
            <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
              <TextField
                label="Name"
                fullWidth
                value={newRestaurant.name}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
              />
              <TextField
                label="Address"
                fullWidth
                value={newRestaurant.address}
                onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
              />
              <TextField
                label="Label"
                fullWidth
                value={newRestaurant.label || ""} // Ensures it never passes null to the input
                onChange={(e) => setNewRestaurant({ ...newRestaurant, label: e.target.value })}
                placeholder="e.g. 1792"
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveRestaurant} variant="contained">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)}>
            <DialogTitle>Schedule {restaurantToSchedule?.name}</DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" color="secondary" sx={{ mb: 2, fontWeight: "bold" }}>
                Setting schedule for: {formatDisplayDate(selectedDate)}
              </Typography>

              <TextField
                type="date"
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
                value={selectedDate} // Logical value (raw)
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSaveDraft} variant="contained">
                Schedule
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
            <DialogTitle>Delete {restaurantToDelete?.name}?</DialogTitle>
            <DialogActions>
              <Button onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button onClick={confirmDelete} color="error">
                Delete
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={notification.show}
            autoHideDuration={3000}
            onClose={() => setNotification({ ...notification, show: false })}
          >
            <Alert severity={notification.type} variant="filled">
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;
