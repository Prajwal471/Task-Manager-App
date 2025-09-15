import { API_URL } from "./utils"

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': localStorage.getItem('token')
});


export const CreateTask = async (taskObj) => {
    const url = `${API_URL}/tasks`;
    console.log('url ', url)
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskObj)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}
export const GetAllTasks = async (queryString = '') => {
    const url = `${API_URL}/tasks${queryString}`;
    console.log('url ', url)
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const DeleteTaskById = async (id) => {
    const url = `${API_URL}/tasks/${id}`;
    console.log('url ', url)
    const options = {
        method: 'DELETE',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}


export const UpdateTaskById = async (id, reqBody) => {
    const url = `${API_URL}/tasks/${id}`;
    console.log('url ', url)
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(reqBody)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

// New API functions for enhanced features

export const GetTaskAnalytics = async (period = '7d') => {
    const url = `${API_URL}/tasks/analytics?period=${period}`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const GetTasksByDateRange = async (startDate, endDate) => {
    const url = `${API_URL}/tasks/date-range?startDate=${startDate}&endDate=${endDate}`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const AddSubtask = async (taskId, subtaskText) => {
    const url = `${API_URL}/tasks/${taskId}/subtasks`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ text: subtaskText })
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const ToggleSubtask = async (taskId, subtaskId) => {
    const url = `${API_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`;
    const options = {
        method: 'PATCH',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

// Category API functions
export const CreateCategory = async (categoryObj) => {
    const url = `${API_URL}/categories`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryObj)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const GetUserCategories = async () => {
    const url = `${API_URL}/categories`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const UpdateCategory = async (id, categoryObj) => {
    const url = `${API_URL}/categories/${id}`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryObj)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const DeleteCategory = async (id) => {
    const url = `${API_URL}/categories/${id}`;
    const options = {
        method: 'DELETE',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

// User Profile API functions
export const GetUserProfile = async () => {
    const url = `${API_URL}/auth/profile`;
    const options = {
        method: 'GET',
        headers: getAuthHeaders()
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const UpdateUserProfile = async (profileObj) => {
    const url = `${API_URL}/auth/profile`;
    const options = {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileObj)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}

export const ChangePassword = async (passwordObj) => {
    const url = `${API_URL}/auth/change-password`;
    const options = {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordObj)
    };
    try {
        const result = await fetch(url, options);
        const data = await result.json();
        return data;
    } catch (err) {
        return err;
    }
}