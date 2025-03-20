import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Button,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BNP_DARK = "#003c30";

const getGroupedData = (data) => {
  const grouped = {};
  data.forEach((contract) => {
    const { partenaire, produit, annee, mois } = contract;
    if (!grouped[partenaire]) grouped[partenaire] = { count: 0 };
    grouped[partenaire].count++;

    if (!grouped[partenaire][produit]) grouped[partenaire][produit] = { count: 0 };
    grouped[partenaire][produit].count++;

    if (!grouped[partenaire][produit][annee]) grouped[partenaire][produit][annee] = { count: 0 };
    grouped[partenaire][produit][annee].count++;

    if (!grouped[partenaire][produit][annee][mois]) grouped[partenaire][produit][annee][mois] = { count: 0 };
    grouped[partenaire][produit][annee][mois].count++;
  });
  return grouped;
};

const PdfTable = () => {
  const [contratsData, setContratsData] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});

  // Récupération des contrats depuis l'API
  useEffect(() => {
    axios.get("/api/contrats")
      .then(response => {
        setContratsData(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des contrats :", error);
      });
  }, []);

  // Groupement dynamique
  const groupedData = getGroupedData(contratsData);

  // Filtrage dynamique
  const filteredContracts = contratsData.filter(contract => (
    (!selectedFilters.partenaire || contract.partenaire === selectedFilters.partenaire) &&
    (!selectedFilters.produit || contract.produit === selectedFilters.produit) &&
    (!selectedFilters.annee || contract.annee === selectedFilters.annee) &&
    (!selectedFilters.mois || contract.mois === selectedFilters.mois)
  ));

  const toggleExpand = (key) => {
    setExpanded({ ...expanded, [key]: !expanded[key] });
  };

  const selectFilter = (level, value) => {
    setSelectedFilters({ ...selectedFilters, [level]: value });
  };

  const resetFilters = () => {
    setSelectedFilters({});
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Contrats", 20, 10);
    doc.autoTable({
      head: [["Num Police", "Nom", "Prénom", "Date Naissance", "Date Effet", "Montant Assuré", "Opérateur", "Date Archivage"]],
      body: filteredContracts.map(c => [
        c.numPolice,
        c.nom,
        c.prenom,
        c.dateNaissance,
        c.dateEffet,
        c.montantAssure,
        c.operateur,
        c.dateArchivage,
      ]),
    });
    doc.save("contrats.pdf");
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom sx={{ color: BNP_DARK }}>
        Liste des Contrats
      </Typography>
      <Box display="flex">
        <Paper sx={{ width: 300, padding: 2, marginRight: 3, backgroundColor: "#f7f7f7" }}>
          <Button variant="outlined" color="secondary" fullWidth onClick={resetFilters} sx={{ mb: 2 }}>
            Réinitialiser les filtres
          </Button>
          <List>
            {Object.keys(groupedData).map((partenaire) => (
              <div key={partenaire}>
                <ListItem button onClick={() => toggleExpand(partenaire)}>
                  <ListItemText primary={`${partenaire} (${groupedData[partenaire].count})`} />
                  {expanded[partenaire] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={expanded[partenaire]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {Object.keys(groupedData[partenaire]).filter(k => k !== "count").map((produit) => (
                      <div key={produit}>
                        <ListItem button sx={{ pl: 4 }} onClick={() => toggleExpand(produit)}>
                          <ListItemText primary={`${produit} (${groupedData[partenaire][produit].count})`} />
                          {expanded[produit] ? <ExpandLess /> : <ExpandMore />}
                        </ListItem>
                        <Collapse in={expanded[produit]} timeout="auto" unmountOnExit>
                          {Object.keys(groupedData[partenaire][produit]).filter(k => k !== "count").map((annee) => (
                            <div key={annee}>
                              <ListItem button sx={{ pl: 6 }} onClick={() => toggleExpand(annee)}>
                                <ListItemText primary={`${annee} (${groupedData[partenaire][produit][annee].count})`} />
                                {expanded[annee] ? <ExpandLess /> : <ExpandMore />}
                              </ListItem>
                              <Collapse in={expanded[annee]} timeout="auto" unmountOnExit>
                                {Object.keys(groupedData[partenaire][produit][annee]).filter(k => k !== "count").map((mois) => (
                                  <ListItem button key={mois} sx={{ pl: 8 }} onClick={() => selectFilter("mois", mois)}>
                                    <ListItemText primary={`${mois} (${groupedData[partenaire][produit][annee][mois].count})`} />
                                  </ListItem>
                                ))}
                              </Collapse>
                            </div>
                          ))}
                        </Collapse>
                      </div>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </Paper>
        <Box flexGrow={1}>
          <IconButton onClick={exportPDF} color="primary">
            <PictureAsPdfIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default PdfTable;

66666666666666666666666666666666666666



Pour récupérer les contrats depuis l'API avec `axios` et inclure la colonne `pdfContract`, voici les étapes à suivre :

### 1. **Remplacer les données statiques par un `useEffect` pour récupérer les données**
Actuellement, `contratsData` est une constante. Il faut la remplacer par un `useState` et récupérer les données via `axios`.

### 2. **Ajouter une gestion des erreurs et de chargement**
Pendant que les données sont récupérées, afficher un message de chargement.

### 3. **Afficher le PDF en base64**
- Ajouter un bouton "Voir PDF".
- Convertir la base64 en un blob et l'afficher dans une nouvelle fenêtre/tab.

---

### **Code mis à jour :**
```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

const PdfTable = () => {
  const [contratsData, setContratsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("URL_DE_TON_ENDPOINT")
      .then((response) => {
        setContratsData(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des contrats :", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const viewPDF = (base64) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  if (loading) return <CircularProgress />;

  return (
    <Container>
      <Typography variant="h5" gutterBottom>
        Liste des Contrats
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Num Police</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Prénom</TableCell>
            <TableCell>PDF</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contratsData.map((contract, index) => (
            <TableRow key={index}>
              <TableCell>{contract.numPolice}</TableCell>
              <TableCell>{contract.nom}</TableCell>
              <TableCell>{contract.prenom}</TableCell>
              <TableCell>
                {contract.pdfContract && (
                  <IconButton onClick={() => viewPDF(contract.pdfContract)} color="primary">
                    <PictureAsPdfIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default PdfTable;
```

### **Explication des ajouts :**
1. **Récupération des données via `axios` dans un `useEffect`.**
2. **Utilisation d'un état `loading` pour afficher un `CircularProgress` lors du chargement.**
3. **Ajout d'un bouton PDF qui affiche le fichier base64 en PDF dans un nouvel onglet.**
4. **Gestion des erreurs en cas d'échec de la requête.**

---

Avec ce code, ton tableau affiche bien les contrats récupérés de l'API, et le bouton PDF permet d'ouvrir le fichier encodé en base64.
