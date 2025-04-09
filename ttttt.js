const getGroupedData = (data) => {
  const grouped = {};

  data.forEach((contract) => {
    const { partenaire, produit, annee, mois } = contract;

    if (!grouped[partenaire]) {
      grouped[partenaire] = { _meta: { count: 0 } };
    }
    grouped[partenaire]._meta.count++;

    if (!grouped[partenaire][produit]) {
      grouped[partenaire][produit] = { _meta: { count: 0 } };
    }
    grouped[partenaire][produit]._meta.count++;

    if (!grouped[partenaire][produit][annee]) {
      grouped[partenaire][produit][annee] = { _meta: { count: 0 } };
    }
    grouped[partenaire][produit][annee]._meta.count++;

    if (!grouped[partenaire][produit][annee][mois]) {
      grouped[partenaire][produit][annee][mois] = { _meta: { count: 0 } };
    }
    grouped[partenaire][produit][annee][mois]._meta.count++;
  });

  return grouped;
};


Parfait 😊 ! Voici comment tu peux **adapter ta navbar** à cette structure, en affichant par exemple :

- 📌 les **partenaires** (avec le nombre total de contrats),
- 🔽 leurs **produits** (avec leur nombre de contrats),
- 📅 les **années** (idem),
- 🗓️ les **mois**.

---

### ✅ Exemple d’utilisation dans ta navbar (JSX simplifié)


{Object.entries(groupedData).map(([partenaire, partenaireData]) => (
  <div key={partenaire}>
    <strong>{partenaire}</strong> ({partenaireData._meta.count} contrats)

    <ul>
      {Object.entries(partenaireData).map(([produit, produitData]) => {
        if (produit === "_meta") return null; // ignorer _meta

        return (
          <li key={produit}>
            {produit} ({produitData._meta.count} contrats)

            <ul>
              {Object.entries(produitData).map(([annee, anneeData]) => {
                if (annee === "_meta") return null;

                return (
                  <li key={annee}>
                    {annee} ({anneeData._meta.count} contrats)

                    <ul>
                      {Object.entries(anneeData).map(([mois, moisData]) => {
                        if (mois === "_meta") return null;

                        return (
                          <li key={mois}>
                            Mois {mois} ({moisData._meta.count} contrats)
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ul>
  </div>
))}
```

---

### 🔍 Ce qu’on fait ici :
- On **ignore** les clés `_meta` dans chaque boucle avec `if (key === "_meta") return null`.
- On utilise `Object.entries()` pour itérer proprement.
- On affiche les `count` via `data._meta.count`.

---

Tu veux que je te fasse une version stylée avec `Ant Design` ou `Material UI` pour ton projet ?
