import { ParkingLot, UserLocation, ParkingRecommendation } from '../types/parking';
import { mockParkingLots, calculateDistance } from '../data/mockData';

export class ParkingService {
  private static instance: ParkingService;
  private parkingLots: ParkingLot[] = mockParkingLots;

  static getInstance(): ParkingService {
    if (!ParkingService.instance) {
      ParkingService.instance = new ParkingService();
    }
    return ParkingService.instance;
  }

  // Lấy tất cả bãi đỗ xe
  async getAllParkingLots(): Promise<ParkingLot[]> {
    // Simulate API call (resolved instantly to prevent focus lagging on destination change)
    await Promise.resolve();

    return this.parkingLots.map(parking => ({
      ...parking,
      lastUpdated: new Date(),
    }));
  }

  // Lấy bãi đỗ xe gần người dùng hoặc điểm đến
  async getNearbyParkingLots(
    referenceLocation: UserLocation,
    userLocation?: UserLocation | null
  ): Promise<ParkingLot[]> {
    const allLots = await this.getAllParkingLots();

    return allLots
      .map(parking => {
        const distToReference = calculateDistance(
          referenceLocation.latitude,
          referenceLocation.longitude,
          parking.latitude,
          parking.longitude
        );

        const distToUser = userLocation
          ? calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              parking.latitude,
              parking.longitude
            )
          : distToReference;

        return {
          ...parking,
          distance: distToReference,
          drivingDistance: distToUser,
        };
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  // Lấy gợi ý bãi đỗ xe tốt nhất
  async getParkingRecommendations(
    userLocation: UserLocation,
    destination: UserLocation | null = null,
    maxDistance: number = 5,
    criteria: 'balanced' | 'closest' | 'cheapest' | 'empty' = 'balanced'
  ): Promise<ParkingRecommendation[]> {
    const reference = destination || userLocation;
    const nearbyLots = await this.getNearbyParkingLots(reference, userLocation);

    return nearbyLots
      .filter(parking =>
        parking.availableSpaces > 0 &&
        parking.isOpen
      )
      .map(parking => {
        const availabilityScore = this.calculateAvailabilityScore(parking);
        const distanceScore = this.calculateDistanceScore(parking.distance || 0);
        const priceScore = this.calculatePriceScore(parking.pricePerHour);
        const ratingScore = this.calculateRatingScore(parking.rating || 0);

        let overallScore = 0;
        if (criteria === 'closest') {
          overallScore = (
            distanceScore * 0.85 +
            availabilityScore * 0.10 +
            priceScore * 0.05
          );
        } else if (criteria === 'cheapest') {
          overallScore = (
            priceScore * 0.85 +
            distanceScore * 0.10 +
            availabilityScore * 0.05
          );
        } else if (criteria === 'empty') {
          overallScore = (
            availabilityScore * 0.85 +
            distanceScore * 0.10 +
            priceScore * 0.05
          );
        } else {
          overallScore = (
            distanceScore * 0.40 +
            availabilityScore * 0.30 +
            priceScore * 0.20 +
            ratingScore * 0.10
          );
        }

        let estimatedTime = 0;
        let walkingDistance = 0;
        let drivingDistance = parking.drivingDistance || parking.distance || 0;

        if (destination) {
          walkingDistance = parking.distance || 0;
          const drivingTime = Math.ceil(drivingDistance * 2); // 30km/h
          const walkingTime = Math.ceil(walkingDistance * 12); // 5km/h (12 mins per km)
          estimatedTime = drivingTime + walkingTime;
        } else {
          estimatedTime = Math.ceil(drivingDistance * 2);
        }

        return {
          parkingLot: parking,
          distance: parking.distance || 0,
          estimatedTime,
          availabilityScore: overallScore,
          reasonKeys: this.generateRecommendationReason(parking, overallScore, !!destination, criteria),
          walkingDistance: destination ? walkingDistance : undefined,
          drivingDistance: destination ? drivingDistance : undefined,
        };
      })
      .sort((a, b) => b.availabilityScore - a.availabilityScore)
      .slice(0, 5); // Top 5 recommendations
  }

  // Tính điểm độ phù hợp về chỗ trống (continuous, factoring ratio and absolute space count)
  private calculateAvailabilityScore(parking: ParkingLot): number {
    const ratio = parking.availableSpaces / parking.totalSpaces;
    const absoluteFactor = Math.min(1.0, parking.availableSpaces / 150);
    return ratio * 0.5 + absoluteFactor * 0.5;
  }

  // Tính điểm độ phù hợp về khoảng cách (continuous decay to distinguish granular campus distances)
  private calculateDistanceScore(distance: number): number {
    return Math.exp(-2.5 * distance);
  }

  // Tính điểm độ phù hợp về giá
  private calculatePriceScore(price: number): number {
    if (price <= 3000) return 1.0;
    if (price <= 5000) return 0.8;
    if (price <= 10000) return 0.6;
    return 0.4;
  }

  // Tính điểm độ phù hợp về rating
  private calculateRatingScore(rating: number): number {
    return rating / 5.0;
  }

  // Tính thời gian di chuyển ước tính
  private calculateEstimatedTime(distance: number): number {
    // Assume average speed of 30 km/h in city
    return Math.ceil(distance * 2); // minutes
  }

  // Tạo lý do gợi ý (trả về mảng các key translation)
  private generateRecommendationReason(
    parking: ParkingLot,
    score: number,
    isDestination: boolean = false,
    criteria: 'balanced' | 'closest' | 'cheapest' | 'empty' = 'balanced'
  ): string[] {
    const reasons: string[] = [];

    // Prioritize criteria-based reasons first
    if (criteria === 'closest' && parking.distance && parking.distance < 0.3) {
      reasons.push('nearby');
    } else if (criteria === 'cheapest' && parking.pricePerHour <= 5000) {
      reasons.push('cheapPrice');
    } else if (criteria === 'empty' && (parking.availableSpaces / parking.totalSpaces > 0.4)) {
      reasons.push('manySpaces');
    }

    if (parking.availableSpaces / parking.totalSpaces > 0.5 && !reasons.includes('manySpaces')) {
      reasons.push('manySpaces');
    }

    if (parking.distance && parking.distance < 2 && !reasons.includes('nearby')) {
      reasons.push('nearby');
    }

    if (parking.pricePerHour <= 10000 && !reasons.includes('cheapPrice')) {
      reasons.push('cheapPrice');
    }

    if (parking.rating && parking.rating >= 4.0 && !reasons.includes('highRating')) {
      reasons.push('highRating');
    }

    if (reasons.length === 0) {
      return ['suitableChoice'];
    }

    return reasons;
  }

  // Cập nhật thông tin bãi đỗ xe (simulated real-time update)
  async updateParkingLotAvailability(parkingId: string, change: number): Promise<void> {
    const parkingIndex = this.parkingLots.findIndex(p => p.id === parkingId);
    if (parkingIndex !== -1) {
      const newAvailable = this.parkingLots[parkingIndex].availableSpaces + change;
      this.parkingLots[parkingIndex].availableSpaces = Math.max(
        0,
        Math.min(newAvailable, this.parkingLots[parkingIndex].totalSpaces)
      );
      this.parkingLots[parkingIndex].lastUpdated = new Date();
    }
  }

  // Tìm kiếm bãi đỗ xe theo tên
  async searchParkingLots(query: string): Promise<ParkingLot[]> {
    const allLots = await this.getAllParkingLots();
    const lowerQuery = query.toLowerCase();

    return allLots.filter(parking =>
      parking.name.toLowerCase().includes(lowerQuery) ||
      parking.address.toLowerCase().includes(lowerQuery)
    );
  }

  // Cập nhật tọa độ bãi đỗ xe
  updateParkingLotCoordinates(parkingId: string, lat: number, lon: number): void {
    const parking = this.parkingLots.find(p => p.id === parkingId);
    if (parking) {
      parking.latitude = lat;
      parking.longitude = lon;
    }
  }
}
