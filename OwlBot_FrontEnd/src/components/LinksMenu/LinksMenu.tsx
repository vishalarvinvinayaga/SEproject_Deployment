import { Offcanvas, ListGroup } from "react-bootstrap";

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
                    <ListGroup.Item>
                        <a
                            href="https://example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Example Link 1
                        </a>
                    </ListGroup.Item>
                    <ListGroup.Item>
                        <a
                            href="https://example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Example Link 2
                        </a>
                    </ListGroup.Item>
                </ListGroup>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default LinksMenu;
