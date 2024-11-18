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
import { Link } from "react-router-dom";
import "./ChatBot.css";

const ChatBot = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [input, setInput] = useState("");

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
        <Container fluid className="d-flex vh-100 vw-100 p-0 m-0 appStyle">
            <Row className="w-100 h-100 m-0">
                <Col className="p-0">
                    <Card
                        className="h-100 w-100 border-0"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
                    >
                        <Card.Header
                            className="text-white text-center rounded-0 d-flex justify-content-center align-items-center"
                            style={{ backgroundColor: "rgba(0, 51, 102)" }}
                        >
                            <h5 className="mb-0 flex-grow-1 text-center">
                                FAU OwlBot
                            </h5>
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
                                <p className="text-danger text-end">{error}</p>
                            )}
                        </Card.Body>
                        <Card.Footer
                            className="p-3"
                            style={{ backgroundColor: "rgba(204, 204, 204)" }}
                        >
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Ask Query..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
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
            </Row>
        </Container>
    );
};

export default ChatBot;
