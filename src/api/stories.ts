import axiosInstance from ".";
import endpoints from "./endpoints";

export const GetStories = () => {
  return axiosInstance.get(`${ endpoints.stories.getStories }`);
};

export const AddStory = async (formData: FormData) => {
  return axiosInstance.post(`${ endpoints.stories.addStories }`, formData, {
    formData: true,
  });
}