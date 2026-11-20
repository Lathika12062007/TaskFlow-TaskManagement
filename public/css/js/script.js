// Register
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        document.getElementById("message").textContent = data.message;

        if (data.success) {
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        }
    });
}

// Login
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        document.getElementById("message").textContent = data.message;

        if (data.success) {
            window.location.href = "dashboard.html";
        }
    });
}

// Dashboard
const taskForm = document.getElementById("taskForm");

if (taskForm) {
    loadUser();
    loadTasks();

    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const id = document.getElementById("taskId").value;

        const task = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            status: document.getElementById("status").value,
            priority: document.getElementById("priority").value,
            due_date: document.getElementById("due_date").value || null
        };

        const url = id ? `/api/tasks/${id}` : "/api/tasks";
        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        });

        const data = await response.json();

        if (data.success) {
            taskForm.reset();
            document.getElementById("taskId").value = "";
            document.getElementById("formTitle").textContent = "Add New Task";
            document.getElementById("cancelEdit").classList.add("hidden");

            loadTasks();
        } else {
            alert(data.message);
        }
    });

    document.getElementById("cancelEdit").addEventListener("click", () => {
        taskForm.reset();
        document.getElementById("taskId").value = "";
        document.getElementById("formTitle").textContent = "Add New Task";
        document.getElementById("cancelEdit").classList.add("hidden");
    });

    document.getElementById("search").addEventListener("input", loadTasks);
}

// Load user
async function loadUser() {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
        window.location.href = "login.html";
        return;
    }

    const data = await response.json();

    document.getElementById("userName").textContent =
        "Hello, " + data.user.name;
}

// Load tasks
async function loadTasks() {
    const response = await fetch("/api/tasks");

    if (!response.ok) return;

    const tasks = await response.json();

    const search = document.getElementById("search")?.value.toLowerCase() || "";

    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search)
    );

    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => task.status === "Pending").length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.status === "Completed").length;

    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    filteredTasks.forEach(task => {
        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `
            <h3>${escapeHTML(task.title)}</h3>
            <p>${escapeHTML(task.description || "")}</p>
            <span class="badge">${escapeHTML(task.status)}</span>
            <p>Priority: ${escapeHTML(task.priority)}</p>
            <p>Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}</p>
            <button class="btn" onclick="editTask(${task.id})">Edit</button>
            <button class="btn secondary" onclick="deleteTask(${task.id})">Delete</button>
        `;

        taskList.appendChild(card);
    });
}

// Edit
async function editTask(id) {
    const response = await fetch("/api/tasks");

    const tasks = await response.json();

    const task = tasks.find(t => t.id === id);

    if (!task) return;

    document.getElementById("taskId").value = task.id;
    document.getElementById("title").value = task.title;
    document.getElementById("description").value = task.description || "";
    document.getElementById("status").value = task.status;
    document.getElementById("priority").value = task.priority;

    document.getElementById("due_date").value =
        task.due_date ? new Date(task.due_date).toISOString().split("T")[0] : "";

    document.getElementById("formTitle").textContent = "Edit Task";
    document.getElementById("cancelEdit").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
    });

    const data = await response.json();

    if (data.success) {
        loadTasks();
    } else {
        alert(data.message);
    }
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await fetch("/api/auth/logout", {
            method: "POST"
        });

        window.location.href = "login.html";
    });
}

// Escape HTML
function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}