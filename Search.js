Voici comment ajouter **quatre champs de recherche** (par numéro de police, nom, prénom et date de naissance) au-dessus du tableau. Ces champs filtreront les résultats en temps réel.

---

### ✅ **Mise à jour du code avec les champs de recherche**
- **Ajout d'un état pour stocker les valeurs des champs de recherche**
- **Filtrage dynamique des contrats en fonction des valeurs saisies**

---

### 🔥 **Code amélioré**
```jsx
import React, { useState } from 'react';
import { Container, TextField, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ContractTable = ({ contracts }) => {
  const [selectedContract, setSelectedContract] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [openConfirm, setOpenConfirm] = useState({ type: '', open: false });

  // États pour les champs de recherche
  const [searchNumPolice, setSearchNumPolice] = useState('');
  const [searchNom, setSearchNom] = useState('');
  const [searchPrenom, setSearchPrenom] = useState('');
  const [searchDateNaissance, setSearchDateNaissance] = useState('');

  // Filtrage des contrats en fonction des champs de recherche
  const filteredContracts = contracts.filter(contract =>
    contract.numPolice.toLowerCase().includes(searchNumPolice.toLowerCase()) &&
    contract.nom.toLowerCase().includes(searchNom.toLowerCase()) &&
    contract.prenom.toLowerCase().includes(searchPrenom.toLowerCase()) &&
    contract.dateNaissance.includes(searchDateNaissance)
  );

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
      {/* 🔎 Zone de recherche */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={3}>
          <TextField 
            label="Numéro Police" 
            fullWidth 
            variant="outlined" 
            value={searchNumPolice} 
            onChange={(e) => setSearchNumPolice(e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField 
            label="Nom" 
            fullWidth 
            variant="outlined" 
            value={searchNom} 
            onChange={(e) => setSearchNom(e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField 
            label="Prénom" 
            fullWidth 
            variant="outlined" 
            value={searchPrenom} 
            onChange={(e) => setSearchPrenom(e.target.value)}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField 
            label="Date de Naissance" 
            type="date" 
            fullWidth 
            InputLabelProps={{ shrink: true }}
            variant="outlined" 
            value={searchDateNaissance} 
            onChange={(e) => setSearchDateNaissance(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* 🔹 Tableau des contrats */}
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
          {filteredContracts.map((contract) => (
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

### ✅ **Résumé des améliorations**
1. **Ajout de 4 champs de recherche** (Num Police, Nom, Prénom, Date de Naissance)
2. **Filtrage dynamique des contrats** en fonction des valeurs saisies
3. **Amélioration de l'UI** en organisant les champs dans une grille `Grid`

---

### ✨ **Résultat**
- Les utilisateurs peuvent facilement rechercher un contrat en tapant dans les champs de recherche.
- Les résultats s'actualisent immédiatement sans recharger la page.

Besoin d'autres améliorations ? 🚀
