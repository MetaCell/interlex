import {
  Box,
  Chip,
  Grid,
  Stack,
  Tooltip,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import { formatTimestamp } from "../../../utils";
import IriChip from "../../common/IriChip";
import { EditableChipList, EditableTextValue, EditedChip } from "./EditableFields";
import { useEditSession } from "../../../contexts/editSession";
import { focusNodeFromJsonLd, nodeKeyForPredicate } from "../../../parsers/predicateMutations";
import { buildExpandContext } from "../../../configuration/predicateConfig";

import { vars } from "../../../theme/variables";
const { gray800, gray500 } = vars;

// Predicates behind the editable fields of this section, as base spells them. A document may spell
// them otherwise — a fork keys related synonyms as `ilx.<group>.anno.hasRelatedSynonym`, and
// existing ids come as either of two relations — so each field is read from, and edited under, the
// key the term's own document uses: the one the predicate table groups it by and the one a
// removal has to name to match the stored triple. The first spelling is used when the term has
// no value yet.
const FIELD_PREDICATES = {
  synonyms: ["ilxr:synonym"],
  related: ["ilx.anno.hasRelatedSynonym"],
  existingIds: ["ilxtr:hasExternalId", "ilxtr:hasExistingId"],
  description: ["definition"],
};

const fieldKeysOf = (jsonData) => {
  const node = focusNodeFromJsonLd(jsonData);
  const context = { ...(jsonData?.["@context"] || {}), ...buildExpandContext() };
  return Object.fromEntries(
    Object.entries(FIELD_PREDICATES).map(([field, predicates]) => [
      field,
      nodeKeyForPredicate(node, predicates, context) ?? predicates[0],
    ])
  );
};

const literalsOf = (value) =>
  (Array.isArray(value) ? value : value == null ? [] : [value])
    .map((v) => (typeof v === "string" ? v : v?.["@value"] ?? null))
    .filter(Boolean);

// `onMutate` present means edit mode is on (OverView only passes it then).
const Details = ({ loading, data, jsonData, group = "base", termVersion, onMutate }) => {
  const editing = !!onMutate;
  const { hasPendingChanges } = useEditSession();
  const fieldKeys = fieldKeysOf(jsonData);
  const synonymsEdited = editing && hasPendingChanges([fieldKeys.synonyms, fieldKeys.related]);
  const existingIdsEdited = editing && hasPendingChanges([fieldKeys.existingIds]);
  const descriptionEdited = editing && hasPendingChanges([fieldKeys.description]);

  const processExistingIds = (existingID) => {
    if (Array.isArray(existingID)) {
      return existingID;
    } else if (typeof existingID === 'string') {
      return [existingID];
    }
    return [];
  };

  const getSynonymGroups = () => {
    const synonyms = processExistingIds(data?.synonym);
    const synonymSet = new Set(synonyms);
    const related = literalsOf(focusNodeFromJsonLd(jsonData)?.[fieldKeys.related])
      .filter((v) => !synonymSet.has(v));
    return { synonyms, related };
  };

  if (loading) return null;

  if (!data) {
    return <div>No data available</div>;
  }
  const graphArray = jsonData?.["@graph"] || [];
  const lastGraphItem = graphArray[graphArray.length - 1]
  const versionDisplay = termVersion
    ? `v${termVersion.number} · ${termVersion.identityGraph.slice(0, 8)}`
    : "";
  // Blank, not "Invalid date", when the document carries no owl:versionInfo — as an ontology-backed
  // term never does.
  const versionInfoRaw = lastGraphItem?.["owl:versionInfo"];
  const versionInfo = versionInfoRaw ? formatTimestamp(versionInfoRaw) : "";

  return (
    <>
      <Grid container>
        <Grid item xs={12} lg={5}>
          <Stack spacing=".75rem">
            <Stack direction="row" spacing=".5rem" alignItems="center">
              <Typography
                id="synonyms"
                color={gray800}
                fontWeight={500}
                component="a"
                href="#synonyms"
                sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline' } }}
              >
                Synonyms
              </Typography>
              {synonymsEdited && <EditedChip />}
            </Stack>
            {(() => {
              const { synonyms, related } = getSynonymGroups();
              if (editing) {
                return (
                  <Stack spacing="1rem">
                    <EditableChipList
                      predicate={fieldKeys.synonyms}
                      values={synonyms}
                      group={group}
                      onMutate={onMutate}
                      addLabel="Add synonym"
                    />
                    <Stack spacing=".5rem">
                      <Typography variant="caption" color={gray500}>Related</Typography>
                      <EditableChipList
                        predicate={fieldKeys.related}
                        values={related}
                        group={group}
                        onMutate={onMutate}
                        addLabel="Add related synonym"
                      />
                    </Stack>
                  </Stack>
                );
              }
              return (
                <Stack spacing=".5rem">
                  {synonyms.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap=".5rem">
                      {synonyms.map((syn) => (
                        <Tooltip key={syn} title="Synonym" arrow>
                          <Chip className="rounded" variant="outlined" label={syn} />
                        </Tooltip>
                      ))}
                    </Box>
                  )}
                  {related.length > 0 && (
                    <>
                      <Typography variant="caption" color={gray500}>Related</Typography>
                      <Box display="flex" flexWrap="wrap" gap=".5rem">
                        {related.map((syn) => (
                          <Tooltip key={syn} title="Related synonym" arrow>
                            <Chip className="rounded" variant="outlined" label={syn} color="info" size="small" />
                          </Tooltip>
                        ))}
                      </Box>
                    </>
                  )}
                  {synonyms.length === 0 && related.length === 0 && null}
                </Stack>
              );
            })()}
          </Stack>
        </Grid>
        <Grid item xs={12} lg={3}>
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Preferred ID
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.id}
            </Typography>
          </Stack>
        </Grid>
        {(editing || processExistingIds(data?.existingID).length > 0) && (
          <Grid item xs={12} lg={4}>
            <Stack spacing=".75rem">
              <Stack direction="row" spacing=".5rem" alignItems="center">
                <Typography color={gray800} fontWeight={500}>
                  Existing IDs
                </Typography>
                {existingIdsEdited && <EditedChip />}
              </Stack>
              {editing ? (
                <EditableChipList
                  predicate={fieldKeys.existingIds}
                  values={processExistingIds(data?.existingID)}
                  kind="term"
                  group={group}
                  onMutate={onMutate}
                  addLabel="Add existing ID"
                  chipClassName="rounded IDchip-outlined"
                  renderChip={(id, chipProps) => <IriChip iri={id} context={jsonData?.["@context"]} {...chipProps} />}
                />
              ) : (
                <Box display="flex" flexWrap="wrap" gap=".5rem">
                  {processExistingIds(data?.existingID).map((id) =>
                    <IriChip className="rounded IDchip-outlined" key={id} iri={id} context={jsonData?.["@context"]} />
                  )}
                </Box>
              )}
            </Stack>
          </Grid>
        )}
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12}>
          <Stack spacing=".75rem">
            <Stack direction="row" spacing=".5rem" alignItems="center">
              <Typography color={gray800} fontWeight={500}>
                Description
              </Typography>
              {descriptionEdited && <EditedChip />}
            </Stack>
            {editing ? (
              <EditableTextValue
                predicate={fieldKeys.description}
                value={data?.description || ""}
                onMutate={onMutate}
                placeholder="Describe this term"
              />
            ) : (
              <Typography fontSize=".875rem" color={gray500}>
                {data?.description}
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
      <Grid container mt="2.5rem">
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Type
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.type}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Version
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {versionDisplay}
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              OWL equivalent
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {data?.owlEquivalent}
            </Typography>
          </Stack>
        </Grid>
        {data?.submittedBy && (
          <Grid item xs={12} lg={4} mb=".75rem">
            <Stack spacing=".75rem">
              <Typography color={gray800} fontWeight={500}>
                Originally submitted by
              </Typography>
              <Typography fontSize=".875rem" color={gray500}>
                {data?.submittedBy}
              </Typography>
            </Stack>
          </Grid>
        )}
        {data?.lastModifiedBy && (
          <Grid item xs={12} lg={4} mb=".75rem">
            <Stack spacing=".75rem">
              <Typography color={gray800} fontWeight={500}>
                Last modified by
              </Typography>
              <Typography fontSize=".875rem" color={gray500}>
                {data?.lastModifiedBy}
              </Typography>
            </Stack>
          </Grid>
        )}
        <Grid item xs={12} lg={4} mb=".75rem">
          <Stack spacing=".75rem">
            <Typography color={gray800} fontWeight={500}>
              Last modify timestamp
            </Typography>
            <Typography fontSize=".875rem" color={gray500}>
              {versionInfo}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}

Details.propTypes = {
  loading: PropTypes.bool.isRequired,
  data: PropTypes.object,
  jsonData: PropTypes.object,
  group: PropTypes.string,
  termVersion: PropTypes.shape({
    number: PropTypes.number.isRequired,
    identityGraph: PropTypes.string.isRequired,
  }),
  onMutate: PropTypes.func
};

export default Details;
