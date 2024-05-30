import * as React from 'react';
import {Box} from '@mui/material';
import VariantsTable from './VariantsTable';

const rows = [
    {
        id: 1, organization: 'Cupcake',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 2, organization: 'Donut',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 3, organization: 'Eclair',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Inactive', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 4, organization: 'Frozen yoghurt',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 5, organization: 'Gingerbread',
        description: "The central nervous system (CNS) is the part of the nervous system which includes the brain, spinal cord, and nerve cell layer of the retina. In animals with bilateral symmetry, it is a topographic division that is a condensation of the nervous system in the longitudinal plane, lying on or near the median plane. For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Deleted', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 6, organization: 'Honeycomb',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 7, organization: 'Ice cream sandwich',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 8, organization: 'Jelly Bean',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 9, organization: 'KitKat',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 10, organization: 'Lollipop',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    },
    {
        id: 11, organization: 'Marshmallow',
        description: "For invertebrates the longitudinal division consists of one or more nerve cords, whereas for vertebrates it consists of a single, hollow, and dorsal cerebrospinal axis.In adult Echinoderms, which are radially symmetrical, a presumptive CNS is formed by a circular cord with associated radial cords. However, there is no ganglion that could be considered as brain in invertebrate When a CNS is present, its obligate companion topographic division is a peripheral nervous system.",
        timestamp: '24 Mar 12:08 AM', status: 'Active', originated_user: 'Olivia Rhye', editing_user: 'Olivia Rhye', originated_user_email: 'olivia@untitledui.com', editing_user_email: 'olivia@untitledui.com'
    }
];

const headCells = [
    { id: 'organization', label: 'Organization' },
    { id: 'description', label: 'Description' },
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'status', label: 'Status' },
    { id: 'originated_user', label: 'Originated User' },
    { id: 'editing_user', label: 'Editing User' },
    { id: 'action_buttons', label: '' }
];

const VariantsPanel = () => {
    return (
        <Box width={1}>
            <VariantsTable rows={rows} headCells={headCells}/>
        </Box>
    )
}
export default VariantsPanel;
