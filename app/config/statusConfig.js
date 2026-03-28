// ============================================================
// Státusz konfiguráció
// ============================================================

export const STATUS_OPTIONS = [
  { label: 'Teljesítve',        color: '#1A7A40', textColor: '#FFFFFF' },
  { label: 'Visszaszállítani', color: '#5DCAA5', textColor: '#FFFFFF' },
  { label: 'Begyűjtésre vár',  color: '#C0001A', textColor: '#FFFFFF' },
  { label: 'Javítva',           color: '#F0C040', textColor: '#1A1A1A' },
  { label: 'Nem javítható',    color: '#444441', textColor: '#FFFFFF' },
  { label: 'Reselecto',         color: '#D3D1C7', textColor: '#1A1A1A' },
  { label: 'Reselecto Service', color: '#185FA5', textColor: '#FFFFFF' },
];

export const getStatusConfig = (status) => {
  const found = STATUS_OPTIONS.find(
    (s) => s.label.toLowerCase() === (status || '').toLowerCase()
  );
  return found || { label: status || 'Ismeretlen', color: '#999999', textColor: '#FFFFFF' };
};
