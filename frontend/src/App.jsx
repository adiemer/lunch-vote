import { useEffect, useState } from "react";

// 1. KEEP THESE OUTSIDE - This prevents React from losing track of the 'identity'
const USERS = ["Mom", "Joanna", "Cristie", "Angie", "Andrew"];

const AVATARS = {
  Mom: "👩‍🍳",
  Joanna: "👩‍🎨",
  Cristie: "👩‍🔬",
  Angie: "👩‍💼",
  Andrew: "👨‍💻",
};

const RESTAURANTS = [
  { id: "og", name: "Olive Garden", emoji: "🍝", color: "bg-green-100" },
  { id: "cpk", name: "CPK", emoji: "🍕", color: "bg-yellow-100" },
  { id: "cf", name: "Cheesecake Factory", emoji: "🍰", color: "bg-orange-100" },
  { id: "ch", name: "Chipotle", emoji: "🌯", color: "bg-red-100" },
  { id: "tx", name: "Texas Roadhouse", emoji: "🥩", color: "bg-amber-100" },
];

function App() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [votes, setVotes] = useState([]);
  const [error, setError] = useState(null);

  console.log("Render - User:", selectedUser, "Restaurant:", selectedRestaurant);

  const getTally = () => {
    const tally = {};
    votes.forEach((v) => {
      if (!tally[v.restaurant]) {
        tally[v.restaurant] = { count: 0, names: [] };
      }
      tally[v.restaurant].count++;
      if (v.username && !tally[v.restaurant].names.includes(v.username)) {
        tally[v.restaurant].names.push(v.username);
      }
    });
    return Object.entries(tally).map(([name, data]) => [name, data.count, data.names]);
  };

  const hasUserVoted = (username) => {
    return votes.some((v) => v.username === username);
  };

  function fetchVotes() {
    fetch("http://localhost:8080/votes", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("admin:admin"),
      },
    })
      .then((res) => res.json())
      .then((data) => setVotes(data))
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    fetchVotes();
  }, []);

  const handleSubmit = () => {
    console.log("Before submit - User:", selectedUser, "Restaurant:", selectedRestaurant);

    if (!selectedUser || !selectedRestaurant) return;

    if (!selectedUser || !selectedRestaurant) return;

    fetch("http://localhost:8080/votes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa("admin:admin"),
      },
      body: JSON.stringify({
        restaurant: selectedRestaurant,
        username: selectedUser,
        comment: "",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Vote submission failed");
        return res.json();
      })
      .then((data) => {
        setVotes([...votes, data]);
        setSelectedRestaurant("");
        setSelectedUser("");
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Sunday Lunch</h1>
          <p className="text-gray-500">Pick your name, then pick the spot!</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">1. Who are you?</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {USERS.map((user) => {
              const isSelected = selectedUser === user;
              return (
                <button
                  key={user}
                  type="button"
                  onClick={() => setSelectedUser(user)}
                  style={{
                    backgroundColor: isSelected ? "#2563eb" : "#f9fafb",
                    borderColor: isSelected ? "#3b82f6" : "transparent",
                    color: isSelected ? "white" : "black",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                  className="flex flex-col items-center p-3 rounded-xl transition-all duration-200 border-2 focus:outline-none"
                >
                  <span className="text-3xl mb-1" style={{ filter: isSelected ? "none" : "grayscale(100%)" }}>
                    {AVATARS[user]}
                  </span>
                  <span className="text-xs font-bold">{user}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 2: DESTINATION CARDS */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">2. Where to eat?</h2>
          <div className="grid grid-cols-2 gap-3">
            {RESTAURANTS.map((res) => {
              const isSelected = selectedRestaurant === res.name;
              return (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setSelectedRestaurant(res.name)}
                  style={{
                    backgroundColor: isSelected ? "#2563eb" : "#f9fafb",
                    borderColor: isSelected ? "#3b82f6" : "transparent",
                    color: isSelected ? "white" : "black",
                    transform: isSelected ? "scale(1.05)" : "scale(1)",
                  }}
                  className="p-4 rounded-2xl border-2 transition-all text-left focus:outline-none"
                >
                  <span className="text-3xl block mb-1">{res.emoji}</span>
                  <span className="font-black uppercase text-sm">{res.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* PUT IT HERE - REPLACE YOUR EXISTING BUTTON */}
        <button
          onClick={handleSubmit}
          disabled={!selectedUser || !selectedRestaurant || hasUserVoted(selectedUser)}
          className="w-full py-5 mb-10 bg-black text-white rounded-3xl font-black text-xl uppercase tracking-tighter disabled:opacity-20 transition-all active:scale-95"
        >
          {hasUserVoted(selectedUser) ? "You Already Voted!" : "Lock in Vote"}
        </button>

        {/* LEADERBOARD */}
        <section className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">The Leaderboard</h2>
          <div className="space-y-3">
            {getTally().length === 0 ? (
              <p className="text-center text-gray-400 italic py-4">No votes cast yet...</p>
            ) : (
              getTally().map(([name, count, namesArray]) => {
                const resData = RESTAURANTS.find((r) => r.name === name);
                const percent = (count / votes.length) * 100;
                const voterList = namesArray.join(", ");

                return (
                  <div
                    key={name}
                    className="relative bg-white overflow-hidden rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <div
                      className={`absolute inset-y-0 left-0 opacity-10 ${resData?.color || "bg-blue-100"}`}
                      style={{ width: `${percent}%` }}
                    />

                    <div className="relative flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{resData?.emoji || "🍽️"}</span>
                        <div className="flex flex-col">
                          <span className="font-black uppercase tracking-tight text-gray-800">{name}</span>
                          <span className="text-[10px] font-medium text-gray-400"> [ {voterList} ]</span>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-500">
                        {count} {count === 1 ? "vote" : "votes"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
