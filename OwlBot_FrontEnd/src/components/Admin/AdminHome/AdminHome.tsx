import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Container, Card, ListGroup } from "react-bootstrap";
import { RootState, AppDispatch } from "../../../redux/store";
import { fetchTasks } from "../../../redux/webScrapingSlice";
import { formatDate } from "../../../common/DateFormatter/dateFormatter";
import { getTaskDescription } from "../../../common/TaskDescription/taskDescription";

const AdminHome = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { tasks, loading, error } = useSelector(
        (state: RootState) => state.webScraping
    );
    const { token } = useSelector((state: RootState) => state.admin);

    useEffect(() => {
        if (token && tasks.length === 0) {
            dispatch(fetchTasks(token));
        }
    }, [dispatch, token, tasks.length]);

    return (
        <Container className="mt-4">
            <h3>Admin Home</h3>
            <Card className="p-3 mt-3">
                <Card.Body>
                    <Card.Title>Scheduled Web Scraping Tasks</Card.Title>
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : error ? (
                        <p className="text-danger">Error: {error}</p>
                    ) : tasks.length > 0 ? (
                        <ListGroup>
                            {tasks
                                .filter((task) => task.job_id)
                                .map((task) => (
                                    <ListGroup.Item key={task.job_id}>
                                        <strong>Task:</strong>{" "}
                                        {getTaskDescription(task.job_id)} <br />
                                        <strong>Next Run Time:</strong>{" "}
                                        {formatDate(task.next_run_time)}
                                    </ListGroup.Item>
                                ))}
                        </ListGroup>
                    ) : (
                        <p>No scheduled tasks found.</p>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminHome;
