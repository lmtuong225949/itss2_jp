import { ParkingLot, UserLocation, ParkingRecommendation } from '../types/parking';
import { mockParkingLots, calculateDistance } from '../../data/mockData';

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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return this.parkingLots.map(parking => ({
      ...parking,
      lastUpdated: new Date(),
    }));
  }

  // Lấy bãi đỗ xe gần người dùng
  async getNearbyParkingLots(userLocation: UserLocation): Promise<ParkingLot[]> {
    const allLots = await this.getAllParkingLots();
    
    return allLots
      .map(parking => ({
        ...parking,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          parking.latitude,
          parking.longitude
        ),
      }))
      .filter(parking => parking.distance <= 10) // Within 10km
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  // Lấy gợi ý bãi đỗ xe tốt nhất
  async getParkingRecommendations(
    userLocation: UserLocation,
    maxDistance: number = 5
  ): Promise<ParkingRecommendation[]> {
    const nearbyLots = await this.getNearbyParkingLots(userLocation);
    
    return nearbyLots
      .filter(parking => 
        (parking.distance || 0) <= maxDistance && 
        parking.availableSpaces > 0 &&
        parking.isOpen
      )
      .map(parking => {
        const availabilityScore = this.calculateAvailabilityScore(parking);
        const distanceScore = this.calculateDistanceScore(parking.distance || 0);
        const priceScore = this.calculatePriceScore(parking.pricePerHour);
        const ratingScore = this.calculateRatingScore(parking.rating || 0);
        
        const overallScore = (
          availabilityScore * 0.4 +
          distanceScore * 0.3 +
          priceScore * 0.2 +
          ratingScore * 0.1
        );

        return {
          parkingLot: parking,
          distance: parking.distance || 0,
          estimatedTime: this.calculateEstimatedTime(parking.distance || 0),
          availabilityScore: overallScore,
          reasonKeys: this.generateRecommendationReason(parking, overallScore),
        };
      })
      .sort((a, b) => b.availabilityScore - a.availabilityScore)
      .slice(0, 5); // Top 5 recommendations
  }

  // Tính điểm độ phù hợp về chỗ trống
  private calculateAvailabilityScore(parking: ParkingLot): number {
    const availabilityRatio = parking.availableSpaces / parking.totalSpaces;
    
    if (availabilityRatio > 0.5) return 1.0;
    if (availabilityRatio > 0.3) return 0.8;
    if (availabilityRatio > 0.1) return 0.6;
    return 0.3;
  }

  // Tính điểm độ phù hợp về khoảng cách
  private calculateDistanceScore(distance: number): number {
    if (distance <= 1) return 1.0;
    if (distance <= 2) return 0.8;
    if (distance <= 3) return 0.6;
    if (distance <= 5) return 0.4;
    return 0.2;
  }

  // Tính điểm độ phù hợp về giá
  private calculatePriceScore(price: number): number {
    if (price <= 5000) return 1.0;
    if (price <= 10000) return 0.8;
    if (price <= 15000) return 0.6;
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
  private generateRecommendationReason(parking: ParkingLot, score: number): string[] {
    const reasons: string[] = [];
    
    if (parking.availableSpaces / parking.totalSpaces > 0.5) {
      reasons.push('manySpaces');
    }
    
    if (parking.distance && parking.distance < 2) {
      reasons.push('nearby');
    }
    
    if (parking.pricePerHour <= 10000) {
      reasons.push('cheapPrice');
    }
    
    if (parking.rating && parking.rating >= 4.0) {
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
}
