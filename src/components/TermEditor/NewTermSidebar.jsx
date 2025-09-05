import PropTypes from 'prop-types';
import { StartIcon, JoinRightIcon } from '../../Icons';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import {
    Box,
    Typography,
    IconButton,
    Tooltip,
    Stack,
    Chip,
    Button,
    Skeleton
} from '@mui/material';
import { vars } from '../../theme/variables';

const {
    gray200,
    gray300,
    gray800,
    brand600,
    gray900,
    gray600,
    error300,
    error25,
    error500,
} = vars;

const SIDEBAR_STYLES = {
    expanded: '35rem',
    collapsed: '5.75rem',
    transition: 'all 0.5s ease',
};

const EXACT_MATCH_STYLES = {
    border: `1px solid ${error300}`,
    boxShadow: '0 1px 2px 0 rgba(16, 24, 40, 0.05), 0 0 0 4px rgba(240, 68, 56, 0.24)',
    backgroundColor: error25,
    borderRadius: '0.5rem'
};

const HOVER_INDICATOR_STYLES = {
    position: 'absolute',
    left: 0,
    content: '""',
    height: '1.5rem',
    borderRadius: '3px',
    width: '2px',
    background: brand600
};

const ExpandedHeader = ({ onToggle }) => (
    <Box
        width={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={5}
    >
        <Typography sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: gray800
        }}>
            Potential matches
        </Typography>
        <Tooltip title="Collapse potential matches" placement="left">
            <IconButton
                onClick={onToggle}
                sx={{ border: `1px solid ${gray200}` }}
            >
                <StartIcon />
            </IconButton>
        </Tooltip>
    </Box>
);

const CollapsedHeader = ({ onToggle }) => (
    <Box>
        <Tooltip title="Open potential matches" placement="left">
            <IconButton
                onClick={onToggle}
                sx={{ border: `1px solid ${gray200}` }}
            >
                <JoinRightIcon />
            </IconButton>
        </Tooltip>
    </Box>
);

const EmptyState = () => (
    <Box
        width={1}
        height={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
    >
        <IconButton sx={{
            padding: '10px',
            color: '#dce1e0ff',
            border: `1px solid ${gray300}`
        }}>
            <ErrorOutlineIcon />
        </IconButton>
        <Stack direction="column" gap={0.5} alignItems="center">
            <Typography variant="body1" sx={{ fontWeight: 600, color: gray900 }}>
                No match found
            </Typography>
            <Typography variant="body2" sx={{ color: gray600 }}>
                Add a label to your term to visualize potential matches.
            </Typography>
        </Stack>
    </Box>
);

const ResultItemSkeleton = () => (
    <Box
        width={1}
        display="flex"
        flexDirection="column"
        px={1}
        py={1.5}
        gap={1}
        sx={{ borderBottom: `1px solid ${gray200}` }}
    >
        <Stack direction="column" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <Stack direction="row" spacing={0.5}>
                <Skeleton variant="rounded" width={150} height={24} />
                <Skeleton variant="rounded" width={150} height={24} />
            </Stack>
            <Skeleton variant="rounded" width="100%" height={36} />
            <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={24} height={20} />
                <Skeleton variant="rounded" width={150} height={20} />
            </Stack>
        </Stack>
    </Box>
);

const ResultItem = ({ result, searchValue, onResultAction }) => {
    const isExactMatch = result.label.toLowerCase() === searchValue?.toLowerCase();

    const getItemStyles = () => ({
        borderBottom: `1px solid ${gray200}`,
        position: 'relative',
        ...(isExactMatch && EXACT_MATCH_STYLES),
        '&:hover': {
            ...(!isExactMatch && {
                '&:before': HOVER_INDICATOR_STYLES
            })
        }
    });

    return (
        <Box
            width={1}
            key={result.id || result.ilx}
            display="flex"
            flexDirection="column"
            px={1}
            py={1.5}
            gap={1}
            sx={getItemStyles()}
        >
            <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
                <Stack direction="row" spacing={1}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {result.label}
                    </Typography>
                    {isExactMatch && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <Typography>Central Nervous System</Typography>
                            <Chip label="ODC-TBI" variant="outlined" />
                        </Box>
                    )}
                </Stack>

                {isExactMatch && (
                    <>
                        <Button
                            color="secondary"
                            endIcon={<ArrowOutwardIcon />}
                            variant="text"
                            sx={{
                                padding: 0,
                                height: "auto",
                                '&:hover': { backgroundColor: "transparent" }
                            }}
                            onClick={() => onResultAction(result)}
                        >
                            Go to term
                        </Button>
                        <ErrorOutlineIcon sx={{ color: error500 }} />
                    </>
                )}
            </Stack>

            <Typography
                variant="caption"
                sx={{
                    overflow: 'hidden',
                    letterSpacing: 0,
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis'
                }}
            >
                {result.definition}
            </Typography>
        </Box>
    );
};

export default function NewTermSidebar({
    open,
    loading,
    onToggle,
    results,
    isResultsEmpty,
    searchValue,
    onResultAction
}) {

    const sidebarStyles = {
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${gray200}`,
        transition: SIDEBAR_STYLES.transition,
        p: 3,
        minWidth: open ? SIDEBAR_STYLES.expanded : SIDEBAR_STYLES.collapsed,
        maxWidth: open ? SIDEBAR_STYLES.expanded : SIDEBAR_STYLES.collapsed,
        overflowY: 'auto',
        '::-webkit-scrollbar': {
            display: 'none',
        },
        scrollbarWidth: 'none',
        position: 'relative',
    };

    return (
        <Box sx={sidebarStyles}>
            {open ? (
                <ExpandedHeader onToggle={onToggle} />
            ) : (
                <CollapsedHeader onToggle={onToggle} />
            )}

            {open && results && (
                <Box
                    width={1}
                    height={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={1}
                >
                    {loading ? (
                        Array.from(new Array(10)).map((_, index) => (
                            <ResultItemSkeleton key={index} />
                        ))
                    ) : isResultsEmpty ? (
                        <EmptyState />
                    ) : (
                        <>
                            {results?.map((result) => (
                                <ResultItem
                                    key={result.id || result.ilx}
                                    result={result}
                                    searchValue={searchValue}
                                    onResultAction={onResultAction}
                                />
                            ))}
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
}


ExpandedHeader.propTypes = {
    onToggle: PropTypes.func.isRequired,
};

CollapsedHeader.propTypes = {
    onToggle: PropTypes.func.isRequired,
};

ResultItem.propTypes = {
    result: PropTypes.object.isRequired,
    searchValue: PropTypes.string,
    onResultAction: PropTypes.func,
};

NewTermSidebar.propTypes = {
    open: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    results: PropTypes.array.isRequired,
    isResultsEmpty: PropTypes.bool.isRequired,
    searchValue: PropTypes.string.isRequired,
    onResultAction: PropTypes.func,
};