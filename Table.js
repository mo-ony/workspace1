import React, { useState } from "react";
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
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DownloadTableExcel } from "react-export-table-to-excel";

const BNP_GREEN = "#009e60";
const BNP_DARK = "#003c30";

const contratsData = [
  { partenaire: "Partenaire 1", produit: "Produit A", annee: "2024", mois: "Janvier", numPolice: "12345", nom: "Dupont", prenom: "Jean", dateNaissance: "1980-05-12", dateEffet: "2024-01-01", montantAssure: "10,000€", operateur: "AXA", dateArchivage: "2024-06-01" },
  { partenaire: "Partenaire 1", produit: "Produit A", annee: "2024", mois: "Février", numPolice: "67890", nom: "Martin", prenom: "Sophie", dateNaissance: "1990-07-15", dateEffet: "2024-02-01", montantAssure: "15,000€", operateur: "BNP", dateArchivage: "2024-07-01" },
  { partenaire: "Partenaire 2", produit: "Produit B", annee: "2023", mois: "Mars", numPolice: "54321", nom: "Durand", prenom: "Paul", dateNaissance: "1985-09-22", dateEffet: "2023-03-01", montantAssure: "20,000€", operateur: "Generali", dateArchivage: "2024-08-01" },
];



const getGroupedData = (data) => {
  const grouped = {};
  data.forEach((contract) => {
    const { partenaire, produit, annee, mois } = contract;

    if (!grouped[partenaire]) grouped[partenaire] = { count: 0, contracts: [], produits: {} };
    grouped[partenaire].count++;
    grouped[partenaire].contracts.push(contract);

    if (!grouped[partenaire].produits[produit]) grouped[partenaire].produits[produit] = { count: 0, contracts: [], annees: {} };
    grouped[partenaire].produits[produit].count++;
    grouped[partenaire].produits[produit].contracts.push(contract);

    if (!grouped[partenaire].produits[produit].annees[annee]) grouped[partenaire].produits[produit].annees[annee] = { count: 0, contracts: [], mois: {} };
    grouped[partenaire].produits[produit].annees[annee].count++;
    grouped[partenaire].produits[produit].annees[annee].contracts.push(contract);

    if (!grouped[partenaire].produits[produit].annees[annee].mois[mois]) grouped[partenaire].produits[produit].annees[annee].mois[mois] = { count: 0, contracts: [] };
    grouped[partenaire].produits[produit].annees[annee].mois[mois].count++;
    grouped[partenaire].produits[produit].annees[annee].mois[mois].contracts.push(contract);
  });

  return grouped;
};



const PdfTable = () => {
  const [expanded, setExpanded] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const groupedData = getGroupedData(contratsData);

  const toggleExpand = (key) => {
    setExpanded({ ...expanded, [key]: !expanded[key] });
  };

  const selectFilter = (level, value) => {
    setSelectedFilters({ ...selectedFilters, [level]: value });
  };

  const resetFilters = () => {
    setSelectedFilters({});
  };

  const filteredContracts = contratsData.filter((contract) => {
    return (
      (!selectedFilters.partenaire || contract.partenaire === selectedFilters.partenaire) &&
      (!selectedFilters.produit || contract.produit === selectedFilters.produit) &&
      (!selectedFilters.annee || contract.annee === selectedFilters.annee) &&
      (!selectedFilters.mois || contract.mois === selectedFilters.mois)
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Liste des Contrats", 20, 10);
    doc.autoTable({
      head: [["Num Police", "Nom", "Prénom", "Date Naissance", "Date Effet", "Montant Assuré", "Opérateur", "Date Archivage"]],
      body: filteredContracts.map((c) => [
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
