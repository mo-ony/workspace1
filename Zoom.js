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
