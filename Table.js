// 🔥 Regroupe les contrats par Partenaire > Produit > Année > Mois
const getGroupedData = (data) => {
  const grouped = {};
  data.forEach((contract) => {
    const { partenaire, produit, annee, mois } = contract;
    if (!grouped[partenaire]) grouped[partenaire] = {};
    if (!grouped[partenaire][produit]) grouped[partenaire][produit] = {};
    if (!grouped[partenaire][produit][annee]) grouped[partenaire][produit][annee] = {};
    if (!grouped[partenaire][produit][annee][mois]) grouped[partenaire][produit][annee][mois] = [];
    grouped[partenaire][produit][annee][mois].push(contract);
  });
  return grouped;
};

// ✅ Fonction pour compter les contrats dans un objet groupé
const countContracts = (group) => {
  let count = 0;
  Object.values(group).forEach((subgroup) => {
    if (Array.isArray(subgroup)) {
      count += subgroup.length; // Si c'est une liste de contrats, on compte directement
    } else {
      count += countContracts(subgroup); // Sinon, on continue à parcourir
    }
  });
  return count;
};
