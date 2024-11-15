import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { store } from "../redux/store"; // Adjust path to your store
import ChatBot from "../components/ChatBot/ChatBot";
import {
    sendMessageToBackend,
    fetchMessagesFromBackend,
} from "../redux/chatSlice";
// import { mockStore } from "redux-mock-store"; // You can use this to mock redux store if needed

jest.mock("../redux/chatSlice", () => ({
    sendMessageToBackend: jest.fn(),
    fetchMessagesFromBackend: jest.fn(),
}));

describe("ChatBot Component", () => {
    test("renders chat bot with initial greeting", () => {
        render(
            <Provider store={store}>
                <ChatBot />
            </Provider>
        );

        // Check if the initial bot message is displayed
        expect(
            screen.getByText(/Hello! How can I assist you today?/)
        ).toBeInTheDocument();
    });

    test("can type and send a message", async () => {
        render(
            <Provider store={store}>
                <ChatBot />
            </Provider>
        );

        const input = screen.getByPlaceholderText(/Ask Query.../);
        fireEvent.change(input, { target: { value: "Hello" } });

        const sendButton = screen.getByText("Send");
        fireEvent.click(sendButton);

        // Assuming the `sendMessageToBackend` dispatch is called
        expect(sendMessageToBackend).toHaveBeenCalledWith("Hello");
    });

    test("shows loading indicator when message is being sent", async () => {
        render(
            <Provider store={store}>
                <ChatBot />
            </Provider>
        );

        const input = screen.getByPlaceholderText(/Ask Query.../);
        fireEvent.change(input, { target: { value: "Hello" } });

        const sendButton = screen.getByText("Send");
        fireEvent.click(sendButton);

        // Test loading indicator is shown
        expect(screen.getByText("...")).toBeInTheDocument();
    });

    // test("displays error message when there is an error", async () => {
    //     jest.mocked(fetchMessagesFromBackend).mockRejectedValueOnce(
    //         "Failed to fetch messages"
    //     );

    //     render(
    //         <Provider store={store}>
    //             <ChatBot />
    //         </Provider>
    //     );

    //     // Check if error message is displayed
    //     await waitFor(() =>
    //         expect(
    //             screen.getByText("Failed to fetch messages")
    //         ).toBeInTheDocument()
    //     );
    // });
});
