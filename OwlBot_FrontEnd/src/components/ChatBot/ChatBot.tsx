import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    InputGroup,
    Button,
    ListGroup,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { addUserMessage, sendMessageToBackend } from "../../redux/chatSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import NewsFeedMenu from "../NewsFeedMenu/NewsFeedMenu";
import LinksMenu from "../LinksMenu/LinksMenu";
import "./ChatBot.css";
import UsefulLinks from "../../assets/usefulLinks.json";
import { Link } from "react-router-dom";
import { fetchNews } from "../../redux/fetchNewsSlice";
import { resetSession } from "../../api/chatApi"; //to call ther resetsession on reload

const ChatBot = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [input, setInput] = useState("");
    const [showNewsMenu, setShowNewsMenu] = useState(false);
    const [showLinksMenu, setShowLinksMenu] = useState(false);

    const {
        articles,
        // loading: newsLoading,
        // error: newsError,
    } = useSelector((state: RootState) => state.news);

    const {
        messages,
        loading: chatLoading,
        error: chatError,
    } = useSelector((state: RootState) => state.chat);

    const handleSendMessage = () => {
        if (input.trim() !== "") {
            dispatch(addUserMessage(input));
            dispatch(sendMessageToBackend(input))
                .unwrap()
                .catch(() => {
                    console.error("Error sending message to backend");
                });
            setInput("");
        }
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    useEffect(() => {
        // Reset the session on component mount
        resetSession()
            .then(() => {
                console.log("Session reset successfully");
            })
            .catch((err) => {
                console.error("Failed to reset session", err);
            });
    }, []); // Run once when component mounts

    useEffect(() => {
        dispatch(fetchNews());
    }, [dispatch]);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    return (
        <>
            <NewsFeedMenu
                show={showNewsMenu}
                handleClose={() => setShowNewsMenu(false)}
            />
            <LinksMenu
                show={showLinksMenu}
                handleClose={() => setShowLinksMenu(false)}
            />

            <Container fluid className="d-flex vh-100 vw-100 p-0 m-0">
                <Row className="w-100 h-100 m-0">
                    {/* Left Column (News Feed for Large Screens) */}
                    <Col
                        className="p-0 d-none d-lg-block custom-scrollbar"
                        lg={2}
                        style={{
                            backgroundColor: "#D9ECFF",
                            overflowY: "auto",
                            borderRight: "2px solid rgba(204, 204, 204)",
                            height: "100vh",
                        }}
                    >
                        <h5 className="text-center mt-3">News Feed</h5>
                        <div className="news-feed px-3">
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
                    </Col>

                    {/* Chat Column */}
                    <Col lg={8} xs={12} className="p-0 appStyle">
                        <Card
                            className="h-100 w-100 border-0"
                            style={{
                                backgroundColor: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            <Card.Header
                                className="text-white text-center rounded-0 d-flex justify-content-between align-items-center"
                                style={{ backgroundColor: "rgba(0, 51, 102)" }}
                            >
                                <Button
                                    className="d-lg-none"
                                    variant="light"
                                    onClick={() => setShowNewsMenu(true)}
                                >
                                    News
                                </Button>
                                <h5 className="mb-0 flex-grow-1 text-center">
                                    FAU OwlBot
                                </h5>
                                <Button
                                    className="d-lg-none"
                                    variant="light"
                                    onClick={() => setShowLinksMenu(true)}
                                >
                                    Links
                                </Button>
                            </Card.Header>
                            <Card.Body
                                className="d-flex flex-column custom-scrollbar"
                                style={{
                                    height: "calc(100vh - 18vh)",
                                    overflowY: "auto",
                                    paddingBottom: "1rem",
                                }}
                            >
                                {messages.map((msg, index) => (
                                    <ChatMessage
                                        key={index}
                                        sender={msg.sender}
                                        text={msg.text}
                                    />
                                ))}
                                <div ref={messagesEndRef} />
                                {chatLoading && (
                                    <div className="loading-dots left-aligned">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                )}
                                {chatError && (
                                    <p className="text-danger text-end">
                                        {chatError}
                                    </p>
                                )}
                            </Card.Body>
                            <Card.Footer
                                className="p-3"
                                style={{
                                    backgroundColor: "rgba(204, 204, 204)",
                                }}
                            >
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Ask Query..."
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                        onKeyDown={handleKeyPress}
                                        disabled={chatLoading}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        style={{
                                            backgroundColor: "rgba(77, 76, 85)",
                                        }}
                                    >
                                        Send
                                    </Button>
                                </InputGroup>
                            </Card.Footer>
                        </Card>
                    </Col>

                    {/* Right Column (Links for Large Screens) */}
                    <Col
                        className="p-0 d-none d-lg-block custom-scrollbar"
                        lg={2}
                        style={{
                            backgroundColor: "#D9ECFF",
                            overflowY: "auto",
                            borderLeft: "2px solid rgba(204, 204, 204)",
                        }}
                    >
                        <h5 className="text-center mt-3">Useful Links</h5>
                        <div className="links px-3">
                            <ListGroup>
                                {UsefulLinks.map((item, index) => (
                                    <ListGroup.Item
                                        key={index}
                                        className="border rounded-3 m-1 p-3"
                                    >
                                        <Link
                                            target="_blank"
                                            to={item.Link}
                                            style={{
                                                color: "#007bff",
                                                textDecoration: "none",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {item.Name}
                                        </Link>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ChatBot;
