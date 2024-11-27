import axios from "axios";

const API_URL =
    "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=3a728d526e5349dd89913977b65f8280";

export const fetchNewsFromApi = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data.articles;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch news"
        );
    }
};
