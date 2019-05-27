import React from "react";
import { HorizontalBar } from "react-chartjs-2";
import { withRouter } from "react-router-dom";

const DogGraph = props => {
  const data = {
    labels: props.graphLabels,
    datasets: [
      {
        label: "Confidence Level(%)",
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
        hoverBackgroundColor: "rgba(255,99,132,0.4)",
        hoverBorderColor: "rgba(255,99,132,1)",
        data: props.graphData
      }
    ]
  };
  return (
    <div>
      <HorizontalBar data={data} />
    </div>
  );
};

export default withRouter(DogGraph);
