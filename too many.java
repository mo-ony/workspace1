Merci pour le partage du code 💡. Effectivement, **la procédure actuelle ne peut retourner qu’une seule ligne**, car elle utilise des `OUT VARCHAR2`, et soulève une exception si plusieurs lignes sont retournées (`TOO_MANY_ROWS`).

---

## 🎯 Objectif
Tu veux maintenant **adapter la procédure pour qu’elle puisse retourner plusieurs lignes** → donc **remplacer tous les `OUT` scalaires par un `REF_CURSOR`**.

---

## ✅ Nouvelle version de la procédure (avec `SYS_REFCURSOR`)

Voici comment adapter proprement la procédure pour qu’elle retourne **un curseur contenant plusieurs résultats** :

```sql
CREATE OR REPLACE PROCEDURE get_user_metadata(
    p_num_contrat     IN VARCHAR2,
    code_produit      IN VARCHAR2,
    p_nom_in          IN VARCHAR2 DEFAULT NULL,
    p_prenom_in       IN VARCHAR2 DEFAULT NULL,
    p_cursor          OUT SYS_REFCURSOR
) IS
BEGIN
    IF code_produit = '3003' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_fille AS njf, a.date_naiss AS date_naissance,
               MNT_ECHEA AS capital_assure, c.mnt_prime, 'CNEP' AS partenaire, c.date_signt AS date_adhesion
        FROM sahti_contrat c, sahti_assure a
        WHERE a.num_part = c.num_part AND c.num_police = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSIF code_produit = '130' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_fille AS njf, a.date_naiss AS date_naissance,
               c.montant_assure AS capital_assure, c.mnt_prime, 'CNEP' AS partenaire, c.date_effet AS date_adhesion
        FROM ctp_contrat c, ctp_assure a
        WHERE a.num_part = c.num_part AND c.num_police = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSIF code_produit = '350' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_fille AS njf, a.date_naiss AS date_naissance,
               NULL AS capital_assure, c.montant_prime AS mnt_prime, 'CNEP' AS partenaire, c.date_effet AS date_adhesion
        FROM rihlati_cnep_contrat c, rihlati_cnep_assure a
        WHERE c.num_police = a.num_police AND c.num_police = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSIF code_produit = '3001' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_j_fille AS njf, a.date_nais AS date_naissance,
               c.mnt_assur AS capital_assure, d.mnt_prime, 'CNEP' AS partenaire, c.debut_crid AS date_adhesion
        FROM assure a, contrat c, detail_contrat d
        WHERE c.cle_ops = d.cle_ops AND a.num_part = d.num_part AND c.num_police = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSIF code_produit = '46' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_fille AS njf, a.date_naiss AS date_naissance,
               NULL AS capital_assure, c.num_adhesion AS mnt_prime, 'BNP' AS partenaire, c.date_effet AS date_adhesion
        FROM visa_bnp_contrat c, visa_bnp_assure a
        WHERE c.num_adhesion = a.num_adhesion AND c.num_adhesion = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSIF code_produit = 'K0799' THEN
        OPEN p_cursor FOR
        SELECT a.nom, a.prenom, a.nom_fille AS njf, a.date_naissance AS date_naissance,
               c.montant_assure AS capital_assure, c.prime_assure AS mnt_prime, 'BNP' AS partenaire, c.date_deblocage AS date_adhesion
        FROM contrat_ade_bnp_conso c, assure_ade_bnp_conso a
        WHERE c.num_dossier = a.num_dossier AND c.num_police = p_num_contrat
          AND (p_nom_in IS NULL OR a.nom = p_nom_in)
          AND (p_prenom_in IS NULL OR a.prenom = p_prenom_in);

    ELSE
        -- Par défaut : curseur vide
        OPEN p_cursor FOR SELECT NULL AS nom, NULL AS prenom, NULL AS njf, NULL AS date_naissance,
                                 NULL AS capital_assure, NULL AS mnt_prime, NULL AS partenaire, NULL AS date_adhesion
        FROM dual WHERE 1 = 0;

    END IF;
END get_user_metadata;
```

---

## 🛠️ Côté Java : adaptation avec `REF_CURSOR`

Voici un exemple de configuration `SimpleJdbcCall` dans ton backend :

