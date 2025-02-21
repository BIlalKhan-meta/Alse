import axiosInstance from ".";
import store from "../store";
import { BASE_URL } from "../utils/baseurl";
import endpoints from "./endpoints";

export const GetStories = () => {
  return axiosInstance.get(`${ endpoints.stories.getStories }`);
};

export const AddStory = async (file: any) => {
  const token = store.getState().auth.token;

  if (!token) {
    console.log("NO TOKEN IN STORY:: ", token);

    return null;
  }

  const myHeaders = new Headers();
  myHeaders.append("Authorization", token);

  const formData = new FormData();

  formData.append('file', file);

  const res = await fetch(`${ BASE_URL }/${ endpoints.stories.addStories }`, {
    method: 'POST',
    body: formData,
    headers: myHeaders,
  });

  return res.json();
}