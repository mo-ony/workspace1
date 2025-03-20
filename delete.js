Voici comment implémenter la suppression d'un contrat et l'enregistrement des suppressions dans une table `delete_archive_log` avec **Spring Boot** et **JPA**.

---

## **✅ 1. Ajouter l'Entité `DeleteArchiveLog`**
On crée une entité pour suivre les suppressions.

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "delete_archive_log")
public class DeleteArchiveLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "num_contract", nullable = false)
    private String numContract;

    @Column(name = "deleted_by", nullable = false)
    private String deletedBy;

    @Column(name = "delete_time", nullable = false)
    private LocalDateTime deleteTime = LocalDateTime.now();
}
```

---

## **✅ 2. Ajouter l'Entité `Contract`**
On suppose que les contrats sont stockés dans une table `contracts`.

```java
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "num_police", nullable = false, unique = true)
    private String numPolice;
}
```

---

## **✅ 3. Créer les Repositories**
On définit les interfaces pour accéder aux données.

### **🔹 Repository des contrats**
```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    void deleteByNumPolice(String numPolice);
}
```

### **🔹 Repository du log de suppression**
```java
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeleteArchiveLogRepository extends JpaRepository<DeleteArchiveLog, Long> {
}
```

---

## **✅ 4. Créer le Service `ContractService`**
Gère la suppression et l'archivage des logs.

```java
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class ContractService {

    private final ContractRepository contractRepository;
    private final DeleteArchiveLogRepository deleteArchiveLogRepository;

    public ContractService(ContractRepository contractRepository, DeleteArchiveLogRepository deleteArchiveLogRepository) {
        this.contractRepository = contractRepository;
        this.deleteArchiveLogRepository = deleteArchiveLogRepository;
    }

    @Transactional
    public void deleteContract(String numPolice, String deletedBy) {
        // Vérifier si le contrat existe
        contractRepository.findByNumPolice(numPolice).orElseThrow(() -> new RuntimeException("Contract not found"));

        // Supprimer le contrat
        contractRepository.deleteByNumPolice(numPolice);

        // Enregistrer la suppression
        DeleteArchiveLog log = new DeleteArchiveLog();
        log.setNumContract(numPolice);
        log.setDeletedBy(deletedBy);
        log.setDeleteTime(LocalDateTime.now());

        deleteArchiveLogRepository.save(log);
    }
}
```

---

## **✅ 5. Créer le Contrôleur REST**
Expose un endpoint pour supprimer un contrat.

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteContract(@RequestParam String numPolice, @RequestParam String deletedBy) {
        contractService.deleteContract(numPolice, deletedBy);
        return ResponseEntity.ok("Contract deleted successfully");
    }
}
```

---

## **✅ 6. Ajouter le SQL pour `delete_archive_log`**
Si elle n'existe pas, créez la table avec :

```sql
CREATE TABLE delete_archive_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    num_contract VARCHAR(50) NOT NULL,
    deleted_by VARCHAR(100) NOT NULL,
    delete_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## **🎯 Résumé**
1. **Ajout d'une entité `DeleteArchiveLog`** pour enregistrer les suppressions.
2. **Création des repositories** pour gérer les données.
3. **Ajout d'un service `ContractService`** pour la suppression et le logging.
4. **Création d'un contrôleur REST** pour exposer l'API `DELETE /api/contracts/delete`.
5. **Ajout du script SQL** pour la table `delete_archive_log`.

---

✅ **Test avec Axios (Frontend)**
Ajoutez cette requête dans votre code React :

```javascript
await axios.delete("/api/contracts/delete", {
  params: { numPolice: selectedContractId, deletedBy: "AdminUser" }
});
```

Tout est prêt ! 🚀 Dis-moi si tu veux des améliorations. 😃
