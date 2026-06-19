export const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "/api";

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = { "Content-Type": "application/json" };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

export const fetchProducts = async () => {
    const res = await fetch(`${API_URL}/products`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
};

export const createProduct = async (product) => {
    const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
};

export const updateProduct = async (id, product) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(product),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
};

export const deleteProduct = async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete product");
    return res.json();
};

export const fetchClients = async () => {
    const res = await fetch(`${API_URL}/clients`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch clients");
    return res.json();
};

export const createClient = async (client) => {
    const res = await fetch(`${API_URL}/clients`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error("Failed to create client");
    return res.json();
};

export const updateClient = async (id, client) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(client),
    });
    if (!res.ok) throw new Error("Failed to update client");
    return res.json();
};

export const deleteClient = async (id) => {
    const res = await fetch(`${API_URL}/clients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete client");
    return res.json();
};

// --- Sales API ---

export const fetchSales = async () => {
    const res = await fetch(`${API_URL}/sales`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch sales");
    return res.json();
};

export const createSale = async (saleData) => {
    const res = await fetch(`${API_URL}/sales`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(saleData),
    });
    if (!res.ok) throw new Error("Failed to create sale");
    return res.json();
};

// --- Inventory API ---

export const fetchInventoryMovements = async () => {
    const res = await fetch(`${API_URL}/inventory/movements`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch inventory movements");
    return res.json();
};

export const fetchInventoryStats = async () => {
    const res = await fetch(`${API_URL}/inventory/stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch inventory stats");
    return res.json();
};

export const createInventoryMovement = async (movementData) => {
    const res = await fetch(`${API_URL}/inventory/movements`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(movementData),
    });
    if (!res.ok) throw new Error("Failed to create inventory movement");
    return res.json();
};

// --- Reports API ---

export const fetchDashboardStats = async () => {
    const res = await fetch(`${API_URL}/reports/dashboard`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
};

export const fetchTimeseries = async (metric = 'revenue', period = 'days') => {
    const res = await fetch(`${API_URL}/reports/timeseries?metric=${encodeURIComponent(metric)}&period=${encodeURIComponent(period)}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch timeseries");
    return res.json();
};

export const fetchPurchaseHistory = async () => {
    const res = await fetch(`${API_URL}/reports/history`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch purchase history");
    return res.json();
};

// --- Settings API ---

export const fetchSettings = async () => {
    const res = await fetch(`${API_URL}/settings`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch settings");
    return res.json();
};

export const updateSettings = async (settings) => {
    const res = await fetch(`${API_URL}/settings`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error("Failed to update settings");
    return res.json();
};

// --- Expenses API ---

export const fetchExpenseTimeseries = async (period = 'days') => {
    const res = await fetch(`${API_URL}/expenses/timeseries?period=${encodeURIComponent(period)}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch expense timeseries");
    return res.json();
};

export const fetchExpenses = async () => {
    const res = await fetch(`${API_URL}/expenses`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
};

export const createExpense = async (expense) => {
    const res = await fetch(`${API_URL}/expenses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to create expense");
    return res.json();
};

export const updateExpense = async (id, expense) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(expense),
    });
    if (!res.ok) throw new Error("Failed to update expense");
    return res.json();
};

export const deleteExpense = async (id) => {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete expense");
    return res.json();
};
