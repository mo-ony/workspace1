

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import { Grid, Paper, Box, IconButton, Typography, Stack } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const PdfViewer = ({ selectedPdf }) => {
  // Vérification si le PDF est sélectionné
  if (!selectedPdf) {
    return (
      <Grid item xs={8}>
        <Paper sx={{ height: "100%", padding: "20px" }}>
          <Typography variant="body1">No PDF selected</Typography>
        </Paper>
      </Grid>
    );
  }

  // Initialisation du plugin toolbar
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;

  return (
    <Grid item xs={8}>
      <Paper sx={{ height: "100%", padding: "20px", display: "flex", flexDirection: "column" }}>
        {/* Toolbar Zoom */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ p: 1, bgcolor: "#f3f3f3", borderRadius: 1 }}>
          <Toolbar>
            {(props) => (
              <>
                <IconButton onClick={props.zoomOut}>
                  <ZoomOutIcon />
                </IconButton>

                <IconButton onClick={props.zoomIn}>
                  <ZoomInIcon />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Stack>

        {/* PDF Viewer */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Box sx={{ flex: 1, overflowY: "auto" }}>
            <Viewer fileUrl={selectedPdf} plugins={[toolbarPluginInstance]} />
          </Box>
        </Worker>
      </Paper>
    </Grid>
  );
};

export default PdfViewer;




import { Worker, Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import { Grid, Paper, Box, IconButton, Typography, Stack } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const PdfViewer = ({ selectedPdf }) => {
  const toolbarPluginInstance = toolbarPlugin();
  const { ZoomInButton, ZoomOutButton, ZoomPopover } = toolbarPluginInstance;

  return (
    <Grid item xs={8}>
      <Paper sx={{ height: "100%", padding: "20px", display: "flex", flexDirection: "column" }}>
        {selectedPdf ? (
          <>
            {/* Toolbar Zoom */}
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="center"
              sx={{ p: 1, bgcolor: "#f3f3f3", borderRadius: 1 }}
            >
              <ZoomOutButton>
                {(props) => (
                  <IconButton onClick={props.onClick}>
                    <ZoomOutIcon />
                  </IconButton>
                )}
              </ZoomOutButton>

              <ZoomPopover />

              <ZoomInButton>
                {(props) => (
                  <IconButton onClick={props.onClick}>
                    <ZoomInIcon />
                  </IconButton>
                )}
              </ZoomInButton>
            </Stack>

            {/* PDF Viewer */}
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <Viewer fileUrl={selectedPdf} plugins={[toolbarPluginInstance]} />
              </Box>
            </Worker>
          </>
        ) : (
          <Typography variant="body1">No PDF selected</Typography>
        )}
      </Paper>
    </Grid>
  );
};

export default PdfViewer;




import { Worker, Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";
import { Box, Stack, IconButton } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const PdfViewer = ({ pdfBase64 }) => {
  const toolbarPluginInstance = toolbarPlugin();
  const { ZoomInButton, ZoomOutButton, ZoomPopover } = toolbarPluginInstance;

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        sx={{ p: 1, bgcolor: "#f3f3f3" }}
      >
        <ZoomOutButton>
          {(props) => (
            <IconButton onClick={props.onClick}>
              <ZoomOutIcon />
            </IconButton>
          )}
        </ZoomOutButton>

        <ZoomPopover />

        <ZoomInButton>
          {(props) => (
            <IconButton onClick={props.onClick}>
              <ZoomInIcon />
            </IconButton>
          )}
        </ZoomInButton>
      </Stack>

      {/* PDF Viewer */}
      <Box sx={{ flex: 1 }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={`data:application/pdf;base64,${pdfBase64}`} plugins={[toolbarPluginInstance]} />
        </Worker>
      </Box>
    </Box>
  );
};

export default PdfViewer;






Yes! You can add zoom controls to your PDF viewer by using the `toolbarPlugin` from `@react-pdf-viewer/toolbar`.  

### **Steps to Add Zoom In/Out:**
1. Install the necessary plugin if you haven’t already:  
   ```sh
   npm install @react-pdf-viewer/toolbar
   ```
2. Import the toolbar plugin and extract zoom controls.  
3. Integrate it into the `Viewer` component.

---

### **Updated Code with Zoom Controls**

import { Worker, Viewer } from "@react-pdf-viewer/core";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/toolbar/lib/styles/index.css";

const PdfViewer = ({ pdfBase64 }) => {
  // Initialize toolbar plugin
  const toolbarPluginInstance = toolbarPlugin();
  const { Toolbar } = toolbarPluginInstance;
  const {
    ZoomInButton,
    ZoomOutButton,
    ZoomPopover,
  } = toolbarPluginInstance;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "5px",
          backgroundColor: "#f3f3f3",
        }}
      >
        <ZoomOutButton />
        <ZoomPopover />
        <ZoomInButton />
      </div>

      {/* PDF Viewer */}
      <div style={{ flex: 1 }}>
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          <Viewer fileUrl={`data:application/pdf;base64,${pdfBase64}`} plugins={[toolbarPluginInstance]} />
        </Worker>
      </div>
    </div>
  );
};

export default PdfViewer;
```

---

### **🛠 Features Added:**
✅ **Zoom In/Out Buttons**  
✅ **Zoom Level Popover** (Dropdown to select zoom percentage)  
✅ **Minimalistic Toolbar Layout**  

Let me know if you need any more customizations! 🚀
