import React, { useState } from "react";
import { Container, Card, CardContent, TextField, Button, Typography, Box, List, ListItem } from "@mui/material";
import { styled } from "@mui/system";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

const StyledCard = styled(Card)({
  maxWidth: 400,
  margin: "auto",
  marginTop: "100px",
  padding: "20px",
});

const StyledButton = styled(Button)({
  marginTop: "20px",
});

const StyledListItem = styled(ListItem)({
  fontSize: "14px", // Police plus petite
});

const PasswordSetup = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordCriteria = [
    { label: "Au moins 8 caractères", regex: /.{8,}/ },
    { label: "Au moins une majuscule", regex: /[A-Z]/ },
    { label: "Au moins un chiffre", regex: /\d/ },
    { label: "Au moins un caractère spécial", regex: /[\W_]/ },
  ];

  const validatePassword = (password) => {
    return passwordCriteria.every((criterion) => criterion.regex.test(password));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    onSubmit(password); // Envoi du mot de passe validé
  };

  return (
    <Container>
      <StyledCard>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Définir un mot de passe
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Box mt={2}>
              <Typography variant="subtitle2">Le mot de passe doit contenir :</Typography>
              <List>
                {passwordCriteria.map((criterion, index) => {
                  const isValid = criterion.regex.test(password);
                  return (
                    <StyledListItem key={index} sx={{ color: isValid ? "green" : "red" }}>
                      {isValid ? <CheckCircleIcon fontSize="small" color="success" /> : <CancelIcon fontSize="small" color="error" />}
                      &nbsp; {criterion.label}
                    </StyledListItem>
                  );
                })}
              </List>
            </Box>
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!validatePassword(password)}
            >
              Valider
            </StyledButton>
          </form>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default PasswordSetup;









Voici une version modifiée de ta page pour la première connexion où l'utilisateur doit définir son mot de passe et le confirmer.  

- Elle inclut des critères de validation (au moins 8 caractères, 1 majuscule, 1 chiffre, 1 caractère spécial).  
- Lorsqu'un critère est rempli, il devient grisé.  
- Le bouton de validation est désactivé tant que les conditions ne sont pas remplies.  

### Code :

```jsx
import React, { useState } from "react";
import { Container, Card, CardContent, TextField, Button, Typography, Box, List, ListItem } from "@mui/material";
import { styled } from "@mui/system";

const StyledCard = styled(Card)({
  maxWidth: 400,
  margin: "auto",
  marginTop: "100px",
  padding: "20px",
});

const StyledButton = styled(Button)({
  marginTop: "20px",
});

const PasswordSetup = ({ onSubmit }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordCriteria = [
    { label: "Au moins 8 caractères", regex: /.{8,}/ },
    { label: "Au moins une majuscule", regex: /[A-Z]/ },
    { label: "Au moins un chiffre", regex: /\d/ },
    { label: "Au moins un caractère spécial", regex: /[\W_]/ },
  ];

  const validatePassword = (password) => {
    return passwordCriteria.every((criterion) => criterion.regex.test(password));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setError("");
    onSubmit(password); // Envoi du mot de passe validé
  };

  return (
    <Container>
      <StyledCard>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Définir un mot de passe
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Nouveau mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirmer le mot de passe"
              type="password"
              variant="outlined"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Box mt={2}>
              <Typography variant="subtitle1">Le mot de passe doit contenir :</Typography>
              <List>
                {passwordCriteria.map((criterion, index) => (
                  <ListItem
                    key={index}
                    sx={{ color: criterion.regex.test(password) ? "gray" : "black" }}
                  >
                    {criterion.label}
                  </ListItem>
                ))}
              </List>
            </Box>
            <StyledButton
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!validatePassword(password)}
            >
              Valider
            </StyledButton>
          </form>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default PasswordSetup;
```

### Fonctionnalités :  
✅ Validation des critères de mot de passe en temps réel  
✅ Désactivation du bouton tant que les critères ne sont pas remplis  
✅ Vérification de la correspondance entre les deux mots de passe  
✅ Affichage des critères validés en gris  

Dis-moi si tu veux personnaliser d'autres aspects !





Merci pour cette initiative. Comme je n'ai pas encore beaucoup d'expérience en équipe, voici mes commentaires sur quelques points :

