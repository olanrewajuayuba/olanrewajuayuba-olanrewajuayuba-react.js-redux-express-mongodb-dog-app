import { combineReducers } from "redux";
import authReducer from "./authReducer";
import errorReducers from "./errorReducers";
import fileReducer from "./fileReducer";

export default combineReducers({
  auth: authReducer,
  errors: errorReducers,
  dog: fileReducer
});
