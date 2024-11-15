import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Container } from "react-bootstrap";
import { RootState, AppDispatch } from "../../../redux/store";
import {
    setFrequency,
    submitWebScrapingSchedule,
} from "../../../redux/webScrapingSlice";

const WebScrapingScheduler = () => {
    // Use AppDispatch to type the dispatch function
    const dispatch = useDispatch<AppDispatch>();
    const { frequency, loading, success, error } = useSelector(
        (state: RootState) => state.webScraping
    );
    const { token } = useSelector((state: RootState) => state.admin); // Assuming admin slice holds the token

    const [inputFrequency, setInputFrequency] = useState(frequency);

    const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputFrequency(Number(e.target.value));
        dispatch(setFrequency(Number(e.target.value))); // Update frequency in the Redux state
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("Please log in to schedule web scraping.");
            return;
        }
        await dispatch(
            submitWebScrapingSchedule({ frequency: inputFrequency, token })
        );
    };

    return (
        <Container className="p-2 pt-5">
            <Form onSubmit={handleSubmit} className="w-50">
                <Form.Group controlId="frequencyInput" className="align-items-center">
                    <Form.Label>Scraping Frequency (in hours)</Form.Label>
                    <Form.Control
                        type="number"
                        value={inputFrequency}
                        onChange={handleFrequencyChange}
                        required
                    />
                </Form.Group>
                <Button variant="primary" type="submit" disabled={loading} className="mt-3 ml-4">
                    {loading ? "Scheduling..." : "Schedule Scraping"}
                </Button>
            </Form>
            {success && <p className="text-success">Scheduling successful!</p>}
            {error && <p className="text-danger">Error: {error}</p>}
        </Container>
    );
};

export default WebScrapingScheduler;
