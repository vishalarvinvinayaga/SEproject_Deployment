import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { Container, Card } from "react-bootstrap";

const AdminHome = () => {
    // Access the scraping frequency from the Redux store
    const frequency = useSelector(
        (state: RootState) => state.webScraping.frequency
    );

    return (
        <Container className="mt-4">
            <h3>Home</h3>
            <Card className="p-3 mt-3">
                <Card.Body>
                    <Card.Title>Current Scraping Frequency</Card.Title>
                    <Card.Text>
                        {frequency > 0
                            ? `Scraping is scheduled to run every ${frequency} hours.`
                            : "No scraping frequency has been set."}
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AdminHome;
