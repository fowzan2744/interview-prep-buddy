import axiosInstance from "./axiosInstance";

const uploadImage = async (img) =>
{
    const formData = new FormData();
    formData.append('image',img);

    try{
        const response = await axiosInstance.post("/auth/image-upload", formData , {
            headers: {
                'Content-Type' : 'multipart/form-data'
            }, { withCredentials: true }
        });
        return response.data;
    } catch(error)
    {
        console.error("ERROR IN UPLOADING IMG: " ,error );
        throw error;
    }
};

export default uploadImage
