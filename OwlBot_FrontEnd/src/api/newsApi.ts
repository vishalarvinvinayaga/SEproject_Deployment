// import axios from "axios";
import news from "../assets/news.json"

// const News_API = "https://newsapi.org/v2/top-headlines?sources=techcrunch&apiKey=3a728d526e5349dd89913977b65f8280";

export const fetchNewsFromApi = async () => {
    try {
        // const response = await axios.get(News_API);
        // return response.data.articles;
        const response = news
        return response.articles;
    } catch (error: any) {
        console.error("Error fetching news:", error.message);
        throw new Error(
            error.response?.data?.message || "Failed to fetch news"
        );
    }
};