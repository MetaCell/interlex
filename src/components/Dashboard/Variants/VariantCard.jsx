import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import ListingCard from "../../common/ListingCard";

const VariantCard = ({ term, action }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const parts = term.iri?.split('/');
    const group = parts?.[parts.length - 2] || 'base';
    navigate(`/${group}/${term.id}/overview`);
  };

  return (
    <ListingCard
      title={term?.label}
      badge={term?.status}
      description={term?.description}
      action={action}
      onClick={handleClick}
    />
  );
};

VariantCard.propTypes = {
  term: PropTypes.object.isRequired,
  action: PropTypes.node
};

export default VariantCard;
