// Mock data for mining permits and applications
export const miningData = [
  {
    id: "QP-REG-004-C",
    permitHolder: "Northern Essentials",
    commodity: "Basalt",
    area: "4.9541",
    barangay: "San Jose",
    municipality: "Rodriguez",
    province: "Rizal",
    dateApproved: "2019-05-15",
    dateExpiry: "2024-05-15",
    status: "With application for renewal",
    type: "National"
  },
  {
    id: "QP-REG-006",
    permitHolder: "Blue River Minerals",
    commodity: "Basalt",
    area: "5.0000",
    barangay: "San Jose",
    municipality: "Rodriguez",
    province: "Rizal",
    dateApproved: "2020-03-10",
    dateExpiry: "2025-03-10",
    status: "Active",
    type: "National"
  },
  {
    id: "QP No. 002-C-2021",
    permitHolder: "JB Construction Corporation",
    commodity: "Quarry Materials",
    area: "4.3393",
    barangay: "Brgy. Pinagbayanan II",
    municipality: "Masinloc",
    province: "Cavite",
    dateApproved: "2021-02-01",
    dateExpiry: "2026-02-01",
    status: "Commercial Operation",
    type: "National"
  },
  {
    id: "QP No. 002-C-2021",
    permitHolder: "Technomax Development Corporation",
    commodity: "Quarry Materials",
    area: "4.8998",
    barangay: "Brgy. Sapang I",
    municipality: "Ternate",
    province: "Cavite",
    dateApproved: "2021-12-15",
    dateExpiry: "2026-12-15",
    status: "With existing Quarry and Quarry Order",
    type: "National"
  },
  {
    id: "QP No. 002-C-2022",
    permitHolder: "ACG Quarrying Services (Cavite-Subzone I)",
    commodity: "Filling Materials",
    area: "5",
    barangay: "Brgy. Sapang I",
    municipality: "Ternate",
    province: "Cavite",
    dateApproved: "2022-06-20",
    dateExpiry: "2027-06-20",
    status: "Commercial Operation",
    type: "Local"
  },
  {
    id: "QP No. 002-C-2024",
    permitHolder: "Jerry M. Gloria",
    commodity: "Filling Materials",
    area: "5",
    barangay: "Brgy. Pinagbayanan II",
    municipality: "Masinloc",
    province: "Cavite",
    dateApproved: "2024-01-08",
    dateExpiry: "2029-01-08",
    status: "Commercial Operation",
    type: "Local"
  },
  {
    id: "QP No. 002-C-2024",
    permitHolder: "CPK Contracting Enterprises",
    commodity: "Conglomerate Materials",
    area: "4",
    barangay: "Brgy. Pinagbayanan II",
    municipality: "Masinloc",
    province: "Cavite",
    dateApproved: "2024-05-25",
    dateExpiry: "2029-05-25",
    status: "Commercial Operation",
    type: "Local"
  },
  {
    id: "SP-ACP-04-CAR",
    permitHolder: "Geo-Nickel Oceanic",
    commodity: "Rock Aggregates and Boulful Materials",
    area: "4.9541",
    barangay: "Tondo",
    municipality: "Tuy",
    province: "Batangas",
    dateApproved: "2018-11-20",
    dateExpiry: "2023-11-20",
    status: "Under process",
    type: "Special"
  },
  {
    id: "SP-ACP-04-LIB",
    permitHolder: "Eco-Summit Aggregates Corporation",
    commodity: "Rock Aggregates",
    area: "4.9999",
    barangay: "Pila",
    municipality: "Taysan",
    province: "Batangas",
    dateApproved: "2019-08-15",
    dateExpiry: "2024-08-15",
    status: "Under process",
    type: "Special"
  },
  {
    id: "SP-ACP-04-LIB",
    permitHolder: "Cornerstone Aggregates, Inc.",
    commodity: "Rock Aggregates",
    area: "4.9997",
    barangay: "Luzuriaga",
    municipality: "Calatagan",
    province: "Batangas",
    dateApproved: "2020-12-10",
    dateExpiry: "2025-12-10",
    status: "Under process",
    type: "Special"
  }
];

export const permitTypes = [
  { id: 'all', label: 'All Types' },
  { id: 'national', label: 'National' },
  { id: 'local', label: 'Local' },
  { id: 'special', label: 'Special' }
];

export const provinces = [
  { id: 'all', label: 'All Provinces' },
  { id: 'rizal', label: 'Rizal' },
  { id: 'cavite', label: 'Cavite' },
  { id: 'batangas', label: 'Batangas' },
  { id: 'laguna', label: 'Laguna' },
  { id: 'quezon', label: 'Quezon' }
];

export const commodityTypes = [
  { id: 'all', label: 'All Commodities' },
  { id: 'basalt', label: 'Basalt' },
  { id: 'quarry', label: 'Quarry Materials' },
  { id: 'filling', label: 'Filling Materials' },
  { id: 'conglomerate', label: 'Conglomerate Materials' },
  { id: 'aggregates', label: 'Rock Aggregates' }
];

export const categories = [
  { id: 'mining_rights', label: 'Mining Rights', count: 289 },
  { id: 'mining_applications', label: 'Mining Applications', count: 156 },
  { id: 'special_permits', label: 'Special Permits', count: 404 },
  { id: 'special_applications', label: 'Special Permit Applications', count: 78 },
  { id: 'investigation_records', label: 'Investigation Records', count: 600 }
];
