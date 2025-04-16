const adjectives = [
    "Pix", "Snap", "Zoom", "Flash", "Focus", "Focale", "Vue", "Blur", "Click",
    "Shot", "Insta", "Obscur", "Kodak", "Pose", "Plan", "Clair", "Net", "Bokeh",
    "Photo", "Déclenche", "Negative", "Posei", "Ciné", "Film"
  ];
  
  const nouns = [
    "Love", "ocalypse", "tonStyle", "Vision", "Moment", "Fiction", "Vibes",
    "licious", "OnYou", "Noir", "Rigolo", "claque", "Backwards", "Boom",
    "Linéaire", "Fusion", "oscope", "orama", "mania", "oscope", "Graphie"
  ];
  
  const generatePseudo = () => {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return adj + noun;
  };