import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Spinner from "../common/Spinner";
import DogItem from "./DogItem";
import { getDogs } from "../../actions/imageActions";

class Dogs extends Component {
  componentDidMount() {
    this.props.getDogs();
  }

  render() {
    const { dogs, loading } = this.props.dog;
    let dogItems;

    if (dogs === null || loading) {
      dogItems = <Spinner />;
    } else {
      if (dogs.length > 0) {
        dogItems = dogs.map(dogs => <DogItem key={dogs._id} dog={dogs} />);
      } else {
        dogItems = <h4>No dogs found...</h4>;
      }
    }

    return (
      <div className="profiles">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <h1 className="display-4 text-center">History</h1>
              <p className="lead text-center">ALL Dogs</p>
              {dogItems}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Dogs.propTypes = {
  getDogs: PropTypes.func.isRequired,
  dog: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  dog: state.dog
});

export default connect(
  mapStateToProps,
  { getDogs }
)(Dogs);
