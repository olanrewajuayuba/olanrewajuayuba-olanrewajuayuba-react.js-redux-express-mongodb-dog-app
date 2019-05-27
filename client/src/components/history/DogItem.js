import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import isEmpty from "../../validation/is-empty";
import DogGraph from "../dashboard/DogGraph";

class DogItem extends Component {
  render() {
    const { dog } = this.props;

    return (
      <div className="flex-row">
        <div className="item-1">
          <img
            src={
              "https://storage.cloud.google.com/know-your-dog-2/" + dog.image
            }
            alt=""
            width="300"
            height="300"
            className="rounded-circle"
          />
        </div>
        <div className="item-2">
          <DogGraph graphLabels={dog.breed} graphData={dog.probability} />
        </div>
      </div>
    );
  }
}

DogItem.propTypes = {
  dog: PropTypes.object.isRequired
};

export default DogItem;
