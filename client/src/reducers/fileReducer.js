import { IMAGE_LOADING, GET_DOG, GET_DOGS } from "../actions/types";

const initialState = {
  dog: null,
  dogs: null,
  loading: false
};

export default (state = initialState, action) => {
  switch (action.type) {
    case IMAGE_LOADING:
      return {
        ...state,
        loading: true
      };
    case GET_DOG:
      return {
        ...state,
        dog: action.payload,
        loading: false
      };
    case GET_DOGS:
      return {
        ...state,
        dogs: action.payload,
        loading: false
      };
    default:
      return state;
  }
};
