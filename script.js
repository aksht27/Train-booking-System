const API = "https://train-booking-system-rtt9.onrender.com";

const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("toInput");
const searchBtn = document.getElementById("searchBtn");
const trainsList = document.getElementById("trainsList");
const bookingsList = document.getElementById("bookingsList");

// ✅ Added validation here
searchBtn.addEventListener("click", () => {
  const from = fromInput.value.trim();
  const to = toInput.value.trim();

  if (!from || !to) {
    alert("⚠️ Please enter both 'From' and 'To' locations before searching.");
    return;
  }

  searchTrains(from, to);
});

async function searchTrains(from, to) {
  trainsList.innerHTML = "Searching...";
  try {
    const res = await fetch(
      `${API}/trains?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    const trains = await res.json();
    if (!trains.length) {
      trainsList.innerHTML = "<div class='small'>No trains found</div>";
      return;
    }
    trainsList.innerHTML = "";
    trains.forEach((t) => {
      const el = document.createElement("div");
      el.className = "train";
      el.innerHTML = `
        <div><strong>${t.name}</strong> • ${t.from} ➝ ${t.to} • <span class="small">${t.time}</span></div>
        <div style="margin-top:8px;">
          <input class="inline-input pname" placeholder="Passenger name" />
          <input class="inline-input pseat" placeholder="Seat (e.g., A1)" />
          <button class="book-btn">Book</button>
        </div>
      `;
      el.querySelector(".book-btn").addEventListener("click", async () => {
        const passengerName = el.querySelector(".pname").value.trim();
        const seat = el.querySelector(".pseat").value.trim();
        if (!passengerName || !seat) {
          alert("Enter passenger name and seat");
          return;
        }
        await bookTicket(t._id, passengerName, seat);
      });
      trainsList.appendChild(el);
    });
  } catch (err) {
    trainsList.innerHTML = "<div class='small'>Error searching trains</div>";
    console.error(err);
  }
}

async function bookTicket(trainId, passengerName, seat) {
  try {
    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainId, passengerName, seat }),
    });
    if (!res.ok) throw new Error("Booking failed");
    await res.json();
    alert("✅ Booked!");
    loadBookings();
  } catch (err) {
    alert("Booking error");
    console.error(err);
  }
}

async function loadBookings() {
  bookingsList.innerHTML = "Loading...";
  try {
    const res = await fetch(`${API}/bookings`);
    const bookings = await res.json();
    if (!bookings.length) {
      bookingsList.innerHTML = "<div class='small'>No bookings yet</div>";
      return;
    }
    bookingsList.innerHTML = "";
    bookings.forEach((b) => {
      const el = document.createElement("div");
      el.className = "train";
      const trainName = b.trainId?.name || "Train";
      el.innerHTML = `
        <div><strong>${trainName}</strong> • Seat: ${b.seat} • <span class="small">${new Date(
        b.createdAt
      ).toLocaleString()}</span></div>
        <div>Passenger: ${b.passengerName}
          <button class="delete-btn">Cancel</button>
        </div>
      `;
      el.querySelector(".delete-btn").addEventListener("click", async () => {
        if (!confirm("Cancel this booking?")) return;
        await cancelBooking(b._id);
      });
      bookingsList.appendChild(el);
    });
  } catch (err) {
    bookingsList.innerHTML = "<div class='small'>Error loading bookings</div>";
    console.error(err);
  }
}

async function cancelBooking(id) {
  try {
    await fetch(`${API}/bookings/${id}`, { method: "DELETE" });
    loadBookings();
  } catch (err) {
    alert("Cancel failed");
    console.error(err);
  }
}

// Load bookings on page open
loadBookings();
