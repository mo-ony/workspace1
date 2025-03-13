



package com.example.archivage.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public class ArchivageRepository {

    private final JdbcTemplate jdbcTemplate;

    public ArchivageRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<String> findExistingContrat(String nom, String prenom, String numContrat) {
        String sql = "SELECT num_police FROM Archivage WHERE nom = ? AND prenom = ? AND num_police = ?";
        List<String> results = jdbcTemplate.queryForList(sql, String.class, nom, prenom, numContrat);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    public void saveArchive(Map<String, Object> archive) {
        String sql = "CALL INSERT_ARCHIVAGE(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                archive.get("archivePar"),
                archive.get("produitId"),
                archive.get("annee"),
                archive.get("mois"),
                archive.get("numContrat"),
                archive.get("nom"),
                archive.get("prenom"),
                archive.get("blob"),
                archive.get("montantAssure"),
                archive.get("montantPrime")
        );
    }
}







CREATE OR REPLACE PROCEDURE INSERT_ARCHIVAGE(
    p_archive_par IN NUMBER,
    p_produit_id IN NUMBER,
    p_annee IN NUMBER,
    p_mois IN NUMBER,
    p_num_police IN VARCHAR2,
    p_nom IN VARCHAR2,
    p_prenom IN VARCHAR2,
    p_contrat IN BLOB,
    p_montant_assure IN NUMBER,
    p_montant_prime IN NUMBER
)
IS
    v_count NUMBER;
BEGIN
    -- Vérifier l'unicité
    SELECT COUNT(*) INTO v_count
    FROM Archivage
    WHERE num_police = p_num_police AND nom = p_nom AND prenom = p_prenom;

    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Le contrat ' || p_num_police || ' existe déjà pour ' || p_nom || ' ' || p_prenom);
    END IF;

    -- Insérer l'archive
    INSERT INTO Archivage (archive_par, produit_id, annee, mois, num_police, nom, prenom, contrat, montant_assure, montant_prime)
    VALUES (p_archive_par, p_produit_id, p_annee, p_mois, p_num_police, p_nom, p_prenom, p_contrat, p_montant_assure, p_montant_prime);
    
    COMMIT;
END INSERT_ARCHIVAGE;
/




package com.example.archivage.service;

import com.example.archivage.repository.ArchivageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ArchivageService {

    @Autowired
    private ArchivageRepository archivageRepository;

    @Transactional
    public void saveArchives(List<Map<String, Object>> archives) {
        for (Map<String, Object> archive : archives) {
            String numContrat = (String) archive.get("numContrat");
            String nom = (String) archive.get("nom");
            String prenom = (String) archive.get("prenom");

            Optional<String> existingContrat = archivageRepository.findExistingContrat(nom, prenom, numContrat);
            if (existingContrat.isPresent()) {
                throw new RuntimeException("Le contrat avec le numéro " + numContrat + " existe déjà pour " + nom + " " + prenom);
            }

            String fileType = (String) archive.get("fileType");
            if (!"application/pdf".equalsIgnoreCase(fileType)) {
                throw new RuntimeException("Seuls les fichiers PDF sont autorisés. Fichier fourni: " + fileType);
            }

            archivageRepository.saveArchive(archive);
        }
    }
}




import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/archives")
@CrossOrigin(origins = "http://localhost:3000")
public class ArchiveController {

    @Autowired
    private ArchiveService archiveService;

    @PostMapping("/save")
    public ResponseEntity<?> saveArchives(@RequestBody List<ArchiveDTO> archives) {
        List<Map<String, String>> errors = archiveService.saveArchives(archives);
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }
        return ResponseEntity.ok("Archives saved successfully!");
    }
}





