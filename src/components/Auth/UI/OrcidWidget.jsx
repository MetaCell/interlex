import React from "react";
import PropTypes from "prop-types";

const OrcidWidget = ({ clientId, redirectUri }) => {
  return (
    <div
      id="orcidWidget"
      data-clientid={clientId}
      data-redirecturi={redirectUri}
      data-env="sandbox"
      data-size="lg"
      style={{ height: "2.75rem" }}
    />
  )
}
OrcidWidget.propTypes = {
  clientId: PropTypes.string.isRequired,
  redirectUri: PropTypes.string.isRequired,
};

export default OrcidWidget;
