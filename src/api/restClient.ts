import axios from "axios";

class RestClient {
  private instance: any;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  axios({
          method: "post",
          url: `${API_CONFIG.REAL_API.LOGIN_ILX}`,
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" }
        })
          .then(function (response) {
            //handle success
            console.log(response);
          })
          .catch(function (response) {
            //handle error
            console.log(response);
          });

  get(url: string, params?: any) {
    return this.instance.get(url, { params });
  }

  post(url: string, data: any) {
    return this.instance.post(url, data);
  }

  put(url: string, data: any) {
    return this.instance.put(url, data);
  }

  delete(url: string) {
    return this.instance.delete(url);
  }
}

// create a singleton instance of the RestClient and export it
const restClient = new RestClient("https://api.example.com"); // replace with your base URL
export default restClient;
// Usage example:
// import restClient from './path/to/RestClient';
//
// restClient.get('/endpoint', { param1: 'value1' })
//   .then(response => console.log(response.data))
//   .catch(error => console.error('Error:', error));
//
// You can also create a custom instance with different base URL
// const customClient = new RestClient('https://another-api.example.com');
// customClient.get('/another-endpoint')
//   .then(response => console.log(response.data))
//   .catch(error => console.error('Error:', error));
//
// You can also add interceptors for request and response
// restClient.instance.interceptors.request.use(config => {
//   // Do something before request is sent
//   return config;
// }, error => {
//   // Do something with request error
//   return Promise.reject(error);
// });
//
// restClient.instance.interceptors.response.use(response => {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response;
// }, error => {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   return Promise.reject(error);
// });
//