import PropTypes from 'prop-types';
import ListingCard from "../../common/ListingCard";

const OntologyCard = ({ ontology, onSelect, action }) => (
  <ListingCard
    title={ontology?.label}
    badge={ontology?.badge}
    description={ontology?.description}
    action={action}
    onClick={() => onSelect(ontology)}
  />
);

OntologyCard.propTypes = {
  ontology: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  action: PropTypes.node
};

export default OntologyCard;
