import axiosInstance from '.';
import endpoints from './endpoints';

export interface RiderApplicationData {
  name: string;
  vehicleInfo: string;
  idLicense: string;
  contactNumber: string;
  email: string;
}

export const submitRiderApplication = (data: RiderApplicationData) => {
  console.log('Submitting rider application:', data);
  return axiosInstance.post(endpoints.rider.submitApplication, data);
};
