import { GET_DOG, GET_DOGS, IMAGE_LOADING } from "./types";
import axios from "axios";

export const uploadFile = (formData, history) => dispatch => {
  axios
    .post("/api/images/upload", formData)
    .then(res => {
      console.log("***response******", res.data.file);
      axios
        .post("/api/dogs/dogs", { imageUrl: res.data.file })
        .then(function(response) {
          dispatch({
            type: GET_DOG,
            payload: response.data
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    })

    .catch(err => console.log(err));
};

// Get all dogs
export const getDogs = () => dispatch => {
  dispatch(setDogsLoading());
  console.log("getDogs");
  axios
    .get("/api/dogs/")
    .then(res =>
      dispatch({
        type: GET_DOGS,
        payload: res.data
      })
    )
    .catch(err =>
      dispatch({
        type: GET_DOGS,
        payload: null
      })
    );
};

// Profile loading
export const setDogsLoading = () => {
  return {
    type: IMAGE_LOADING
  };
};
