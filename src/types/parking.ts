export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpaces: number;
  availableSpaces: number;
  pricePerHour: number;
  isOpen: boolean;
  distance?: number;
  rating?: number;
  features: string[];
  lastUpdated: Date;
}

export interface ParkingSensor {
  id: string;
  parkingLotId: string;
  sensorType: 'camera' | 'ultrasonic' | 'infrared';
  isOccupied: boolean;
  lastDetected: Date;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface ParkingRecommendation {
  parkingLot: ParkingLot;
  distance: number;
  estimatedTime: number;
  availabilityScore: number;
  reasonKeys: string[];
}
