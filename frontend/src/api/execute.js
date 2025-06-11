import axiosInstance from "./axiosInstance";
export const executeCode = async (language, code, input) => {
    try{
        
        const response = await axiosInstance.post("/execute/run", {language, code, input});
        return response.data;
    }catch(error){
        throw error;
    }
}
