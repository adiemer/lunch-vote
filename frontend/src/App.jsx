import { useState, useEffect } from "react";
import axios from "axios";

const styles = {
  container: {
    backgroundColor: "#1a1a1b",
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 10px",
    boxSizing: "border-box",
  },
  card: {
    backgroundColor: "#272729",
    padding: "clamp(15px, 5vw, 30px)",
    borderRadius: "20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
    width: "100%",
    maxWidth: "1000px",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    position: "relative",
  },
  title: { textAlign: "center", marginBottom: "30px", color: "white" },
  headerSection: {
    backgroundColor: "#333335",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "25px",
    textAlign: "center",
    border: "1px solid #444",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "15px",
    width: "100%",
    marginTop: "20px",
  },
  restaurantCard: {
    backgroundColor: "#333335",
    padding: "15px",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    border: "2px solid transparent",
    minHeight: "110px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    wordBreak: "break-word",
  },
  circleButton: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    border: "none",
    backgroundColor: "#444",
    color: "white",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    padding: 0,
  },
  editBtn: {
    backgroundColor: "rgba(77, 184, 255, 0.2)",
    color: "#4db8ff",
    border: "1px solid #4db8ff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    cursor: "pointer",
    padding: "0",
  },
  deleteBtn: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    color: "#ff4d4d",
    border: "1px solid rgba(255, 77, 77, 0.3)",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    cursor: "pointer",
  },
  addButton: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
  confirmButton: {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#272729",
    padding: "25px",
    borderRadius: "15px",
    width: "90%",
    maxWidth: "350px",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "5px",
    border: "1px solid #444",
    backgroundColor: "#1a1a1b",
    color: "white",
    boxSizing: "border-box",
  },
  successMessage: {
    backgroundColor: "#28a745",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
  },
  closeToast: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0 5px",
  },
  adminControls: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "20px",
    color: "white",
  },
};

