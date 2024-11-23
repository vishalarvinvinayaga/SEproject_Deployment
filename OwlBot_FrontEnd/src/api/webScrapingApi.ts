import axios from "axios";

const API_URL = "http://localhost:8000/api/admin"; // Replace with your API endpoint

// Schedule Web Scraping API
export const scheduleWebScraping = async (
    taskType: string,
    runDate: string | null,
    cronExpression: object | null,
    token: string | null
) => {
    const response = await axios.post(
        `${API_URL}/scraping-schedule/`,
        {
            task_type: taskType,
            run_date: runDate,
            cron_expression: JSON.stringify(cronExpression),
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
// Fetch all tasks
export const fetchScheduledTasks = async (token: string | null) => {
    const response = await axios.get(`${API_URL}/scraping-schedule/`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.tasks;
};

// Remove Web Scraping Task API
export const removeWebScrapingTask = async (
    jobId: string,
    token: string | null
) => {
    const response = await axios.delete(`${API_URL}/scraping-schedule/`, {
        data: { job_id: jobId },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
