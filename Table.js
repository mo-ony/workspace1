import React, { useState } from 'react';
import {
  Container, Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  Typography, TextField, Box, Grid, Collapse, List, ListItem, ListItemText, ListItemButton
} from '@mui/material';
import { ExpandLess, ExpandMore, PictureAsPdf, GetApp, SaveAlt } from '@mui/icons-material';
import { DownloadTableExcel } from 'react-export-table-to-excel';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Styles aux couleurs de BNP Paribas
const styles = {
  sidebar: { backgroundColor: '#006341', color: 'white', padding: '10px', height: '100%' },
  tableHeader: { backgroundColor: '#333', color: 'white' },
  tableRow: { backgroundColor: '#f5f5f5' },
};

const contractsData = [
  {
    partner: 'Partenaire A',
    products: [
      {
        name: 'Produit 1',
        years: {
          2023: { months: { Janvier: 5, Février: 8 } },
          2024: { months: { Mars: 12, Avril: 9 } }
        }
      },
      {
        name: 'Produit 2',
        years: {
          2023: { months: { Mai: 7, Juin: 4 } }
        }
      }
    ]
  },
  {
    partner: 'Partenaire B',
    products: [
      {
        name: 'Produit 3',
        years: {
          2024: { months: { Juillet: 15, Août: 20 } }
        }
      }
    ]
  }
];

const ContractList = () => {
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [expandedPartners, setExpandedPartners] = useState({});
  const [expandedProducts, setExpandedProducts] = useState({});
  const [expandedYears, setExpandedYears] = useState({});

  const toggleExpand = (key, setter) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelection = (contracts) => {
    setSelectedContracts(contracts);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Liste des Contrats', 20, 10);
    doc.autoTable({
      head: [['Partenaire', 'Produit', 'Année', 'Mois', 'Nombre de Contrats']],
      body: selectedContracts.map(c => [c.partner, c.product, c.year, c.month, c.count])
    });
    doc.save('contrats.pdf');
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom align="center" style={{ color: '#006341' }}>
        Gestion des Contrats
      </Typography>

      <Grid container spacing={2}>
        {/* MENU LATERAL */}
        <Grid item xs={3} style={styles.sidebar}>
          <Typography variant="h6">Filtres</Typography>
          <List>
            {contractsData.map((partner, pIndex) => (
              <div key={pIndex}>
                <ListItemButton onClick={() => toggleExpand(partner.partner, setExpandedPartners)}>
                  <ListItemText primary={`${partner.partner} (${partner.products.reduce((acc, p) => acc + Object.values(p.years).reduce((a, y) => a + Object.values(y.months).reduce((sum, m) => sum + m, 0), 0), 0)})`} />
                  {expandedPartners[partner.partner] ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>
                <Collapse in={expandedPartners[partner.partner]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {partner.products.map((product, prodIndex) => (
                      <div key={prodIndex}>
                        <ListItemButton onClick={() => toggleExpand(product.name, setExpandedProducts)} sx={{ pl: 2 }}>
                          <ListItemText primary={`${product.name} (${Object.values(product.years).reduce((a, y) => a + Object.values(y.months).reduce((sum, m) => sum + m, 0), 0)})`} />
                          {expandedProducts[product.name] ? <ExpandLess /> : <ExpandMore />}
                        </ListItemButton>
                        <Collapse in={expandedProducts[product.name]} timeout="auto" unmountOnExit>
                          <List component="div" disablePadding>
                            {Object.entries(product.years).map(([year, yearData]) => (
                              <div key={year}>
                                <ListItemButton onClick={() => toggleExpand(year, setExpandedYears)} sx={{ pl: 4 }}>
                                  <ListItemText primary={`${year} (${Object.values(yearData.months).reduce((sum, m) => sum + m, 0)})`} />
                                  {expandedYears[year] ? <ExpandLess /> : <ExpandMore />}
                                </ListItemButton>
                                <Collapse in={expandedYears[year]} timeout="auto" unmountOnExit>
                                  <List component="div" disablePadding>
                                    {Object.entries(yearData.months).map(([month, count]) => (
                                      <ListItemButton key={month} sx={{ pl: 6 }}
                                        onClick={() => handleSelection([{ partner: partner.partner, product: product.name, year, month, count }])}>
                                        <ListItemText primary={`${month} (${count})`} />
                                      </ListItemButton>
                                    ))}
                                  </List>
                                </Collapse>
                              </div>
                            ))}
                          </List>
                        </Collapse>
                      </div>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </Grid>

        {/* TABLEAU DE DROITE */}
        <Grid item xs={9}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField label="Rechercher un contrat" variant="outlined" size="small" />
            <Box>
              <IconButton onClick={exportPDF} style={{ color: '#006341' }}>
                <PictureAsPdf />
              </IconButton>
              <DownloadTableExcel filename="contrats" sheet="contrats" currentTableRef={() => document.getElementById('contracts-table')}>
                <IconButton style={{ color: '#006341' }}>
                  <SaveAlt />
                </IconButton>
              </DownloadTableExcel>
            </Box>
          </Box>

          <Table id="contracts-table">
            <TableHead>
              <TableRow style={styles.tableHeader}>
                <TableCell style={{ color: 'white' }}>Partenaire</TableCell>
                <TableCell style={{ color: 'white' }}>Produit</TableCell>
                <TableCell style={{ color: 'white' }}>Année</TableCell>
                <TableCell style={{ color: 'white' }}>Mois</TableCell>
                <TableCell style={{ color: 'white' }}>Nombre de Contrats</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedContracts.map((c, index) => (
                <TableRow key={index} style={styles.tableRow}>
                  <TableCell>{c.partner}</TableCell>
                  <TableCell>{c.product}</TableCell>
                  <TableCell>{c.year}</TableCell>
                  <TableCell>{c.month}</TableCell>
                  <TableCell>{c.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ContractList;
