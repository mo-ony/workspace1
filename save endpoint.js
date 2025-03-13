Voici un contrôleur Spring Boot qui :  
- Reçoit le **JSON** envoyé sur l’endpoint `/save`  
- Stocke les données en appelant une **procédure stockée Oracle** pour insérer les valeurs dans `Archivage`  
- **Ne loggue pas le BLOB**  

Les dépendances nécessaires sont :
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc8</artifactId>
    <scope>runtime</scope>
</dependency>
```

### **Controller Spring Boot**
```java
@RestController
@RequestMapping("/archivage")
@CrossOrigin(origins = "http://localhost:3000")
public class ArchivageController {

    @Autowired
    private ArchivageService archivageService;

    private static final Logger logger = LoggerFactory.getLogger(ArchivageController.class);

    @PostMapping("/save")
    public ResponseEntity<String> saveArchivage(@RequestBody List<ArchivageRequest> requests) {
        logger.info("Received archivage request: {} elements", requests.size());

        try {
            archivageService.saveArchivages(requests);
            return ResponseEntity.ok("Archivage successful");
        } catch (Exception e) {
            logger.error("Error while saving archivage", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during archivage");
        }
    }
}
```

---

### **Service**
```java
@Service
public class ArchivageService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static final Logger logger = LoggerFactory.getLogger(ArchivageService.class);

    public void saveArchivages(List<ArchivageRequest> requests) {
        for (ArchivageRequest request : requests) {
            logger.info("Processing contract: NumPolice={}, Nom={}, Prenom={}",
                    request.getNumPolice(), request.getNom(), request.getPrenom());

            jdbcTemplate.update("CALL INSERT_ARCHIVAGE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    request.getArchivePar(),
                    request.getProduitId(),
                    request.getAnnee(),
                    request.getMois(),
                    request.getNumPolice(),
                    request.getNom(),
                    request.getPrenom(),
                    new SqlLobValue(request.getContrat(), new DefaultLobHandler()), // BLOB
                    request.getMontantAssure(),
                    request.getMontantPrime(),
                    request.getUsername()
            );
        }
    }
}
```

---

### **DTO (Objet pour Mapper le JSON)**
```java
public class ArchivageRequest {
    private Long archivePar;
    private Long produitId;
    private Integer annee;
    private Integer mois;
    private String numPolice;
    private String nom;
    private String prenom;
    private byte[] contrat; // BLOB en base
    private Double montantAssure;
    private Double montantPrime;
    private String username; // Pour l'audit

    // Getters et Setters
}
```

---

### **Procédure Stockée Oracle**
```sql
CREATE OR REPLACE PROCEDURE INSERT_ARCHIVAGE (
    p_archive_par NUMBER,
    p_produit_id NUMBER,
    p_annee NUMBER,
    p_mois NUMBER,
    p_num_police VARCHAR2,
    p_nom VARCHAR2,
    p_prenom VARCHAR2,
    p_contrat BLOB,
    p_montant_assure NUMBER,
    p_montant_prime NUMBER,
    p_username VARCHAR2
) AS
BEGIN
    INSERT INTO Archivage (archive_par, produit_id, annee, mois, num_police, nom, prenom, contrat, montant_assure, montant_prime)
    VALUES (p_archive_par, p_produit_id, p_annee, p_mois, p_num_police, p_nom, p_prenom, p_contrat, p_montant_assure, p_montant_prime);

    COMMIT;
END;
/
```

---

### **Résumé**
✅ Endpoint **POST /archivage/save** pour enregistrer les fichiers PDF  
✅ Logs des **paramètres**, sauf le BLOB  
✅ **Service Spring Boot** qui appelle la procédure stockée  
✅ **Oracle Procedure** pour insérer dans `Archivage`  

Tu peux tester en envoyant un **JSON** comme :
```json
[
  {
    "archivePar": 1,
    "produitId": 2,
    "annee": 2024,
    "mois": 7,
    "numPolice": "123456",
    "nom": "Doe",
    "prenom": "John",
    "contrat": "BASE64_ENCODED_BLOB",
    "montantAssure": 50000,
    "montantPrime": 250
  }
]
```

Dis-moi si tu veux des ajustements ! 🚀
