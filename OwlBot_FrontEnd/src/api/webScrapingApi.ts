import axios from "axios";

const API_URL = ""; // Replace with your API endpoint

export const scheduleWebScraping = async (
    frequency: number,
    token: string | null
) => {
    const response = await axios.post(
        `${API_URL}/schedule-scraping`,
        { frequency },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};
