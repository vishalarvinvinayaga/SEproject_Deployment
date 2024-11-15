import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const ChatMessage: React.FC<{ sender: string; text: string }> = ({ sender, text }) => {
    const isBot = sender === "bot";

    const FAU_Blue = "rgba(204, 0, 0)";

    const FAU_Red = "rgba(0, 51, 102)";

    return (
        <Row className="mb-0">
            <Col className={isBot ? "text-start" : "text-end"}>
                <Card
                    className={isBot ? "d-inline-block" : "d-inline-block"}
                    style={{
                        maxWidth: "70%",
                        backgroundColor: isBot ? FAU_Red : FAU_Blue,
                        color: "white",
                        borderRadius: "10px",
                        padding: "10px",
                        margin: "5px",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    {text}
                </Card>
            </Col>
        </Row>
    );
};

export default ChatMessage;