L'environnement de travail est parfois trop bruyant, ce qui peut nuire aux problèmes développés et à la concentration.

Travailler sur plusieurs projets simultanément ne peut pas être aussi productif que prévu, car le passage d'un sujet à l'autre nécessite du temps pour se replonger dans le sujet.

Pour estimer les efforts, impliquer les développeurs dans l'évaluation des tâches permettrait de mieux cadrer ce qui pourrait être fait dans le projet dans le délai imparti.

J'ai hâte d'en discuter davantage avec vous.

Bonne journée,




const handleSubmit = async () => {
  try {
    const base64Files = await Promise.all(files.map(async (file) => {
      const base64DataURL = await blobToDataURL(file);
      if (!base64DataURL) return null;

      return {
        partenaire: partner,
        produit: product,
        annee: year,
        mois: month,
        filename: file.name,
        mimeType: file.type,
        blob: base64DataURL, // Base64 Data URL
        numContrat,
        ...metadata
      };
    }));

    const validFiles = base64Files.filter(file => file !== null);

    if (validFiles.length === 0) {
      console.error("No valid files to submit.");
      return;
    }

    await axios.post('/api/save', validFiles, {
      headers: { 'Content-Type': 'application/json' }
    });

    alert('Data submitted successfully');
  } catch (error) {
    console.error('Error submitting data:', error);
  }
};





La semaine dernière, on a implémenté le design de l'interface d'authentification et avancé sur l'interface d’indexation. Pour cette semaine, l’objectif est de travailler sur la deuxième interface, qui concerne l’habillage de la base de données, à l’exception de la fonctionnalité de recherche, qui sera implémentée la semaine prochaine.  

En parallèle, la semaine dernière, on avait proposé une approche pour les deux scénarios *(expliquer brièvement les deux scénarios)*. Si vous validez cette approche, on pourra commencer à l’implémenter dès cette semaine.  

Dites-moi si vous avez des remarques ou suggestions. Et sinon, jusqu’à présent, je développe en local sur mon PC, mais on va essayer d’ici dimanche prochain de déployer notre avancement sur le serveur pour que vous puissiez commencer à tester la solution.







Tu n’as pas besoin de créer un microservice pour chaque base de données. Spring Boot permet de configurer plusieurs sources de données dans le même projet. Voici les options possibles :  

### **1. Configurer deux sources de données dans le même service**  
Si les deux bases de données sont utilisées dans le même contexte métier, tu peux les configurer dans ton `application.properties` et définir plusieurs `DataSource`.  

#### **Configuration dans `application.properties`**
```properties
# Première base de données (par défaut)
spring.datasource.primary.url=jdbc:oracle:thin:@//host1:1521/service1
spring.datasource.primary.username=user1
spring.datasource.primary.password=pass1
spring.datasource.primary.driver-class-name=oracle.jdbc.OracleDriver

# Deuxième base de données
spring.datasource.secondary.url=jdbc:oracle:thin:@//host2:1521/service2
spring.datasource.secondary.username=user2
spring.datasource.secondary.password=pass2
spring.datasource.secondary.driver-class-name=oracle.jdbc.OracleDriver
```

#### **Créer les `DataSource` et `EntityManager`**  
Dans une classe de configuration :

```java
@Configuration
@EnableTransactionManagement
public class DataSourceConfig {

    @Primary
    @Bean(name = "primaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.primary")
    public DataSource primaryDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "secondaryDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.secondary")
    public DataSource secondaryDataSource() {
        return DataSourceBuilder.create().build();
    }
}
```

Puis, dans tes repositories, utilise `@Primary` pour la base principale et `@Qualifier("secondaryDataSource")` pour l’autre.

---

### **2. Séparer en microservices**
Si les bases de données concernent des fonctionnalités totalement indépendantes (exemple : une pour la facturation et une autre pour les utilisateurs), il est préférable de les gérer dans des microservices distincts.  

- Cela simplifie la maintenance et le déploiement.
- Chaque microservice peut avoir ses propres configurations et évolutions sans impacter l’autre.

---

### **Conclusion**
Si tes endpoints sont fortement liés et nécessitent souvent de croiser des données des deux bases, garde un seul service avec deux sources de données configurées.  
Si ce sont deux systèmes distincts, il vaut mieux opter pour deux microservices indépendants.  

Tu veux que je t’aide à implémenter un exemple précis ?






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
