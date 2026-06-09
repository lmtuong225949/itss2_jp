import { Language, LocalizedText, ParkingLot } from '../types/parking';

export type LocalizedParkingLot = Omit<ParkingLot, 'name' | 'address' | 'features'> & {
  name: string;
  address: string;
  features: string[];
};

export const getLocalizedText = (text: string | LocalizedText, language: Language): string => {
  if (typeof text === 'string') {
    return text;
  }

  return text[language] || text.en || text.vi || text.ja;
};

export const localizeParkingLot = (parking: ParkingLot, language: Language): LocalizedParkingLot => ({
  ...parking,
  name: getLocalizedText(parking.name, language),
  address: getLocalizedText(parking.address, language),
  features: parking.features.map(feature => getLocalizedText(feature, language)),
});