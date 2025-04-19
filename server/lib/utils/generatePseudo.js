const adjectives = [
    "Rouge", "Bleu", "Gris", "Doré", "Écarlate",
  "Sombre", "Lumineux", "Tacheté", "Velu", "Glacé",
  "Cuivré", "Iridescent", "Flamboyant", "Brumeux", "Furtif",
  "Argenté", "Rugueux", "Lisse", "Massif", "Aérien"
  ];
  
  const nouns = [
    "Corbeau", "Faucon", "Héron", "Colibri", "Albatros",
  "Pélican", "Moineau", "Aigle", "Mésange", "Rossignol",
  "Huppe", "Ibis", "Tisserin", "Coucou", "Perroquet",
  "Cygne", "Touraco", "Ara", "Martin-pêcheur", "Grue"
  ];
  
  const generatePseudo = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return adj + noun;
  };

    export default generatePseudo;