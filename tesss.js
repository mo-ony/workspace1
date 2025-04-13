<MetadataUpdater contrat={contrat} />


import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import axios from "axios";

const MetadataUpdater = ({ contrat }) => {
  const [open, setOpen] = useState(false);
  const [metadataList, setMetadataList] = useState([]);
  const [selectedMetadata, setSelectedMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpenDialog = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/metadata?idContrat=${contrat.id}`);
      setMetadataList(res.data);
      setOpen(true);
    } catch (err) {
      console.error("Erreur récupération métadonnées", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (metadata) => {
    try {
      await axios.post(`/api/contrats/${contrat.id}/metadata/update`, metadata);
      setOpen(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    }
  };

  const renderMetadataCards = () => (
    <Grid container spacing={2}>
      {metadataList.map((md, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card variant="outlined" sx={{ cursor: "pointer", borderColor: selectedMetadata === md ? "primary.main" : "grey.300" }} onClick={() => setSelectedMetadata(md)}>
            <CardContent>
              {Object.entries(md).map(([key, value]) => (
                <Typography key={key} variant="body2">
                  <strong>{key}:</strong> {String(value)}
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Button variant="outlined" onClick={handleOpenDialog} disabled={loading}>
        Mettre à jour les métadonnées
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Mise à jour des métadonnées</DialogTitle>
        <DialogContent dividers>
          {metadataList.length === 0 && (
            <Typography>Aucune métadonnée disponible pour ce contrat.</Typography>
          )}

          {metadataList.length === 1 && (
            <Card variant="outlined">
              <CardContent>
                {Object.entries(metadataList[0]).map(([key, value]) => (
                  <Typography key={key} variant="body2">
                    <strong>{key}:</strong> {String(value)}
                  </Typography>
                ))}
              </CardContent>
            </Card>
          )}

          {metadataList.length > 1 && renderMetadataCards()}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          {(metadataList.length === 1 || selectedMetadata) && (
            <Button variant="contained" onClick={() => handleValidate(selectedMetadata || metadataList[0])}>
              Valider
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MetadataUpdater;


