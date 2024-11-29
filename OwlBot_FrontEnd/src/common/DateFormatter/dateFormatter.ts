import moment from "moment";

export const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    return moment(dateString).format("LLL");
};