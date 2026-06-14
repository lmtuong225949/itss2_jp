import { ParkingLot } from '../types/parking';

export const mockParkingLots: ParkingLot[] = [
  {
    id: '1',
    name: {
      vi: 'Hầm gửi xe C7',
      en: 'C7 Parking Basement',
      ja: 'C7 駐車場地下',
    },
    address: {
      vi: 'Toà C7 Đại học Bách Khoa Hà Nội',
      en: 'C7 Building, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 C7棟',
    },
    latitude: 21.005451,
    longitude: 105.844849,
    totalSpaces: 200,
    availableSpaces: 44,
    pricePerHour: 5000,
    isOpen: true,
    rating: 4.2,
    features: [{ vi: 'Có mái che', en: 'Covered', ja: '屋根あり' }],
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: {
      vi: 'Bãi đỗ xe D3-D5',
      en: 'D3-D5 Parking Lot',
      ja: 'D3-D5 駐車場',
    },
    address: {
      vi: 'Sân D3-D5 Đại học Bách Khoa Hà Nội',
      en: 'D3-D5 Yard, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 D3-D5 広場',
    },
    latitude: 21.004905,
    longitude: 105.844962,
    totalSpaces: 150,
    availableSpaces: 8,
    pricePerHour: 3000,
    isOpen: true,
    rating: 3.8,
    features: [],
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: {
      vi: 'Bãi đỗ xe D7-D9',
      en: 'D7-D9 Parking Lot',
      ja: 'D7-D9 駐車場',
    },
    address: {
      vi: 'Sân D7-D9 ĐH Bách Khoa Hà Nội',
      en: 'D7-D9 Yard, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 D7-D9 広場',
    },
    latitude: 21.004099,
    longitude: 105.844254,
    totalSpaces: 300,
    availableSpaces: 180,
    pricePerHour: 5000,
    isOpen: true,
    rating: 4.5,
    features: [],
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: {
      vi: 'Bãi đỗ xe D4-D6-D8',
      en: 'D4-D6-D8 Parking Lot',
      ja: 'D4-D6-D8 駐車場',
    },
    address: {
      vi: 'Sân D4-D6-D8 ĐH Bách Khoa Hà Nội',
      en: 'D4-D6-D8 Yard, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 D4-D6-D8 広場',
    },
    latitude: 21.004574,
    longitude: 105.842553,
    totalSpaces: 80,
    availableSpaces: 6,
    pricePerHour: 4000,
    isOpen: true,
    rating: 4,
    features: [{ vi: 'Có mái che', en: 'Covered', ja: '屋根あり' }],
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: {
      vi: 'Bãi đỗ xe C9',
      en: 'C9 Parking Lot',
      ja: 'C9 駐車場',
    },
    address: {
      vi: 'Sân C9 ĐH Bách Khoa Hà Nội',
      en: 'C9 Yard, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 C9 広場',
    },
    latitude: 21.005441,
    longitude: 105.842156,
    totalSpaces: 120,
    availableSpaces: 97,
    pricePerHour: 5000,
    isOpen: false,
    rating: 3.5,
    features: [],
    lastUpdated: new Date(),
  },
  {
    id: '6',
    name: {
      vi: 'Bãi đỗ xe B1',
      en: 'B1 Parking Lot',
      ja: 'B1 駐車場',
    },
    address: {
      vi: 'Sân B1 ĐH Bách Khoa Hà Nội',
      en: 'B1 Yard, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 B1 広場',
    },
    latitude: 21.00487,
    longitude: 105.846094,
    totalSpaces: 234,
    availableSpaces: 139,
    pricePerHour: 3000,
    isOpen: true,
    rating: 3.7,
    features: [{ vi: 'Có mái che', en: 'Covered', ja: '屋根あり' }],
    lastUpdated: new Date(),
  },
  {
    id: '7',
    name: {
      vi: 'Bãi đỗ xe KTX B6',
      en: 'Dormitory B6 Parking Lot',
      ja: 'B6 寮駐車場',
    },
    address: {
      vi: 'Ktx B6 ĐH Bách Khoa Hà Nội',
      en: 'Dormitory B6, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 B6 寮',
    },
    latitude: 21.006593,
    longitude: 105.846131,
    totalSpaces: 120,
    availableSpaces: 60,
    pricePerHour: 3000,
    isOpen: true,
    rating: 4.7,
    features: [],
    lastUpdated: new Date(),
  },
  {
    id: '8',
    name: {
      vi: 'Bãi đỗ xe C4',
      en: 'C4 Parking Lot',
      ja: 'C4 駐車場',
    },
    address: {
      vi: 'Khu vực C4 ĐH Bách Khoa Hà Nội',
      en: 'C4 Area, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 C4 エリア',
    },
    latitude: 21.006027,
    longitude: 105.844157,
    totalSpaces: 100,
    availableSpaces: 39,
    pricePerHour: 3000,
    isOpen: true,
    rating: 4.1,
    features: [{ vi: 'Có mái che', en: 'Covered', ja: '屋根あり' }],
    lastUpdated: new Date(),
  },
  {
    id: '9',
    name: {
      vi: 'Hầm gửi xe D8',
      en: 'D8 Parking Basement',
      ja: 'D8 駐車場地下',
    },
    address: {
      vi: 'Hầm D8 ĐH Bách Khoa Hà Nội',
      en: 'D8 Basement, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 D8 地下駐車場',
    },
    latitude: 21.003948,
    longitude: 105.842425,
    totalSpaces: 80,
    availableSpaces: 21,
    pricePerHour: 3000,
    isOpen: true,
    rating: 4,
    features: [{ vi: 'Có mái che', en: 'Covered', ja: '屋根あり' }],
    lastUpdated: new Date(),
  },
  {
    id: '11',
    name: {
      vi: 'Bãi đỗ xe Sân vận động',
      en: 'Stadium Parking Lot',
      ja: 'スタジアム駐車場',
    },
    address: {
      vi: 'Khu vực Sân vận động ĐH Bách Khoa',
      en: 'Stadium Area, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 スタジアムエリア',
    },
    latitude: 21.002701,
    longitude: 105.84766,
    totalSpaces: 120,
    availableSpaces: 57,
    pricePerHour: 3000,
    isOpen: true,
    rating: 3.9,
    features: [],
    lastUpdated: new Date(),
  },
  {
    id: '12',
    name: {
      vi: 'Bãi đỗ xe Nhà thi đấu',
      en: 'Gymnasium Parking Lot',
      ja: '体育館駐車場',
    },
    address: {
      vi: 'Khu vực Nhà thi đấu ĐH Bách Khoa',
      en: 'Gymnasium Area, Hanoi University of Science and Technology',
      ja: 'ハノイ工科大学 体育館エリア',
    },
    latitude: 21.002752,
    longitude: 105.846545,
    totalSpaces: 90,
    availableSpaces: 35,
    pricePerHour: 3000,
    isOpen: true,
    rating: 4.2,
    features: [],
    lastUpdated: new Date(),
  }
];


export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
