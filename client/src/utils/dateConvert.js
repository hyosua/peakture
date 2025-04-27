// src/utils/dateConvert.js

export const monthsList = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ]
  
  export const getMonthName = (monthNumber) => {
    if (monthNumber < 1 || monthNumber > 12) return "Mois invalide"
    return monthsList[monthNumber - 1]
  }
  