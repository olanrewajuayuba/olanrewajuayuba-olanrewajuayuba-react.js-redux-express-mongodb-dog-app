import React, { Component } from "react";
import { Button, FormControl, Card } from "react-bootstrap";
import axios from "axios";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { uploadFile } from "../../actions/imageActions";
import Spinner from "../common/Spinner";
import isEmpty from "../../validation/is-empty";
import { store } from "../../store";
import DogGraph from "./DogGraph";

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      graphLabels: [],
      graphData: [],
      image: null
    };
  }

  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    let res = nextProps.dog.dog;
    console.log(nextProps.dog.dog.id);

    this.setState({
      image: nextProps.dog.dog.image,
      graphLabels: nextProps.dog.dog.breed,
      graphData: nextProps.dog.dog.probability
    });
  }

  fileUploadHandler = event => {
    const formData = new FormData();
    formData.append("image", this.state.selectedFile);
    this.props.uploadFile(formData, this.props.history);
  };

  fileSelectedHandler = event => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  };

  handleChange() {
    // and whenever the store state changes, it re-renders.
    this.forceUpdate();
  }

  render() {
    const { user } = this.props.auth;
    const { dog } = this.props;
    let dashboardContent;
    let dogContent;

    dogContent = (
      <div>
        <p> Breed {this.state.graphLabels} </p>
        <p> Probability {this.state.graphData} </p>
        <img src={this.state.image} alt="Dog image" />
      </div>
    );

    // dogContent = <DogItem key={this._id} dog={this.state.dog} />;

    //user logged in but has no images
    dashboardContent = (
      <div>
        <p> Welcome {user.name} </p>
      </div>
    );

    return (
      <div id="container">
        {dashboardContent}
        <h1>Image Processing</h1>
        <label className="file">
          <input type="file" id="file" onChange={this.fileSelectedHandler} />
          <span className="file-custom" />
        </label>
        <br />
        <Button
          type="submit"
          variant="secondary"
          onClick={this.fileUploadHandler}
        >
          Process
        </Button>
        {this.state.image === null ? (
          <Spinner />
        ) : (
          <Card className="dog-card">
            <Card.Body>
              <Card.Img
                top
                width="100%"
                src={
                  "https://storage.cloud.google.com/know-your-dog-2/" +
                  this.state.image
                }
                alt="dog"
                className="img-responsive"
              />
              <DogGraph
                graphLabels={this.state.graphLabels}
                graphData={this.state.graphData}
              />
            </Card.Body>
          </Card>
        )}
      </div>
    );
  }
}

Dashboard.propTypes = {
  uploadFile: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  dog: state.dog
});

export default connect(
  mapStateToProps,
  { uploadFile }
)(withRouter(Dashboard));

// export default Dashboard;
