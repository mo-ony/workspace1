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
  TextField,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DownloadTableExcel } from "react-export-table-to-excel";

// ✅ Couleurs adaptées au style BNP Paribas
const BNP_GREEN = "#009e60";
const BNP_DARK = "#003c30";

const contratsData = [
  {
    partenaire: "Partenaire 1",
    produit: "Produit A",
    annee: "2024",
    mois: "Janvier",
    numPolice: "12345",
    nom: "Dupont",
    prenom: "Jean",
    dateNaissance: "1980-05-12",
    dateEffet: "2024-01-01",
    montantAssure: "10,000€",
    operateur: "AXA",
    dateArchivage: "2024-06-01",
  },
  {
    partenaire: "Partenaire 1",
    produit: "Produit A",
    annee: "2024",
    mois: "Février",
    numPolice: "67890",
    nom: "Martin",
    prenom: "Sophie",
    dateNaissance: "1990-07-15",
    dateEffet: "2024-02-01",
    montantAssure: "15,000€",
    operateur: "BNP",
    dateArchivage: "2024-07-01",
  },
  {
    partenaire: "Partenaire 2",
    produit: "Produit B",
    annee: "2023",
    mois: "Mars",
    numPolice: "54321",
    nom: "Durand",
    prenom: "Paul",
    dateNaissance: "1985-09-22",
    dateEffet: "2023-03-01",
    montantAssure: "20,000€",
    operateur: "Generali",
    dateArchivage: "2024-08-01",
  },
];

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
      <Typography variant="h4" gutterBottom sx={{ color: BNP_DARK }}>
        Liste des Contrats
      </Typography>
      <Box display="flex">
        {/* 🎯 Sidebar */}
        <Paper sx={{ width: 300, padding: 2, marginRight: 3, backgroundColor: "#f7f7f7" }}>
          <Typography variant="h6" sx={{ color: BNP_GREEN }}>
            Filtres
          </Typography>
          <List>
            {Object.keys(groupedData).map((partenaire) => (
              <div key={partenaire}>
                <ListItem button onClick={() => toggleExpand(partenaire)}>
                  <ListItemText primary={`${partenaire} (${contratsData.filter(c => c.partenaire === partenaire).length})`} />
                  {expanded[partenaire] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={expanded[partenaire]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {Object.keys(groupedData[partenaire]).map((produit) => (
                      <ListItem button key={produit} sx={{ pl: 4 }} onClick={() => selectFilter("produit", produit)}>
                        <ListItemText primary={`${produit} (${contratsData.filter(c => c.produit === produit).length})`} />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </Paper>

        {/* 📋 Tableau des contrats */}
        <Box flexGrow={1}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <IconButton onClick={exportPDF} color="primary">
              <PictureAsPdfIcon />
            </IconButton>
            <DownloadTableExcel filename="contrats_table" sheet="Contrats" currentTableRef={() => document.getElementById("contrats-table")}>
              <IconButton color="primary">
                <SaveAltIcon />
              </IconButton>
            </DownloadTableExcel>
          </Box>
          <Table id="contrats-table">
            <TableHead sx={{ backgroundColor: BNP_GREEN }}>
              <TableRow>
                {["Num Police", "Nom", "Prénom", "Date Naissance", "Date Effet", "Montant Assuré", "Opérateur", "Date Archivage"].map((header) => (
                  <TableCell key={header} sx={{ color: "white" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContracts.map((contract, index) => (
                <TableRow key={index}>
                  {Object.values(contract).slice(4).map((val, i) => (
                    <TableCell key={i}>{val}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
};

export default PdfTable;
