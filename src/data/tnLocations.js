/**
 * PRABRIX AI - Tamil Nadu Administrative Master Data
 * Districts and Taluks for geographic classification and cascade dropdowns.
 */

export const TN_DISTRICTS_DATA = {
  Coimbatore: {
    taluks: ['Sulur', 'Coimbatore North', 'Coimbatore South', 'Pollachi', 'Mettupalayam', 'Annur', 'Kinathukadavu', 'Valparai', 'Madukkarai', 'Perur'],
    defaultCoords: [11.0168, 76.9558],
  },
  Chennai: {
    taluks: ['Guindy', 'Mylapore', 'Tondiarpet', 'Egmore', 'Ayanavaram', 'Aminjikarai', 'Velachery', 'Mambalam', 'Perambur', 'Purasawalkam', 'Sholinganallur', 'Alandur'],
    defaultCoords: [13.0827, 80.2707],
  },
  Chengalpattu: {
    taluks: ['Tambaram', 'Chengalpattu', 'Pallavaram', 'Vandalur', 'Thiruporur', 'Maduranthakam', 'Cheyyur'],
    defaultCoords: [12.6946, 79.9774],
  },
  Tiruvallur: {
    taluks: ['Avadi', 'Poonamallee', 'Tiruvallur', 'Ponneri', 'Gummidipoondi', 'Tiruttani', 'Uthukkottai', 'R.K. Pet'],
    defaultCoords: [13.1437, 79.9079],
  },
  Kanchipuram: {
    taluks: ['Sriperumbudur', 'Kanchipuram', 'Walajabad', 'Kundrathur', 'Uthiramerur'],
    defaultCoords: [12.8342, 79.7036],
  },
  Madurai: {
    taluks: ['Madurai East', 'Madurai West', 'Madurai North', 'Madurai South', 'Melur', 'Thirumangalam', 'Vadipatti', 'Usilampatti', 'Peraiyur'],
    defaultCoords: [9.9252, 78.1198],
  },
  Tiruchirappalli: {
    taluks: ['Srirangam', 'Tiruchirappalli East', 'Tiruchirappalli West', 'Lalgudi', 'Manapparai', 'Musiri', 'Thuraiyur', 'Thiruverumbur', 'Marungapuri'],
    defaultCoords: [10.7905, 78.7047],
  },
  Salem: {
    taluks: ['Salem', 'Salem West', 'Salem South', 'Attur', 'Mettur', 'Omalur', 'Edappadi', 'Sankari', 'Yercaud', 'Gangavalli', 'Kadayampatti', 'Pethanaickenpalayam', 'Valapady'],
    defaultCoords: [11.6643, 78.146],
  },
  Tiruppur: {
    taluks: ['Tiruppur North', 'Tiruppur South', 'Avinashi', 'Palladam', 'Dharapuram', 'Kangeyam', 'Udumalaipettai', 'Madathukulam', 'Uthukuli'],
    defaultCoords: [11.1085, 77.3411],
  },
  Erode: {
    taluks: ['Erode', 'Perundurai', 'Bhavani', 'Gobichettipalayam', 'Sathyamangalam', 'Anthiyur', 'Modakkurichi', 'Kodumudi', 'Thalavadi'],
    defaultCoords: [11.341, 77.7172],
  },
  Vellore: {
    taluks: ['Vellore', 'Katpadi', 'Gudiyatham', 'Anaicut', 'Pernambut', 'Kaniyambadi'],
    defaultCoords: [12.9165, 79.1325],
  },
  Thanjavur: {
    taluks: ['Thanjavur', 'Kumbakonam', 'Papanasam', 'Pattukkottai', 'Peravurani', 'Orathanadu', 'Thiruvaiyaru', 'Budalur', 'Thiruvidaimarudur'],
    defaultCoords: [10.787, 79.1378],
  },
  Dindigul: {
    taluks: ['Dindigul East', 'Dindigul West', 'Palani', 'Kodaikanal', 'Natham', 'Nilakkottai', 'Oddanchatram', 'Vedasandur', 'Athoor', 'Gujiliamparai'],
    defaultCoords: [10.3673, 77.9803],
  },
  Tirunelveli: {
    taluks: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Nanguneri', 'Radhapuram', 'Cheranmahadevi', 'Manur', 'Tisayanvilai'],
    defaultCoords: [8.7139, 77.7567],
  },
};

export const DISTRICTS = Object.keys(TN_DISTRICTS_DATA).sort();

export const getDistrictNames = () => DISTRICTS;

export const getTaluksByDistrict = (district) => {
  if (!district || !TN_DISTRICTS_DATA[district]) return [];
  return TN_DISTRICTS_DATA[district].taluks;
};

export const getDistrictDefaultCoords = (district) => {
  if (!district || !TN_DISTRICTS_DATA[district]) return [11.0598, 78.3874];
  return TN_DISTRICTS_DATA[district].defaultCoords;
};
