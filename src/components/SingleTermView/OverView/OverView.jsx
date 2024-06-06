import {
  Box,
  Divider,
  Grid,
} from "@mui/material";
import Hierarchy from "./Hierarchy";
import Predicates from "./Predicates";
import Details from "./Details";
import CodeSnippet from "./CodeSnippet";
import RawDataViewer from "./RawDataViewer";

const data = `@prefix : <file:///ERROR/EMPTY/PREFIX/BANNED/> .
@prefix BIRNLEX: <http://uri.neuinfo.org/nif/nifstd/birnlex_> .
@prefix definition: <http://purl.obolibrary.org/obo/IAO_0000115> .
@prefix fma: <http://purl.org/sig/ont/fma/> .`

const jsonData = `{"menu": {
  "id": "file",
  "value": "File",
  "popup": {
    "menuitem": [
      {"value": "New", "onclick": "CreateNewDoc()"},
      {"value": "Open", "onclick": "OpenDoc()"},
      {"value": "Close", "onclick": "CloseDoc()"}
    ]
  }
}}`

const OverView = ({ isCodeViewVisible }) => {
  return (
    <>
      {isCodeViewVisible ?
        <>
          <RawDataViewer data={jsonData} />
        </> :
        <>
          <Details />
          <Box p='5rem 0'>
            <Divider />
            <Grid container pt='5.25rem' spacing='2.75rem'>
              <Grid item xs={12} lg={4}>
                <Hierarchy />
              </Grid>
              <Grid item xs={12} lg={8}>
                <Predicates />
              </Grid>
            </Grid>
          </Box>
        </>
      }
    </>
  )
}

export default OverView

const exampleCode = `import React from "react"`