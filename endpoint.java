Voici l'implémentation complète d'un **Controller**, **Service**, et **Repository** pour sauvegarder une liste de contrats en base de données **sans utiliser de package Oracle**.

---

## 📌 **1. `ArchivageController.java`**
Le contrôleur expose une **API REST** pour recevoir une liste de contrats et les enregistrer en base.

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/archivage")
public class ArchivageController {

    private final ArchivageService archivageService;

    public ArchivageController(ArchivageService archivageService) {
        this.archivageService = archivageService;
    }

    @PostMapping("/save")
    public ResponseEntity<?> saveContracts(@RequestBody List<ArchiveDTO> contracts) {
        try {
            archivageService.saveContracts(contracts);
            return ResponseEntity.ok("Archivage réussi");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
```

---

## 📌 **2. `ArchivageService.java`**
Le service traite la liste des contrats et effectue les validations.

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Base64;

@Service
public class ArchivageService {

    private final ArchivageRepository archivageRepository;

    public ArchivageService(ArchivageRepository archivageRepository) {
        this.archivageRepository = archivageRepository;
    }

    @Transactional
    public void saveContracts(List<ArchiveDTO> contracts) {
        for (ArchiveDTO contract : contracts) {
            // Vérifier unicité : même numPolice, nom, prenom
            Optional<ArchivageEntity> existingContract = archivageRepository
                    .findByNumPoliceAndNomAndPrenom(contract.getNumPolice(), contract.getNom(), contract.getPrenom());

            if (existingContract.isPresent()) {
                throw new RuntimeException("Le contrat avec le numéro " + contract.getNumPolice() + " existe déjà !");
            }

            // Vérifier l'extension du fichier (Base64 → PDF)
            if (!isPdf(contract.getContratBase64())) {
                throw new RuntimeException("Seuls les fichiers PDF sont autorisés !");
            }

            // Convertir Base64 en BLOB
            byte[] contratBlob = Base64.getDecoder().decode(contract.getContratBase64());

            // Mapper DTO → Entity
            ArchivageEntity entity = new ArchivageEntity();
            entity.setNumPolice(contract.getNumPolice());
            entity.setNom(contract.getNom());
            entity.setPrenom(contract.getPrenom());
            entity.setNjf(contract.getNjf());
            entity.setAnnee(Integer.parseInt(contract.getAnnee()));
            entity.setMois(Integer.parseInt(contract.getMois()));
            entity.setProduitId(Long.parseLong(contract.getProduitId()));
            entity.setArchivePar(Long.parseLong(contract.getArchivePar()));
            entity.setMontantAssure(new java.math.BigDecimal(contract.getMontantAssure()));
            entity.setMontantPrime(contract.getMontantPrime());
            entity.setContrat(contratBlob);

            // Enregistrer en BDD
            archivageRepository.save(entity);
        }
    }

    private boolean isPdf(String base64File) {
        byte[] decoded = Base64.getDecoder().decode(base64File);
        return decoded.length > 4 &&
               decoded[0] == 0x25 && decoded[1] == 0x50 &&
               decoded[2] == 0x44 && decoded[3] == 0x46; // "%PDF" signature
    }
}
```

---

## 📌 **3. `ArchivageRepository.java`**
Le repository pour interagir avec la base de données.

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArchivageRepository extends JpaRepository<ArchivageEntity, Long> {
    
    Optional<ArchivageEntity> findByNumPoliceAndNomAndPrenom(String numPolice, String nom, String prenom);
}
```

---

## 📌 **4. `ArchivageEntity.java`**
L'entité JPA associée à la table **Archivage**.

```java
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "ARCHIVAGE")
public class ArchivageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "NUM_POLICE", nullable = false, unique = true)
    private String numPolice;

    @Column(name = "NOM", nullable = false)
    private String nom;

    @Column(name = "PRENOM", nullable = false)
    private String prenom;

    @Column(name = "NJF")
    private String njf;

    @Column(name = "ANNEE", nullable = false)
    private Integer annee;

    @Column(name = "MOIS", nullable = false)
    private Integer mois;

    @Column(name = "PRODUIT_ID", nullable = false)
    private Long produitId;

    @Column(name = "ARCHIVE_PAR", nullable = false)
    private Long archivePar;

    @Column(name = "MONTANT_ASSURE")
    private BigDecimal montantAssure;

    @Column(name = "MONTANT_PRIME", nullable = false)
    private BigDecimal montantPrime;

    @Lob
    @Column(name = "CONTRAT", nullable = false)
    private byte[] contrat;

    // Getters et setters
}
```

---

## 📌 **5. `ArchiveDTO.java`**
Le DTO pour recevoir les données depuis le frontend.

```java
import java.math.BigDecimal;

public class ArchiveDTO {
    private String numPolice;
    private String nom;
    private String prenom;
    private String njf;
    private String annee;
    private String mois;
    private String produitId;
    private String archivePar;
    private String montantAssure;
    private BigDecimal montantPrime;
    private String contratBase64; // Contrat encodé en Base64

    // Getters et setters
}
```

---

## 🚀 **Résumé**
✔ **API `/api/archivage/save`** reçoit une **liste de contrats**  
✔ Vérifie si le **contrat existe déjà** en base  
✔ Vérifie que le fichier est bien un **PDF**  
✔ Convertit le **Base64 en BLOB** et insère en BDD  
✔ Stocke les **contrats archivés**  

Tu peux tester en envoyant une requête **POST** avec Postman ou un client HTTP :  

```json
POST /api/archivage/save
Content-Type: application/json

[
  {
    "numPolice": "123456",
    "nom": "Dupont",
    "prenom": "Jean",
    "njf": "N/A",
    "annee": "2024",
    "mois": "07",
    "produitId": "1",
    "archivePar": "2",
    "montantAssure": "50000",
    "montantPrime": 200.50,
    "contratBase64": "JVBERi0xLjUKJcfs...==" // Base64 d'un fichier PDF
  }
]
```

---

## ✅ **Avantages**
✔ Pas de package Oracle  
✔ Compatible avec **Spring Data JPA**  
✔ Supporte **les transactions et validations**  

Tu peux l'intégrer directement dans ton projet ! 🚀
