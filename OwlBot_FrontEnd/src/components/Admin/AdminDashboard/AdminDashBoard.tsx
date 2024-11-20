import { useEffect } from "react";
import { Button, Card, Container, Nav, Tab } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { adminLogout } from "../../../redux/adminSlice";
import JSONDataInsertion from "../JSONDataInsertion/JSONDataInsertion";
import WebScrapingScheduler from "../WebScrapingScheduler/WebScrapingScheduler";
import AdminHome from "../AdminHome/AdminHome";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoggedIn } = useSelector((state: RootState) => state.admin);

    // Redirect to login if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/admin/login"); // Redirect to login page if not logged in
        }
    }, [isLoggedIn, navigate]);

    const handleLogout = () => {
        dispatch(adminLogout());
        navigate("/admin/login"); // Redirect to login page after logout
    };

    return (
        <Container fluid className="vh-100 vw-100 p-3 m-0">
            <Card className="justify-content-between align-items-center text-center flex-row border-0">
                <h2>Admin Dashboard</h2>
                <Button variant="primary" type="submit" onClick={handleLogout}>
                    Logout
                </Button>
            </Card>

            <Tab.Container defaultActiveKey="home">
                <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="home">Home</Nav.Link>
                    </Nav.Item>
                    {/* <Nav.Item>
                        <Nav.Link eventKey="json">JSON Data Insertion</Nav.Link>
                    </Nav.Item> */}
                    <Nav.Item>
                        <Nav.Link eventKey="scraping">
                            Web Scraping Scheduling
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <Tab.Content>
                    <Tab.Pane eventKey="home">
                        <AdminHome />
                    </Tab.Pane>
                    {/* <Tab.Pane eventKey="json">
                        <JSONDataInsertion />
                    </Tab.Pane> */}
                    <Tab.Pane eventKey="scraping">
                        <WebScrapingScheduler />
                    </Tab.Pane>
                </Tab.Content>
            </Tab.Container>
        </Container>
    );
};

export default AdminDashboard;
