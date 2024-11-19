import { Offcanvas } from "react-bootstrap";

const NewsFeedMenu = ({
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
            placement="start"
            style={{ width: "80vw", backgroundColor: "#D9ECFF" }}
        >
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>News Feed</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div
                    className="news-feed"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}
                >
                    <p>News Item 1</p>
                    <p>News Item 2</p>
                    <p>News Item 3</p>
                    <p>News Item 4</p>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default NewsFeedMenu;
