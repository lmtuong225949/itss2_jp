import { ParkingLot } from '../src/types/parking';

export const mockParkingLots: ParkingLot[] = [
  {
    id: '1',
    name: 'Bãi đỗ xe Trung tâm thương mại',
    address: '123 Trần Hưng Đạo, Q.1, TP.HCM',
    latitude: 10.7769,
    longitude: 106.7009,
    totalSpaces: 200,
    availableSpaces: 45,
    pricePerHour: 15000,
    isOpen: true,
    rating: 4.2,
    features: ['Có mái che', 'An ninh 24/7', 'Sạc xe điện'],
    lastUpdated: new Date(),
  },
  {
    id: '2',
    name: 'Bãi đỗ xe Bệnh viện',
    address: '456 Nguyễn Trãi, Q.5, TP.HCM',
    latitude: 10.7569,
    longitude: 106.6809,
    totalSpaces: 150,
    availableSpaces: 12,
    pricePerHour: 10000,
    isOpen: true,
    rating: 3.8,
    features: ['Miễn phí 1h', 'Gần bệnh viện'],
    lastUpdated: new Date(),
  },
  {
    id: '3',
    name: 'Bãi đỗ xe Siêu thị',
    address: '789 Lê Lợi, Q.3, TP.HCM',
    latitude: 10.7869,
    longitude: 106.6909,
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
    name: 'Bãi đỗ xe Văn phòng',
    address: '321 Đồng Khởi, Q.1, TP.HCM',
    latitude: 10.7719,
    longitude: 106.7059,
    totalSpaces: 80,
    availableSpaces: 5,
    pricePerHour: 20000,
    isOpen: true,
    rating: 4.0,
    features: ['Trong nhà', 'Thang máy'],
    lastUpdated: new Date(),
  },
  {
    id: '5',
    name: 'Bãi đỗ xe Công viên',
    address: '654 Hoàng Văn Thụ, Q. Phú Nhuận',
    latitude: 10.7969,
    longitude: 106.6709,
    totalSpaces: 120,
    availableSpaces: 95,
    pricePerHour: 8000,
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
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
