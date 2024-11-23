import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Form, Container } from "react-bootstrap";
import { RootState, AppDispatch } from "../../../redux/store";
import {
    submitWebScrapingSchedule,
    deleteWebScrapingTask,
    fetchTasks,
} from "../../../redux/webScrapingSlice";

const WebScrapingScheduler = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { taskType, runDate, tasks, loading, success, error } = useSelector(
        (state: RootState) => state.webScraping
    );
    const { token } = useSelector((state: RootState) => state.admin);

    const [inputTaskType, setInputTaskType] = useState(taskType);
    const [inputRunDate, setInputRunDate] = useState(runDate);
    const [inputHours, setInputHours] = useState(""); // Store the user input for hours
    const [selectedTask, setSelectedTask] = useState("");

    // Fetch tasks when the component loads
    useEffect(() => {
        if (token) {
            dispatch(fetchTasks(token));
        }
    }, [dispatch, token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            alert("Please log in to schedule web scraping.");
            return;
        }

        let cronExpressionObj = null;
        let formattedRunDate = null;

        if (inputTaskType === "recurring") {
            // Validate hours input for recurring tasks
            const hours = parseInt(inputHours, 10);
            if (isNaN(hours) || hours <= 0) {
                alert("Please enter a valid number of hours greater than 0.");
                return;
            }
            cronExpressionObj = {
                hour: `*/${hours}`, // APScheduler supports "*/X" format for intervals
            };
        } else if (inputTaskType === "one_time") {
            // Validate run date for one-time tasks
            if (!inputRunDate) {
                alert("Run Date is required for one-time tasks.");
                return;
            }
            try {
                formattedRunDate = new Date(inputRunDate).toISOString();
            } catch {
                alert(
                    "Invalid Run Date format. Please select a valid date and time."
                );
                return;
            }
        }

        // Dispatch the action to schedule the task
        await dispatch(
            submitWebScrapingSchedule({
                taskType: inputTaskType,
                runDate: formattedRunDate,
                cronExpression: cronExpressionObj,
                token,
            })
        );
    };

    const handleRemoveTask = async () => {
        if (!selectedTask) {
            alert("Please select a task to remove.");
            return;
        }
        if (!token) {
            alert("Please log in to remove a scheduled task.");
            return;
        }

        await dispatch(deleteWebScrapingTask({ jobId: selectedTask, token }));
    };

    return (
        <Container className="p-2 pt-5">
            <Form onSubmit={handleSubmit} className="w-50">
                <Form.Group controlId="taskTypeSelect">
                    <Form.Label>Task Type</Form.Label>
                    <Form.Control
                        as="select"
                        value={inputTaskType}
                        onChange={(e) => setInputTaskType(e.target.value)}
                    >
                        <option value="one_time">One-Time</option>
                        <option value="recurring">Recurring</option>
                    </Form.Control>
                </Form.Group>
                {inputTaskType === "one_time" && (
                    <Form.Group controlId="runDateInput">
                        <Form.Label>Run Date</Form.Label>
                        <Form.Control
                            type="datetime-local"
                            value={inputRunDate || ""}
                            onChange={(e) => setInputRunDate(e.target.value)}
                            required={inputTaskType === "one_time"}
                        />
                    </Form.Group>
                )}
                {inputTaskType === "recurring" && (
                    <Form.Group controlId="hoursInput">
                        <Form.Label>Frequency (in hours)</Form.Label>
                        <Form.Control
                            type="number"
                            value={inputHours}
                            onChange={(e) => setInputHours(e.target.value)}
                            placeholder="Enter number of hours"
                        />
                        <Form.Text className="text-muted">
                            Enter the interval in hours for recurring tasks
                            (e.g., "3" for every 3 hours).
                        </Form.Text>
                    </Form.Group>
                )}
                <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="mt-3"
                >
                    {loading ? "Scheduling..." : "Schedule Scraping"}
                </Button>
            </Form>
            <hr />
            <Form.Group controlId="taskDropdown" className="w-50">
                <Form.Label>Scheduled Tasks</Form.Label>
                <Form.Control
                    as="select"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                >
                    <option value="">-- Select a Task --</option>
                    {tasks.map((task) => (
                        <option key={task.job_id} value={task.job_id}>
                            {task.job_id} - Next Run:{" "}
                            {task.next_run_time || "N/A"}
                        </option>
                    ))}
                </Form.Control>
                <Button
                    variant="danger"
                    onClick={handleRemoveTask}
                    disabled={loading}
                    className="mt-3"
                >
                    {loading ? "Removing..." : "Remove Task"}
                </Button>
            </Form.Group>
            {success && (
                <p className="text-success">
                    Operation completed successfully!
                </p>
            )}
            {error && <p className="text-danger">Error: {error}</p>}
        </Container>
    );
};

export default WebScrapingScheduler;
