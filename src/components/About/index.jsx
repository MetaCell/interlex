import { Box, Container, Grid, List, ListItem, ListItemButton, ListItemText, Typography } from "@mui/material";
import { vars } from "../../theme/variables";
import { ForwardIcon } from "../../Icons";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import React from "react";
import TabsData from "../../static/AboutTabs.json";
const { gray50, gray700, gray500, brand700 } = vars;

const style = {
    heading: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: '126.667%',
        color: gray700
    },

    headingSecondary: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: '150%',
        color: gray700
    },

    list: {
        padding: 0,
        '& li': {
            padding: 0,

            '& p': {
                fontWeight: 600,
                color: brand700
            },

            '&:not(:first-child)': {
                marginTop: '1.5rem'
            },

            '& > div': {
                position: 'static'
            },
            '& a': {
                flex: 'none',
                padding: '0 !important',

                '&:hover': {
                    background: 'transparent'
                },

                '& > div': {
                    margin: 0,
                    flex: 'none',
                    '& > span': {
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                    }
                }
            }
        }
    },

    descriptionSecondary: {
        fontSize: '1.125rem',
        lineHeight: '155.556%',
        color: gray500,
        minHeight: '12.5rem'
    },

    description: {
        fontSize: '1.125rem',
        lineHeight: '155.556%',
        color: gray500,

        '&:not(:first-child)': {
            marginTop: '1rem'
        }
    }
}

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            {...other}
        >
            {value === index && children}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const About = () => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    return (
        <Box sx={{ padding: '8rem 0 6rem' }}>
            <Container maxWidth="xl">
                <Box mb="10rem">
                    <Grid container spacing={0}>
                        <Grid item xs={2}>
                        <Tabs
                                orientation="vertical"
                                variant="scrollable"
                                value={value}
                                onChange={handleChange}
                        >
                            {
                                TabsData.tabs.map((tab, index) => (
                                    <Tab label={tab?.heading} {...a11yProps(index)} key={tab?.heading} />
                                ))
                            }                          
                        </Tabs>      
                        </Grid>
                        <Grid item xs={10}>
                            {
                                TabsData?.tabs?.map((tab, index) => (
                                    <TabPanel value={value} index={index} key={tab?.heading+index}>
                                        <Grid container spacing={4}>
                                            <Grid item xs={9}>
                                                <Typography sx={{ ...style.headingSecondary, mb: '1.5rem' }}>
                                                    {tab?.content?.heading}
                                                </Typography>

                                                <Typography sx={style.descriptionSecondary}>
                                                    {tab?.content?.text}
                                                </Typography>
                                            </Grid>

                                            <Grid item xs={3}>
                                                <Typography sx={{ ...style.headingSecondary, mb: '1.5rem' }}>Quick links</Typography>

                                                <List sx={style.list}>
                                                    {   tab?.content?.links?.map((link, index) => (
                                                            <ListItem key={link?.label+index}>
                                                                <ListItemButton component="a" href={link?.url}>
                                                                    <ListItemText primary={<><Typography>{link?.label}</Typography><ForwardIcon /></>} />
                                                                </ListItemButton>
                                                            </ListItem>
                                                        ))
                                                    }
                                                </List>
                                            </Grid>
                                        </Grid>
                                    </TabPanel>
                                ))
                            }
                        </Grid>
                    </Grid>
                </Box>
                <Box sx={{ borderRadius: '0.75rem', background: gray50, p: '4rem' }}>
                    <Grid container spacing={0}>
                        <Grid item xs={4}>
                            <Typography sx={style.heading}>About Interlex</Typography>
                        </Grid>

                        <Grid item xs={8}>
                            <Typography sx={style.description}>
                                The InterLex project - a core component of SciCrunch and supported by projects such as the Neuroscience Information Framework project (NIF), the NIDDK Information Network (dkNET), and the Open Data Commons for Spinal Cord Injury - is a dynamic lexicon of biomedical terms. Unlike an encyclopedia, a lexicon provides the meaning of a term, and not all there is to know about it. InterLex is being constructed to help improve the way that biomedical scientists communicate about their data, so that information systems like NIF and dkNET can find data more easily and provide more powerful means of integrating that data across distributed resources. One of the big roadblocks to data integration in the biomedical sciences is the inconsistent use of terminology in databases and other resources such as the literature. When we use the same terms to mean different things, we cannot easily ask questions that span across multiple resources. For example, if three databases have information about what genes are expressed in cortex, but they all use different definitions of cerebral cortex, then it is hard to compare them. InterLex allows for the association of data values (i.e. the value of a field or text within a field) to terminologies enabling the crowdsourcing of data-terminology mappings.
                            </Typography>
                            <Typography sx={style.description}>
                                InterLex was built on the foundation of NeuroLex (see Larson and Martone 2013 Neurolex: An online framework for neuroscience knowledge. Frontiers in Neuroinformatics, 7:18) and contains all of the existing NeuroLex terms. The initial entries in NeuroLex were built from the NIFSTD ontologies. NIFSTD currently has about 60,000 concepts (includes both classes and synonyms) that span gross anatomy, cells, subcellular structures, diseases, functions and techniques. InterLex models terms using primitives of the Web Ontology Language (OWL) and can export directly to a variety of standard ontology formats.
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    )
}

export default About;