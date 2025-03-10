          import React, { useState } from 'react';
          import { Container, Button, TextField, Typography, Grid, Paper, Box, MenuItem, Select, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
          import { Worker, Viewer } from '@react-pdf-viewer/core';
          import '@react-pdf-viewer/core/lib/styles/index.css';
          import '@react-pdf-viewer/default-layout/lib/styles/index.css';
          import { styled } from '@mui/system';
          import axios from 'axios';
          
          const StyledButton = styled(Button)({
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%',
          });
          
          const PdfReader = () => {
            const [files, setFiles] = useState([]);
            const [selectedPdf, setSelectedPdf] = useState(null);
            const [contractNumber, setContractNumber] = useState('');
            const [metadata, setMetadata] = useState({});
            const [partner, setPartner] = useState('');
            const [product, setProduct] = useState('');
            const [year, setYear] = useState('');
            const [month, setMonth] = useState('');
            const [showErrorDialog, setShowErrorDialog] = useState(false);
            const [errorMessage, setErrorMessage] = useState('');
            const [manualMetadata, setManualMetadata] = useState(false);
            const [name, setName] = useState('');
            const [surname, setSurname] = useState('');
          
            const partners = {
              'BNP': ['Product A', 'Product B'],
              'CNEP': ['Product C', 'Product D']
            };
          
            const years = ['2024', '2023', '2022'];
            const months = ['January', 'February', 'March'];
          
            const handleFileChange = (event) => {
              setFiles(Array.from(event.target.files));
            };
          
            const handlePdfClick = (pdf) => {
              const fileURL = URL.createObjectURL(pdf);
              setSelectedPdf(fileURL);
              setContractNumber('');
              setMetadata({});
              setManualMetadata(false);
            };
          
            const fetchMetadata = async () => {
              try {
                const response = await axios.get(`/api/metadata?contractNumber=${contractNumber}${name ? `&name=${name}` : ''}${surname ? `&surname=${surname}` : ''}`);
                setMetadata(response.data);
              } catch (error) {
                if (error.response?.data?.message === 'Contract not found') {
                  setErrorMessage('Le contrat n\'existe pas. Voulez-vous l\'archiver ?');
                  setShowErrorDialog(true);
                } else if (error.response?.data?.message === 'too many values') {
                  setErrorMessage('Plusieurs contrats trouvés. Merci de saisir le nom et prénom.');
                  setName('');
                  setSurname('');
                }
              }
            };
          
            const handleConfirmArchive = () => {
              setShowErrorDialog(false);
              setManualMetadata(true);
            };
          
            const handleSubmit = async () => {
              const jsonData = files.map(file => ({
                partenaire: partner,
                produit: product,
                annee: year,
                mois: month,
                blob: 'BLOB_DATA',
                numContrat: contractNumber,
                nom: metadata.nom || name,
                prenom: metadata.prenom || surname,
                dateNaiss: metadata.dateNaiss,
                dateEffet: metadata.dateEffet,
                montantAssure: metadata.montantAssure,
                MntPrime: metadata.MntPrime
              }));
          
              await axios.post('/api/save', jsonData);
            };
          
            return (
              <Container>
                <Typography variant="h4" gutterBottom>
                  PDF Reader
                </Typography>
                <Box mb={2}>
                  <Select value={partner} onChange={(e) => setPartner(e.target.value)} fullWidth>
                    {Object.keys(partners).map((p) => (
                      <MenuItem key={p} value={p}>{p}</MenuItem>
                    ))}
                  </Select>
                  <Select value={product} onChange={(e) => setProduct(e.target.value)} fullWidth>
                    {partners[partner]?.map((pr) => (
                      <MenuItem key={pr} value={pr}>{pr}</MenuItem>
                    ))}
                  </Select>
                  <Select value={year} onChange={(e) => setYear(e.target.value)} fullWidth>
                    {years.map((yr) => (
                      <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                    ))}
                  </Select>
                  <Select value={month} onChange={(e) => setMonth(e.target.value)} fullWidth>
                    {months.map((m) => (
                      <MenuItem key={m} value={m}>{m}</MenuItem>
                    ))}
                  </Select>
                  <input type="file" multiple accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} id="upload-pdf" />
                  <label htmlFor="upload-pdf">
                    <Button variant="contained" color="primary" component="span">Upload PDF</Button>
                  </label>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper style={{ padding: '20px' }}>
                      {files.map((file, index) => (
                        <StyledButton key={index} onClick={() => handlePdfClick(file)} fullWidth>{file.name}</StyledButton>
                      ))}
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Paper style={{ padding: '20px' }}>
                      {selectedPdf ? (
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                          <Box sx={{ height: '400px', overflowY: 'auto' }}>
                            <Viewer fileUrl={selectedPdf} />
                          </Box>
                        </Worker>
                      ) : (
                        <Typography>Aucun PDF sélectionné</Typography>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
                <Box mt={2}>
                  <TextField label="Numéro de contrat" value={contractNumber} onChange={(e) => setContractNumber(e.target.value)} fullWidth />
                  {errorMessage && <Typography color="error">{errorMessage}</Typography>}
                  {manualMetadata && (
                    <>
                      <TextField label="Nom" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                      <TextField label="Prénom" value={surname} onChange={(e) => setSurname(e.target.value)} fullWidth />
                    </>
                  )}
                  <Button variant="contained" color="primary" onClick={fetchMetadata}>Récupérer Métadonnées</Button>
                  <Button variant="contained" color="secondary" onClick={handleSubmit}>Envoyer</Button>
                </Box>
                <Dialog open={showErrorDialog}>
                  <DialogTitle>Contrat non trouvé</DialogTitle>
                  <DialogContent>Voulez-vous l'archiver manuellement ?</DialogContent>
                  <DialogActions>
                    <Button onClick={handleConfirmArchive} color="primary">Oui</Button>
                  </DialogActions>
                </Dialog>
              </Container>
            );
          };
          
          export default PdfReader;