```java
SimpleJdbcCall jdbcCall = new SimpleJdbcCall(dataSource)
    .withProcedureName("get_user_metadata")
    .declareParameters(
        new SqlParameter("p_num_contrat", Types.VARCHAR),
        new SqlParameter("code_produit", Types.VARCHAR),
        new SqlParameter("p_nom_in", Types.VARCHAR),
        new SqlParameter("p_prenom_in", Types.VARCHAR),
        new SqlOutParameter("p_cursor", OracleTypes.CURSOR, new ColumnMapRowMapper())
    );

Map<String, Object> result = jdbcCall.execute(
    new MapSqlParameterSource()
        .addValue("p_num_contrat", numContrat)
        .addValue("code_produit", codeProduit)
        .addValue("p_nom_in", nom)
        .addValue("p_prenom_in", prenom)
);

List<Map<String, Object>> rows = (List<Map<String, Object>>) result.get("p_cursor");
```

---

Souhaites-tu que je t’aide à tester ça ou l'intégrer dans un service existant ?




Parfait ! Voici comment intégrer ta procédure `get_user_metadata` dans un **service** et un **controller** Spring Boot, en utilisant `JdbcTemplate` pour appeler la procédure et renvoyer les résultats sous forme d’objet JSON.

---

### ✅ 1. Crée un DTO pour stocker les résultats


// UserMetadataDTO.java
public class UserMetadataDTO {
    private String nom;
    private String prenom;
    private String njf;
    private String dateNaissance;
    private String capitalAssure;
    private String montantPrime;
    private String partenaine;
    private String dateAdhesion;

    // Getters et Setters
}
```

---

### ✅ 2. Service Java : Appel à la procédure PL/SQL

```java
// UserMetadataService.java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.SqlOutParameter;
import org.springframework.jdbc.core.SqlParameter;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.sql.Types;
import java.util.Map;

@Service
public class UserMetadataService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private SimpleJdbcCall simpleJdbcCall;

    @PostConstruct
    public void init() {
        simpleJdbcCall = new SimpleJdbcCall(jdbcTemplate)
            .withProcedureName("get_user_metadata")
            .declareParameters(
                new SqlParameter("p_num_contrat", Types.VARCHAR),
                new SqlParameter("code_produit", Types.VARCHAR),
                new SqlParameter("p_nom_in", Types.VARCHAR),
                new SqlParameter("p_prenom_in", Types.VARCHAR),

                new SqlOutParameter("p_nom", Types.VARCHAR),
                new SqlOutParameter("p_prenom", Types.VARCHAR),
                new SqlOutParameter("p_njf", Types.VARCHAR),
                new SqlOutParameter("p_date_naissance", Types.VARCHAR),
                new SqlOutParameter("p_capital_assure", Types.VARCHAR),
                new SqlOutParameter("p_mnt_prime", Types.VARCHAR),
                new SqlOutParameter("p_partenaine", Types.VARCHAR),
                new SqlOutParameter("p_date_adhesion", Types.VARCHAR)
            );
    }

    public UserMetadataDTO getUserMetadata(String numContrat, String codeProduit, String nomIn, String prenomIn) {
        Map<String, Object> result = simpleJdbcCall.execute(Map.of(
            "p_num_contrat", numContrat,
            "code_produit", codeProduit,
            "p_nom_in", nomIn,
            "p_prenom_in", prenomIn
        ));

        UserMetadataDTO dto = new UserMetadataDTO();
        dto.setNom((String) result.get("p_nom"));
        dto.setPrenom((String) result.get("p_prenom"));
        dto.setNjf((String) result.get("p_njf"));
        dto.setDateNaissance((String) result.get("p_date_naissance"));
        dto.setCapitalAssure((String) result.get("p_capital_assure"));
        dto.setMontantPrime((String) result.get("p_mnt_prime"));
        dto.setPartenaine((String) result.get("p_partenaine"));
        dto.setDateAdhesion((String) result.get("p_date_adhesion"));

        return dto;
    }
}
```

---

### ✅ 3. Controller : Endpoint pour exposer la donnée

```java
// UserMetadataController.java
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metadata")
public class UserMetadataController {

    @Autowired
    private UserMetadataService userMetadataService;

    @GetMapping
    public UserMetadataDTO getUserMetadata(
        @RequestParam String numContrat,
        @RequestParam String codeProduit,
        @RequestParam(required = false) String nom,
        @RequestParam(required = false) String prenom
    ) {
        return userMetadataService.getUserMetadata(numContrat, codeProduit, nom, prenom);
    }
}
```

---

### 🔄 Exemple d’appel HTTP :

```
GET /api/metadata?numContrat=123456&codeProduit=130&nom=DOE&prenom=JOHN
```

---

Souhaites-tu que je t’aide aussi à faire un test Postman ou intégrer cela dans un front React ?
