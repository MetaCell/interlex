import PropTypes from "prop-types";
import CustomButton from "../common/CustomButton";
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';

export const AddTermToActiveOntology = ({ label }) => {
    const handleClick = (e) => {
        e.stopPropagation();
        console.log('Add term to active ontology', label);
    };

    return (
        <CustomButton className="listingAction" onClick={handleClick}>
            <CreateNewFolderOutlinedIcon fontSize="medium" />
            Add term to active ontology
        </CustomButton>
    );
};

AddTermToActiveOntology.propTypes = {
    label: PropTypes.string
};

export const DownloadOntology = () => (
    <CustomButton className="listingAction" disabled>
        <DownloadOutlinedIcon fontSize="medium" />
        Download ontology
    </CustomButton>
);
