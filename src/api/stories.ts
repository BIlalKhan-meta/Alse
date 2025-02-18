import axiosInstance from ".";
import endpoints from "./endpoints";

export const GetStories = () => {
  return axiosInstance.get(`${ endpoints.stories.getStories }`);
};

export const AddStory = ({ file }: { file: any }) => {
  const formData = new FormData();
  
  formData.append('file', file);

  return axiosInstance({
    url: `${ endpoints.stories.addStories }`,
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json'
    }
  })
}