function App() {
  const [restaurants, setRestaurants] = useState([]);
  const [todayChoice, setTodayChoice] = useState(null);
  //const [selectedId, setSelectedId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [restaurantToSchedule, setRestaurantToSchedule] = useState(null);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", address: "", label: "" });
  const [myLabel, setMyLabel] = useState("");
  const [successDetails, setSuccessDetails] = useState({
    show: false,
    message: "",
    type: "success", // default type
  });

  const todayStr = new Intl.DateTimeFormat("en-CA").format(new Date());
  const [viewingDate, setViewingDate] = useState(todayStr);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${month}-${day}-${year}`;
  };

  const fetchRestaurants = () => {
    axios
      .get("http://localhost:8080/api/restaurants")
      .then((res) => setRestaurants(res.data))
      .catch((err) => console.error("Error fetching restaurants", err));
  };

  const fetchTargetChoice = (date) => {
    axios
      .get(`http://localhost:8080/api/schedule?date=${date}`)
      .then((res) => setTodayChoice(res.data))
      .catch(() => setTodayChoice(null));
  };

  useEffect(() => {
    fetchRestaurants();
    fetchTargetChoice(viewingDate);
  }, [viewingDate]);
  const handleSaveDraft = () => {
    if (!restaurantToSchedule || !selectedDate) return;

    const payload = {
      restaurantId: restaurantToSchedule.id,
      lunchDate: selectedDate,
    };

    axios
      .post("http://localhost:8080/api/schedule/draft", payload)
      .then((res) => {
        setTodayChoice(res.data);

        setViewingDate(selectedDate);
        setIsScheduleModalOpen(false); // Fixes the 'setModal' is broken error
      })
      .catch((err) => console.error("Draft failed:", err));
  };

  // --- 2. THE MAIN PAGE "CONFIRM" (Saves to DB + Sends Text) ---
  const handleFinalConfirm = () => {
    // Use todayChoice.restaurantId because the draft is already saved in DB
    if (!todayChoice) {
      setSuccessDetails({
        show: true,
        message: "Whoops! Please select a restaurant before confirming.",
        type: "warning",
      });
      setTimeout(() => setSuccessDetails({ show: false, message: "", type: "success" }), 4000);
      return;
    }

    const payload = {
      restaurantId: todayChoice.restaurantId,
      lunchDate: viewingDate,
      // FIX: If there is a label in todayChoice, use it.
      // Otherwise, fallback to the current input box.
      label: todayChoice.label || myLabel,
    };

    axios
      .post("http://localhost:8080/api/schedule/confirm", payload)
      .then(() => {
        setSuccessDetails({ show: true, message: "Announcement sent to the team!" });
        // OPTIONAL: Clear the label input after a successful broadcast
        setMyLabel("");
        setTimeout(() => setSuccessDetails({ show: false, message: "" }), 5000);
      })
      .catch((err) => {
        console.error("Broadcast failed", err);
        setSuccessDetails({
          show: true,
          message: "Server error: Could not send announcement.",
          type: "error",
        });
      });
  };

  const handleEditClick = (e, restaurant) => {
    e.stopPropagation();
    setEditingId(restaurant.id);
    setNewRestaurant({ name: restaurant.name, address: restaurant.address, label: restaurant.label });
    setIsModalOpen(true);
  };

  const handleSelect = async (restaurantId) => {
    // 1. Find the restaurant object from your list to get its specific label
    const selectedRest = restaurants.find((r) => r.id === restaurantId);

    // 2. Decide which label to send:
    // Prioritize the custom input (myLabel), otherwise use the Restaurant's own label.
    const finalLabel = myLabel || selectedRest?.label || "";

    const response = await fetch("http://localhost:8080/api/schedule/draft", {
      method: "POST",
      body: JSON.stringify({
        restaurantId,
        lunchDate: viewingDate,
        label: finalLabel, // Now it sends the attribute you see on the card!
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      const updatedSchedule = await response.json();
      setTodayChoice(updatedSchedule);
    }
  };

  const promptDelete = (e, restaurant) => {
    e.stopPropagation();
    setRestaurantToDelete(restaurant);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    axios
      .delete(`http://localhost:8080/api/restaurants/${restaurantToDelete.id}`)
      .then(() => {
        setIsDeleteModalOpen(false);
        if (todayChoice && todayChoice.restaurantId === restaurantToDelete.id) setTodayChoice(null);
        fetchRestaurants();
      })
      .catch((err) => console.error("Delete failed", err));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍴 Lunch Dash</h1>

        {/* DYNAMIC HEADER */}
        <div style={styles.headerSection}>
          <small style={{ color: "#aaa", textTransform: "uppercase", letterSpacing: "1px" }}>
            {viewingDate === todayStr ? "Today's Selection" : `Plan for ${formatDisplayDate(viewingDate)}`}
          </small>
          {todayChoice ? (
            <div>
              <h2 style={{ color: "#4db8ff", margin: "10px 0" }}>{todayChoice.restaurantName}</h2>
              <p style={{ fontSize: "14px", color: "#ccc", margin: 0 }}>{todayChoice.restaurantAddress}</p>
              {/* ADD THIS LINE BELOW TO TEST */}
              {todayChoice.label && (
                <p style={{ fontSize: "13px", color: "#ffcc00", fontWeight: "bold", marginTop: "5px" }}>
                  🏷️ Label: {todayChoice.label}
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: "#888", fontStyle: "italic", marginTop: "10px" }}>No plans yet for {viewingDate}</p>
          )}
          {viewingDate !== todayStr && (
            <button
              onClick={() => setViewingDate(todayStr)}
              style={{
                background: "none",
                border: "none",
                color: "#4db8ff",
                cursor: "pointer",
                fontSize: "12px",
                marginTop: "10px",
                textDecoration: "underline",
              }}
            >
              Return to Today
            </button>
          )}
        </div>

        {successDetails.show && (
          <div
            style={{
              ...styles.notificationPopup,
              backgroundColor:
                successDetails.type === "warning" ? "#ffcc00" : successDetails.type === "error" ? "#ff4444" : "#28a745",
              color: successDetails.type === "warning" ? "#000" : "#fff",
              padding: "15px 25px",
              borderRadius: "8px",
              position: "fixed",
              bottom: "20px",
              right: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              transition: "all 0.3s ease",
            }}
          >
            {successDetails.type === "warning" ? "⚠️ " : "✅ "}
            {successDetails.message}
          </div>
        )}

        <div style={{ width: "100%", marginBottom: "15px" }}>
          <input
            style={styles.input}
            placeholder="Add a label for this lunch (e.g. Birthday Party, Kickoff)..."
            value={myLabel}
            onChange={(e) => setMyLabel(e.target.value)}
          />
        </div>
        <div style={styles.adminControls}>
          <h3 style={{ margin: 0 }}>Available Spots</h3>
          <button style={styles.addButton} onClick={() => setIsModalOpen(true)}>
            + Add Restaurant
          </button>
        </div>

        <div style={styles.grid}>
          {restaurants.map((r) => (
            <div
              key={r.id}
              onClick={() => handleSelect(r.id)}
              style={{
                ...styles.restaurantCard,
                borderColor: todayChoice?.restaurantId === r.id ? "#4db8ff" : "transparent",
                backgroundColor: todayChoice?.restaurantId === r.id ? "#3d3d40" : "#333335",
              }}
            >
              {/* TOP RIGHT BUTTONS */}
              <div
                style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px", zIndex: 10 }}
              >
                <button
                  style={styles.circleButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    setRestaurantToSchedule(r);
                    setIsScheduleModalOpen(true);
                  }}
                >
                  📅
                </button>
                <button style={styles.editBtn} onClick={(e) => handleEditClick(e, r)}>
                  ✎
                </button>
                <button style={styles.deleteBtn} onClick={(e) => promptDelete(e, r)}>
                  ✕
                </button>
              </div>

              <h4 style={{ margin: "0 0 5px 0", paddingRight: "100px", color: "white" }}>{r.name}</h4>
              <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>{r.label}</p>
              {r.lastScheduledDate && (
                <p
                  style={{
                    fontSize: "11px",
                    color: "#4db8ff",
                    marginTop: "8px",
                    borderTop: "1px solid #444",
                    paddingTop: "4px",
                  }}
                >
                  📅 Scheduled: {r.lastScheduledDate}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          style={{
            ...styles.confirmButton,
            // Button is dimmed if nothing is selected for this date
            opacity: !todayChoice?.restaurantId ? 0.5 : 1,
          }}
          onClick={handleFinalConfirm}
          // Button is unclickable if nothing is selected
          disabled={!todayChoice?.restaurantId}
        >
          Confirm for {viewingDate === todayStr ? "Today" : formatDisplayDate(viewingDate)}
        </button>
      </div>

      {/* SCHEDULE MODAL */}
      {isScheduleModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, textAlign: "center", maxWidth: "400px" }}>
            <h2 style={{ marginTop: 0 }}>
              Schedule {restaurantToSchedule?.name} for {formatDisplayDate(selectedDate)}
            </h2>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.input}
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={handleSaveDraft} disabled={!selectedDate} style={{ ...styles.addButton, flex: 1 }}>
                Lock it in
              </button>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                style={{ ...styles.addButton, backgroundColor: "#666", flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0 }}>{editingId ? "Edit" : "New"} Restaurant</h2>
            <input
              style={styles.input}
              placeholder="Name"
              value={newRestaurant.name}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Address"
              value={newRestaurant.address}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
            />
            <input
              style={styles.input}
              placeholder="Category"
              value={newRestaurant.label}
              onChange={(e) => setNewRestaurant({ ...newRestaurant, label: e.target.value })}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  const action = editingId
                    ? axios.put(`http://localhost:8080/api/restaurants/${editingId}`, newRestaurant)
                    : axios.post("http://localhost:8080/api/restaurants", newRestaurant);
                  action.then(() => {
                    fetchRestaurants();
                    setIsModalOpen(false);
                    setEditingId(null);
                    setNewRestaurant({ name: "", address: "", label: "" });
                  });
                }}
                style={styles.addButton}
              >
                Save
              </button>
              <button onClick={() => setIsModalOpen(false)} style={{ ...styles.addButton, backgroundColor: "#666" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, textAlign: "center" }}>
            <h2 style={{ color: "#ff4d4d" }}>Confirm Delete</h2>
            <p>
              Delete <strong>{restaurantToDelete?.name}</strong>?
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={confirmDelete} style={{ ...styles.addButton, backgroundColor: "#ff4d4d", flex: 1 }}>
                Delete
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ ...styles.addButton, backgroundColor: "#666", flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
