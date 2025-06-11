import axiosInstance from "./axiosInstance"

export const generateInvite = async (projectId) => {
    try {
        const response = await axiosInstance.post('/invite/generateInvite', { projectId });
        return response.data;
    } catch (error) {
        console.error('Error generating invite:', error);
        throw error;
    }
}

export const verifyInvite = async (inviteId) => {
    try {
        const response = await axiosInstance.get(`/invite/verifyInvite/${inviteId}`);
        return response.data;
    } catch (error) {
        console.error('Error verifying invite:', error);
        throw error;
    }
}