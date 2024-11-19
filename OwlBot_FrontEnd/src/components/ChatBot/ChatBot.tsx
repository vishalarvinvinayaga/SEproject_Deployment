import React, { useEffect, useRef, useState } from "react";
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    InputGroup,
    Button,
} from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { addUserMessage, sendMessageToBackend } from "../../redux/chatSlice";
import ChatMessage from "../ChatMessage/ChatMessage";
import NewsFeedMenu from "../NewsFeedMenu/NewsFeedMenu";
import LinksMenu from "../LinksMenu/LinksMenu";
import "./ChatBot.css";

const ChatBot = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [input, setInput] = useState("");
    const [showNewsMenu, setShowNewsMenu] = useState(false);
    const [showLinksMenu, setShowLinksMenu] = useState(false);

    const { messages, loading, error } = useSelector(
        (state: RootState) => state.chat
    );

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
                        className="p-0 d-none d-lg-block"
                        lg={2}
                        style={{
                            backgroundColor: "#D9ECFF",
                            overflowY: "auto",
                            borderRight: "2px solid rgba(204, 204, 204)",
                        }}
                    >
                        <h5 className="text-center mt-3">News Feed</h5>
                        <div className="news-feed px-3">
                            <p>News Item 1</p>
                            <p>News Item 2</p>
                            <p>News Item 3</p>
                            <p>News Item 4</p>
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
                                className="d-flex flex-column"
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
                                {loading && (
                                    <div className="loading-dots left-aligned">
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                        <span className="dot"></span>
                                    </div>
                                )}
                                {error && (
                                    <p className="text-danger text-end">
                                        {error}
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
                                        disabled={loading}
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
                        className="p-0 d-none d-lg-block"
                        lg={2}
                        style={{
                            backgroundColor: "#D9ECFF",
                            overflowY: "auto",
                            borderLeft: "2px solid rgba(204, 204, 204)",
                        }}
                    >
                        <h5 className="text-center mt-3">Useful Links</h5>
                        <div className="links px-3">
                            <p>
                                <a
                                    href="https://example.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Example Link 1
                                </a>
                            </p>
                            <p>
                                <a
                                    href="https://example.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Example Link 2
                                </a>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default ChatBot;
