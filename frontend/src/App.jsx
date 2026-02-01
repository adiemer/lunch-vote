import { useEffect, useState } from "react";

function App() {
  const users = ["Mom", "Joanna", "Cristie", "Angie", "Andrew"];
  const [selectedUser, setSelectedUser] = useState("");
  const [votes, setVotes] = useState([]);
  const [restaurant, setRestaurant] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState(null);

  function fetchVotes() {
    // ✅ Function declarations are hoisted
    fetch("http://localhost:8080/votes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("admin:admin"),
      },
      credentials: "include", // ✅ crucial for Basic Auth + CORS
    })
      .then((res) => res.json())
      .then((data) => setVotes(data))
      .catch((err) => setError(err.message));
  }

  // Fetch votes on page load
  useEffect(() => {
    fetchVotes();
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:8080/votes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("admin:admin"),
      },
      credentials: "include",
      body: JSON.stringify({
        restaurant,
        comment,
        username: selectedUser,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Vote submission failed");
        return res.json();
      })
      .then((data) => {
        setVotes([...votes, data]);
        setRestaurant("");
        setComment("");
        setSelectedUser("");
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Sunday Lunch Vote</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <div>
          {users.map((user) => (
            <label key={user}>
              <input
                type="radio"
                value={user}
                checked={selectedUser === user}
                onChange={(e) => setSelectedUser(e.target.value)}
              />
              {user}
            </label>
          ))}
        </div>
        <input
          type="text"
          placeholder="Restaurant"
          value={restaurant}
          onChange={(e) => setRestaurant(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit">Vote</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {votes.length === 0 ? (
          <li>No votes yet</li>
        ) : (
          votes.map((vote) => (
            <li key={vote.id}>
              <strong>{vote.restaurant}</strong>
              {vote.comment && ` — ${vote.comment}`}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default App;
