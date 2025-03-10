      import React, { useState, useEffect } from 'react';
      import { Container, Button, TextField, Typography, Grid, Paper, Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
      import { Worker, Viewer } from '@react-pdf-viewer/core';
      import '@react-pdf-viewer/core/lib/styles/index.css';
      import axios from 'axios';
      import { styled } from '@mui/system';
      
      const themeColor = '#007A33';
      
      const StyledButton = styled(Button)({
        backgroundColor: themeColor,
        color: 'white',
        '&:hover': {
          backgroundColor: '#005a25',
        },
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        borderRadius: '8px',
      });
      
      const partners = {
        BNP: ['Produit 1', 'Produit 2'],
        CNEP: ['Produit A', 'Produit B']
      };
      
      const PdfReader = () => {
        const [files, setFiles] = useState([]);
        const [selectedPdf, setSelectedPdf] = useState(null);
        const [partner, setPartner] = useState('');
        const [product, setProduct] = useState('');
        const [year, setYear] = useState('2024');
        const [month, setMonth] = useState('01');
        const [numContrat, setNumContrat] = useState('');
        const [metadata, setMetadata] = useState({});
        const [processedFiles, setProcessedFiles] = useState(new Set());
      
        const handleFileChange = (event) => {
          setFiles(Array.from(event.target.files));
          setProcessedFiles(new Set());
        };
      
        const handlePdfClick = (pdf) => {
          const fileURL = URL.createObjectURL(pdf);
          setSelectedPdf(fileURL);
          setNumContrat('');
          setMetadata({});
        };
      
        const fetchMetadata = async () => {
          if (numContrat) {
            try {
              const response = await axios.get(`/api/metadata?numContrat=${numContrat}`);
              setMetadata(response.data);
            } catch (error) {
              console.error('Error fetching metadata:', error);
            }
          }
        };
      
        const handlePartnerChange = (e) => {
          const selectedPartner = e.target.value;
          setPartner(selectedPartner);
          setProduct(partners[selectedPartner]?.[0] || '');
          setYear('2024');
          setMonth('01');
        };
      
        const handleSubmit = async () => {
          const data = files.map(file => ({
            partenaire: partner,
            produit: product,
            annee: year,
            mois: month,
            blob: file,
            numContrat,
            ...metadata
          }));
          try {
            await axios.post('/api/save', data);
            alert('Data submitted successfully');
          } catch (error) {
            console.error('Error submitting data:', error);
          }
        };
      
        return (
          <Container sx={{ backgroundColor: '#F5F5F5', padding: '20px', borderRadius: '8px' }}>
            <Grid container spacing={2} sx={{ height: '90vh' }}>
              <Grid item xs={4} container direction="column" spacing={2}>
                <Grid item>
                  <FormControl fullWidth>
                    <InputLabel>Partenaire</InputLabel>
                    <Select value={partner} onChange={handlePartnerChange} sx={{ borderRadius: '8px' }}>
                      {Object.keys(partners).map((p) => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl fullWidth disabled={!partner}>
                    <InputLabel>Produit</InputLabel>
                    <Select value={product} onChange={(e) => setProduct(e.target.value)} sx={{ borderRadius: '8px' }}>
                      {partners[partner]?.map((prod) => (
                        <MenuItem key={prod} value={prod}>{prod}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item>
                  <TextField label="Année" variant="outlined" fullWidth value={year} onChange={(e) => setYear(e.target.value)} sx={{ borderRadius: '8px' }} />
                </Grid>
                <Grid item>
                  <TextField label="Mois" variant="outlined" fullWidth value={month} onChange={(e) => setMonth(e.target.value)} sx={{ borderRadius: '8px' }} />
                </Grid>
                <Grid item>
                  <input type="file" multiple accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} id="upload-pdf" />
                  <label htmlFor="upload-pdf">
                    <StyledButton variant="contained" component="span">Upload PDF</StyledButton>
                  </label>
                </Grid>
                <Grid item>
                  <Typography variant="h6">Uploaded PDFs</Typography>
                  <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {files.map((file, index) => (
                      <StyledButton
                        key={index}
                        onClick={() => handlePdfClick(file)}
                        fullWidth
                        sx={{ marginBottom: '10px', backgroundColor: processedFiles.has(file.name) ? 'lightgreen' : 'lightcoral' }}
                      >
                        {file.name}
                      </StyledButton>
                    ))}
                  </Box>
                </Grid>
                {partner && product && (
                  <Grid item>
                    <TextField label="Numéro de contrat" variant="outlined" fullWidth value={numContrat} onChange={(e) => setNumContrat(e.target.value)} onBlur={fetchMetadata} />
                    {Object.entries(metadata).map(([key, value]) => (
                      <TextField key={key} label={key} value={value} variant="outlined" fullWidth margin="normal" disabled />
                    ))}
                  </Grid>
                )}
                <Grid item>
                  <StyledButton sx={{ marginTop: '10px' }} onClick={handleSubmit}>Valider</StyledButton>
                </Grid>
              </Grid>
              <Grid item xs={8}>
                <Paper sx={{ height: '100%', padding: '20px' }}>
                  {selectedPdf ? (
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                      <Box sx={{ height: '100%', overflowY: 'auto' }}>
                        <Viewer fileUrl={selectedPdf} />
                      </Box>
                    </Worker>
                  ) : (
                    <Typography variant="body1">No PDF selected</Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Container>
        );
      };
      
      export default PdfReader;


-----------------------------------------------------------------------------------------------------

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PdfController {

    private static final Logger logger = LoggerFactory.getLogger(PdfController.class);

    @PostMapping("/save")
    public String savePdfMetadata(@RequestBody List<Map<String, Object>> requestData) {
        List<Map<String, Object>> sanitizedData = requestData.stream()
            .map(entry -> entry.entrySet().stream()
                .filter(e -> !"blob".equals(e.getKey())) // Exclure le champ "blob"
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue))
            )
            .collect(Collectors.toList());

        logger.info("Received JSON: {}", sanitizedData);
        return "Data received successfully";
    }
}
