import { Offcanvas } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews } from "../../redux/fetchNewsSlice";
import { useEffect } from "react";
import "./NewsFeedMenu.css";
import { RootState, AppDispatch } from "../../redux/store";

const NewsFeedMenu = ({
    show,
    handleClose,
}: {
    show: boolean;
    handleClose: () => void;
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const { articles, loading, error } = useSelector(
        (state: RootState) => state.news
    );

    useEffect(() => {
        dispatch(fetchNews());
    }, [dispatch]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="start"
            style={{ width: "80vw", backgroundColor: "#D9ECFF" }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>News Feed</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div
                    className="news-feed custom-scrollbar"
                    style={{ maxHeight: "85vh", overflowY: "auto" }}
                >
                    <ul
                        style={{
                            padding: "0",
                            margin: "0",
                            listStyleType: "none",
                        }}
                    >
                        {articles.map((article, index) => (
                            <li
                                key={index}
                                style={{
                                    marginBottom: "20px",
                                    borderBottom: "1px solid #ccc",
                                    paddingBottom: "10px",
                                }}
                            >
                                <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        color: "#007bff",
                                        textDecoration: "none",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {article.title}
                                </a>
                                <p style={{ color: "#555" }}>
                                    By {article.author}
                                </p>
                                <p style={{ fontSize: "12px" }}>
                                    {article.description}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default NewsFeedMenu;
