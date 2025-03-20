
 vHere's the updated code using **`@react-pdf-viewer`** to display the PDF from a **Base64 string** instead of an `<iframe>`. 🚀  

---

### **📌 Steps Covered**
1. **Fetch contracts** and display them in a table.
2. **Clicking "View" button**:
   - Opens a popup.
   - Shows a **loading spinner**.
   - Fetches the PDF **Base64 string** from the API.
   - Displays the PDF using **React PDF Viewer**.
3. **Popup can be closed** using the close button.

---

### **✅ Full Updated Code**

import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, CircularProgress, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import axios from "axios";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const ContractsTable = () => {
  const [contracts, setContracts] = useState([]);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfBase64, setPdfBase64] = useState(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get("/api/contracts"); // Update with your API route
      setContracts(response.data);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    }
  };

  const handleViewClick = async (contractId) => {
    setSelectedContractId(contractId);
    setPdfOpen(true);
    setLoading(true);
    setPdfBase64(null);

    try {
      const response = await axios.get(`/api/get-pdf`, {
        params: { contractId },
        responseType: "json", // API should return { pdf: "BASE64_STRING" }
      });
      setPdfBase64(response.data.pdf);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Contracts List</h2>
      <table border="1" width="100%">
        <thead>
          <tr>
            <th>#</th>
            <th>Contract Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, index) => (
            <tr key={contract.numPolice}>
              <td>{index + 1}</td>
              <td>{contract.numPolice}</td>
              <td>
                <Button onClick={() => handleViewClick(contract.numPolice)}>
                  <PictureAsPdfIcon />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDF Viewer Popup */}
      <Dialog open={pdfOpen} onClose={() => setPdfOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          View Contract
          <IconButton onClick={() => setPdfOpen(false)} style={{ position: "absolute", right: 10, top: 10 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ minHeight: 500, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {loading ? (
            <CircularProgress />
          ) : pdfBase64 ? (
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`}>
              <Viewer fileUrl={`data:application/pdf;base64,${pdfBase64}`} />
            </Worker>
          ) : (
            <p>Error loading PDF.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContractsTable;
```

---

### **📦 Install Dependencies**
If you haven’t installed **react-pdf-viewer**, run:  
```sh
npm install @react-pdf-viewer/core
```

---

### **🚀 Features & Improvements**
✅ **Uses `@react-pdf-viewer/core`** for smooth PDF rendering.  
✅ **Fetches PDF as a Base64 string** and displays it properly.  
✅ **Shows loading spinner** until the PDF is ready.  
✅ **Clean and responsive popup** using Material-UI.  

---

### **✨ Now You Have a Full-Featured PDF Viewer!**  
Let me know if you need modifications! 🔥

Here’s how you can implement this:  

### ✅ Steps:
1. **Show a popup/modal when clicking "View"**
2. **Fetch the PDF (Base64) using `axios` when the popup opens**
3. **Show a loading indicator while fetching the PDF**
4. **Display the PDF once the request is complete**  

---

### **🚀 Updated Code**
```jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const PdfViewerPopup = ({ open, onClose, pdfBase64 }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>PDF Preview</DialogTitle>
      <DialogContent>
        {pdfBase64 ? (
          <iframe
            src={`data:application/pdf;base64,${pdfBase64}`}
            width="100%"
            height="500px"
            title="PDF Document"
          />
        ) : (
          <CircularProgress />
        )}
      </DialogContent>
    </Dialog>
  );
};

const PdfTable = () => {
  const [open, setOpen] = useState(false);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPdf = async () => {
    setLoading(true);
    setPdfBase64(null);

    try {
      const response = await axios.get("/api/get-pdf", {
        responseType: "json", // The API should return a JSON with { pdf: "BASE64_STRING" }
      });
      setPdfBase64(response.data.pdf);
    } catch (error) {
      console.error("Error fetching PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchPdf();
  };

  const handleClose = () => {
    setOpen(false);
    setPdfBase64(null);
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        View PDF
      </Button>

      <PdfViewerPopup open={open} onClose={handleClose} pdfBase64={pdfBase64} />

      {loading && <CircularProgress />}
    </div>
  );
};

export default PdfTable;
```

---

### **🎯 Key Features**
✅ Click **"View PDF"** → Opens a popup  
✅ **Axios request** fetches PDF in **Base64 format**  
✅ **Loading spinner** appears while fetching  
✅ **PDF is displayed** in an `<iframe>` once loaded  

---

### **🚀 Next Steps**
- Replace `"/api/get-pdf"` with your real endpoint.  
- Ensure the API returns a JSON like `{ "pdf": "BASE64_STRING" }`.  

Let me know if you need any modifications! 🚀🔥











<TableRow key={contract.numPolice}>
              <TableCell>{contract.numPolice}</TableCell>
              <TableCell>{contract.nom}</TableCell>
              <TableCell>{contract.prenom}</TableCell>
              <TableCell>{contract.dateNaissance}</TableCell>
              <TableCell>{contract.dateEffet}</TableCell>
              <TableCell>{contract.montantAssure}</TableCell>
              <TableCell>{contract.operateur}</TableCell>
              <TableCell>{contract.dateArchivage}</TableCell>

D'accord ! Voici comment **ajouter les icônes** et **gérer les actions** avec des popups de confirmation pour la mise à jour et la suppression, ainsi qu'un **popup détaillé** pour visualiser le contrat.  

---

## ✅ **Mise à jour du code avec les icônes et popups**
**Ajouts :**
1. **Icônes** pour **Visualiser, Modifier et Supprimer** chaque contrat  
2. **Popup de confirmation** pour **Mise à jour** et **Suppression**  
3. **Popup de visualisation** pour voir le contrat en détail  

---

### 🔥 **Code amélioré :**
```jsx
import React, { useState } from 'react';
import { Container, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ContractTable = ({ contracts }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openConfirm, setOpenConfirm] = useState({ type: '', open: false });

  // Ouvrir le popup de visualisation
  const handleView = (contract) => {
    setSelectedContract(contract);
    setOpenView(true);
  };

  // Ouvrir le popup de confirmation (mise à jour ou suppression)
  const handleConfirm = (contract, type) => {
    setSelectedContract(contract);
    setOpenConfirm({ type, open: true });
  };

  // Fermer les popups
  const handleClose = () => {
    setOpenView(false);
    setOpenConfirm({ type: '', open: false });
    setSelectedContract(null);
  };

  return (
    <Container>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Num Police</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Prénom</TableCell>
            <TableCell>Date Naissance</TableCell>
            <TableCell>Date Effet</TableCell>
            <TableCell>Montant Assuré</TableCell>
            <TableCell>Opérateur</TableCell>
            <TableCell>Date Archivage</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contracts.map((contract) => (
            <TableRow key={contract.numPolice}>
              <TableCell>{contract.numPolice}</TableCell>
              <TableCell>{contract.nom}</TableCell>
              <TableCell>{contract.prenom}</TableCell>
              <TableCell>{contract.dateNaissance}</TableCell>
              <TableCell>{contract.dateEffet}</TableCell>
              <TableCell>{contract.montantAssure}</TableCell>
              <TableCell>{contract.operateur}</TableCell>
              <TableCell>{contract.dateArchivage}</TableCell>
              <TableCell>
                <IconButton color="primary" onClick={() => handleView(contract)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton color="secondary" onClick={() => handleConfirm(contract, 'update')}>
                  <EditIcon />
                </IconButton>
                <IconButton color="error" onClick={() => handleConfirm(contract, 'delete')}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 🔹 Popup de visualisation */}
      <Dialog open={openView} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Contrat</DialogTitle>
        <DialogContent>
          {selectedContract && (
            <div>
              <p><strong>Numéro Police :</strong> {selectedContract.numPolice}</p>
              <p><strong>Nom :</strong> {selectedContract.nom}</p>
              <p><strong>Prénom :</strong> {selectedContract.prenom}</p>
              <p><strong>Date de Naissance :</strong> {selectedContract.dateNaissance}</p>
              <p><strong>Date Effet :</strong> {selectedContract.dateEffet}</p>
              <p><strong>Montant Assuré :</strong> {selectedContract.montantAssure}</p>
              <p><strong>Opérateur :</strong> {selectedContract.operateur}</p>
              <p><strong>Date Archivage :</strong> {selectedContract.dateArchivage}</p>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Popup de confirmation (Mise à jour & Suppression) */}
      <Dialog open={openConfirm.open} onClose={handleClose}>
        <DialogTitle>
          {openConfirm.type === 'update' ? 'Confirmer la mise à jour' : 'Confirmer la suppression'}
        </DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir {openConfirm.type === 'update' ? 'mettre à jour' : 'supprimer'} ce contrat ?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Annuler</Button>
          <Button onClick={() => {
            console.log(openConfirm.type === 'update' ? 'Mise à jour...' : 'Suppression...');
            handleClose();
          }} color={openConfirm.type === 'update' ? 'secondary' : 'error'}>
            {openConfirm.type === 'update' ? 'Mettre à jour' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContractTable;
```

---

### ✅ **Ce qui est ajouté :**  
✔ **Trois icônes** : **👁 Visualiser, ✏ Modifier, ❌ Supprimer**  
✔ **Popup de confirmation** avant mise à jour et suppression  
✔ **Popup détaillé** pour voir le contrat complet  
✔ **Aucune suppression du code existant**  

Maintenant, chaque ligne a **des actions bien définies**, et tu peux voir/modifier/supprimer les contrats **en toute sécurité**. 🚀
----------



// 🔥 Regroupe les contrats par Partenaire > Produit > Année > Mois
const getGroupedData = (data) => {
  const grouped = {};
  data.forEach((contract) => {
    const { partenaire, produit, annee, mois } = contract;
    if (!grouped[partenaire]) grouped[partenaire] = {};
    if (!grouped[partenaire][produit]) grouped[partenaire][produit] = {};
    if (!grouped[partenaire][produit][annee]) grouped[partenaire][produit][annee] = {};
    if (!grouped[partenaire][produit][annee][mois]) grouped[partenaire][produit][annee][mois] = [];
    grouped[partenaire][produit][annee][mois].push(contract);
  });
  return grouped;
};

// ✅ Fonction pour compter les contrats dans un objet groupé
const countContracts = (group) => {
  let count = 0;
  Object.values(group).forEach((subgroup) => {
    if (Array.isArray(subgroup)) {
      count += subgroup.length; // Si c'est une liste de contrats, on compte directement
    } else {
      count += countContracts(subgroup); // Sinon, on continue à parcourir
    }
  });
  return count;
};
