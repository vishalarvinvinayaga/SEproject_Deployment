import { Offcanvas, ListGroup } from "react-bootstrap";
import UsefulLinks from "../../assets/usefulLinks.json";
import { Link } from "react-router-dom";

const LinksMenu = ({
    show,
    handleClose,
}: {
    show: boolean;
    handleClose: () => void;
}) => {
    return (
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            style={{ width: "80vw", backgroundColor: "#D9ECFF" }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Useful Links</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <ListGroup>
                    {UsefulLinks.map((item, index) => (
                        <ListGroup.Item key={index} className="border rounded-3 m-1 p-3">
                            <Link target="_blank" to={item.Link}>
                                {item.Name}
                            </Link>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default LinksMenu;
