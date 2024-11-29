export const getTaskDescription = (jobId: string | undefined): string => {
    if (!jobId) return "Unknown Task"; // Handle undefined or null job_id

    if (jobId.startsWith("recurring_task_hour-")) {
        const match = jobId.match(/\*\/(\d+)/); // Extract the interval (e.g., */4)
        const hours = match ? match[1] : "Unknown";
        return `Recurring Task (Every ${hours} Hours)`;
    } else if (jobId.startsWith("one_time_task")) {
        return "One-Time Task";
    } else {
        return "Unknown Task Type";
    }
};
