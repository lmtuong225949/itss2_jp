import { ParkingLot } from '../src/types/parking';

export const mockParkingLots: ParkingLot[] = [
  {
    id: '1',
    name: 'Bãi đỗ xe C7',
    address: 'Toà C7 Đại học Bách Khoa Hà Nội',
    latitude: 21.005445,
    longitude: 105.844893,
    totalSpaces: 200,
    availableSpaces: 45,
    pricePerHour: 5000,
    isOpen: true,
    rating: 4.2,
    features: ['Có mái che', 'An ninh 24/7', 'Sạc xe điện'],
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Bãi đỗ xe D3-D5',
    address: 'Sân D3-D5 Đại học Bách Khoa Hà Nội',
    latitude: 21.004667,
    longitude: 105.844917,
    totalSpaces: 150,
    availableSpaces: 12,
    pricePerHour: 3000,
    isOpen: true,
    rating: 3.8,
    features: ['Miễn phí 1h', 'Gần ký túc xá'],
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Bãi đỗ xe D9',
    address: 'Sân D9 ĐH Bách Khoa Hà Nội',
    latitude: 21.0039508,
    longitude: 105.8439859,
    totalSpaces: 300,
    availableSpaces: 180,
    pricePerHour: 5000,
    isOpen: true,
    rating: 4.5,
    features: ['Miễn phí cho khách', 'Rộng rãi'],
    lastUpdated: new Date(),
  },
  {
    id: '4',
    name: 'Bãi đỗ xe D6-D8',
    address: 'Sân D6-D8 ĐH Bách Khoa Hà Nội',
    latitude: 21.0040809,
    longitude: 105.8424684,
    totalSpaces: 80,
    availableSpaces: 5,
    pricePerHour: 4000,
    isOpen: true,
    rating: 4.0,
    features: ['Trong nhà', 'Thang máy'],
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Bãi đỗ xe C9',
    address: 'Sân C9 ĐH Bách Khoa Hà Nội',
    latitude: 21.0054132,
    longitude: 105.8422539,
    totalSpaces: 120,
    availableSpaces: 95,
    pricePerHour: 5000,
    isOpen: false,
    rating: 3.5,
    features: ['Mở cửa 6h-22h', 'Gần công viên'],
    lastUpdated: new Date(),
  },
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
