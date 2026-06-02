const userForm = document.getElementById("userForm");
const nameInput = document.getElementById("nameInput");
const ageInput = document.getElementById("ageInput");
const totalUsers = document.getElementById("totalUsers");
const latestPrediction = document.getElementById("latestPrediction");
const userTableBody = document.querySelector("#userTable tbody");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const sortAgeButton = document.getElementById("sortAgeButton");
const darkModeToggle = document.getElementById("darkModeToggle");
const toastContainer = document.getElementById("toastContainer");
const spinnerOverlay = document.getElementById("spinnerOverlay");

const editModal = new bootstrap.Modal(document.getElementById("editModal"));
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
const editForm = document.getElementById("editForm");
const editUserId = document.getElementById("editUserId");
const editName = document.getElementById("editName");
const editAge = document.getElementById("editAge");
const saveEditButton = document.getElementById("saveEditButton");
const deleteUserName = document.getElementById("deleteUserName");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

let users = [];
let sortDirection = "desc";
let pendingDeleteId = null;

function showSpinner() {
  spinnerOverlay.classList.remove("d-none");
}

function hideSpinner() {
  spinnerOverlay.classList.add("d-none");
}

function showToast(message, variant = "primary") {
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-bg-${variant} border-0 show`;
  toastEl.role = "alert";
  toastEl.ariaLive = "assertive";
  toastEl.ariaAtomic = "true";
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  toastContainer.appendChild(toastEl);

  setTimeout(() => {
    toastEl.classList.remove("show");
    toastEl.addEventListener("transitionend", () => toastEl.remove(), { once: true });
  }, 3200);
}

async function fetchUsers() {
  try {
    showSpinner();
    const response = await fetch("/api/users");
    users = await response.json();
    renderTable();
    updateSummary();
  } catch (error) {
    showToast("Unable to load users.", "danger");
  } finally {
    hideSpinner();
  }
}

function updateSummary() {
  totalUsers.textContent = users.length;
  latestPrediction.textContent = users.length ? users[users.length - 1].prediction : "Pending";
}

function getFilteredUsers() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const category = filterCategory.value;

  return users
    .filter((user) => {
      const searchMatch = [user.name, user.prediction, String(user.age)].some((field) =>
        field.toLowerCase().includes(searchTerm)
      );
      const categoryMatch = category ? user.prediction === category : true;
      return searchMatch && categoryMatch;
    })
    .sort((a, b) => {
      return sortDirection === "asc" ? a.age - b.age : b.age - a.age;
    });
}

function renderTable() {
  const filteredUsers = getFilteredUsers();
  userTableBody.innerHTML = "";

  if (!filteredUsers.length) {
    userTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-secondary py-5">No users found. Add a user to see results here.</td>
      </tr>
    `;
    return;
  }

  for (const user of filteredUsers) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="fw-semibold">${user.id}</td>
      <td>${user.name}</td>
      <td>${user.age}</td>
      <td><span class="badge rounded-pill bg-secondary bg-opacity-20 text-white">${user.prediction}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light btn-action me-2" data-action="edit" data-id="${user.id}"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="btn btn-sm btn-outline-danger btn-action" data-action="delete" data-id="${user.id}"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    userTableBody.appendChild(row);
  }
}

async function createUser(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  const age = ageInput.value.trim();

  if (!name || !age) {
    showToast("Name and age are required.", "warning");
    return;
  }

  try {
    showSpinner();
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age }),
    });
    const payload = await response.json();

    if (!response.ok) {
      showToast(payload.error || "Unable to add user.", "danger");
      return;
    }

    users.push(payload);
    nameInput.value = "";
    ageInput.value = "";
    renderTable();
    updateSummary();
    showToast(`Added ${payload.name} (${payload.prediction})`);
  } catch (error) {
    showToast("Failed to create user.", "danger");
  } finally {
    hideSpinner();
  }
}

function openEditModal(userId) {
  const user = users.find((item) => item.id === userId);
  if (!user) return;

  editUserId.value = user.id;
  editName.value = user.name;
  editAge.value = user.age;
  editModal.show();
}

async function saveEdit() {
  const userId = Number(editUserId.value);
  const name = editName.value.trim();
  const age = editAge.value.trim();

  if (!name || !age) {
    showToast("Name and age are required.", "warning");
    return;
  }

  try {
    showSpinner();
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, age }),
    });
    const payload = await response.json();

    if (!response.ok) {
      showToast(payload.error || "Unable to update user.", "danger");
      return;
    }

    const index = users.findIndex((item) => item.id === payload.id);
    if (index !== -1) users[index] = payload;
    renderTable();
    updateSummary();
    editModal.hide();
    showToast(`Updated ${payload.name} successfully.`);
  } catch (error) {
    showToast("Failed to update user.", "danger");
  } finally {
    hideSpinner();
  }
}

function openDeleteModal(userId) {
  const user = users.find((item) => item.id === userId);
  if (!user) return;

  pendingDeleteId = userId;
  deleteUserName.textContent = user.name;
  deleteModal.show();
}

async function confirmDelete() {
  if (!pendingDeleteId) return;

  try {
    showSpinner();
    const response = await fetch(`/api/users/${pendingDeleteId}`, {
      method: "DELETE",
    });
    const payload = await response.json();

    if (!response.ok) {
      showToast(payload.error || "Unable to delete user.", "danger");
      return;
    }

    users = users.filter((item) => item.id !== pendingDeleteId);
    renderTable();
    updateSummary();
    deleteModal.hide();
    showToast(payload.message);
  } catch (error) {
    showToast("Failed to delete user.", "danger");
  } finally {
    hideSpinner();
    pendingDeleteId = null;
  }
}

function handleTableClick(event) {
  const actionButton = event.target.closest("button[data-action]");
  if (!actionButton) return;

  const userId = Number(actionButton.dataset.id);
  const actionType = actionButton.dataset.action;

  if (actionType === "edit") {
    openEditModal(userId);
  }
  if (actionType === "delete") {
    openDeleteModal(userId);
  }
}

function initializeDarkMode() {
  const savedMode = localStorage.getItem("ai-user-dark-mode");
  const darkEnabled = savedMode === "enabled";
  document.body.classList.toggle("dark-mode", darkEnabled);
}

function toggleDarkMode() {
  const isEnabled = document.body.classList.toggle("dark-mode");
  localStorage.setItem("ai-user-dark-mode", isEnabled ? "enabled" : "disabled");
}

userForm.addEventListener("submit", createUser);
searchInput.addEventListener("input", renderTable);
filterCategory.addEventListener("change", renderTable);
sortAgeButton.addEventListener("click", () => {
  sortDirection = sortDirection === "asc" ? "desc" : "asc";
  sortAgeButton.innerHTML = sortDirection === "asc"
    ? '<i class="fa-solid fa-arrow-up-wide-short"></i> Age Ascending'
    : '<i class="fa-solid fa-arrow-down-wide-short"></i> Age Descending';
  renderTable();
});
darkModeToggle.addEventListener("click", toggleDarkMode);
userTableBody.addEventListener("click", handleTableClick);
saveEditButton.addEventListener("click", saveEdit);
confirmDeleteButton.addEventListener("click", confirmDelete);

initializeDarkMode();
fetchUsers();
