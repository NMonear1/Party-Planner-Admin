// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2505-ftb-ct-web-pt/"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

const addParty = async (e) => {
  e.preventDefault();

  const formData = e.target.elements;
  const isoDate = new Date(formData.date.value).toISOString();

  const newParty = {
    name: formData.name.value,
    description: formData.description.value,
    date: isoDate,
    location: formData.location.value,
  };

  console.log(newParty);
  try {
    const response = await fetch(
      "https://fsa-crud-2aa9294fe819.herokuapp.com/api/2505-FTB-CT-WEB-PT/events",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newParty),
      }
    );

    const data = await response.json();
    console.log(data);
    parties.push(data.data);
    render();
  } catch (error) {
    console.error(error);
  }
};

const setForm = () => {
  const $form = document.createElement("form");
  $form.innerHTML = `
      <div class="form-group">
        <label>Name</label>
        <input
          name="name"
          type="name"
          class="form-control"
          
          aria-describedby="emailHelp"
          placeholder="Enter name"
        />
      </div>
      <div class="form-group">
        <label>Description</label>
        <input
          name="description"
          type="text"
          class="form-control"
          
          placeholder="image"
        />
      </div>
      <div class="form-group">
        <label>Date</label>
        <input
          name="date"
          type="date"
          class="form-control"
          
          placeholder="image"
        />
      </div>
      <div class="form-group">
        <label>Location</label>
        <input
          name="location"
          type="text"
          class="form-control"
          aria-describedby="emailHelp"
          placeholder="Enter description"
        />
      </div>

      <button type="submit">Submit</button>
  `;

  $form.addEventListener("submit", addParty);

  return $form;
};

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button id="deleteBtn">Delete Party</button>
  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  $party.querySelector("#deleteBtn").addEventListener("click", async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this party?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${API}/events/${selectedParty.id}`, {
        method: "DELETE",
      });
      parties = parties.filter((p) => p.id !== selectedParty.id);
      selectedParty = null;
      render();
    } catch (error) {
      console.error("Failed to delete party:", error);
    }
  });

  return $party;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}
const $app = document.querySelector("#app");
// === Render ===
function render() {
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
      <section>
        <h2>Add a new party!</h2>
        <partyForm></partyForm>
      </section>  
    </main>
  `;

  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
  $app.querySelector("partyForm").replaceWith(setForm());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
