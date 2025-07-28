import { RoundType, TargetFace, BowType } from '@/types';

// Standard World Archery target faces
const TARGET_122CM: TargetFace = {
  size: 122,
  rings: [
    { value: 10, innerRadius: 0, outerRadius: 6.1, color: '#FFD700' }, // Gold inner
    { value: 9, innerRadius: 6.1, outerRadius: 12.2, color: '#FFD700' }, // Gold outer
    { value: 8, innerRadius: 12.2, outerRadius: 18.3, color: '#FF0000' }, // Red inner
    { value: 7, innerRadius: 18.3, outerRadius: 24.4, color: '#FF0000' }, // Red outer
    { value: 6, innerRadius: 24.4, outerRadius: 30.5, color: '#0000FF' }, // Blue inner
    { value: 5, innerRadius: 30.5, outerRadius: 36.6, color: '#0000FF' }, // Blue outer
    { value: 4, innerRadius: 36.6, outerRadius: 42.7, color: '#000000' }, // Black inner
    { value: 3, innerRadius: 42.7, outerRadius: 48.8, color: '#000000' }, // Black outer
    { value: 2, innerRadius: 48.8, outerRadius: 54.9, color: '#FFFFFF' }, // White inner
    { value: 1, innerRadius: 54.9, outerRadius: 61.0, color: '#FFFFFF' }, // White outer
  ]
};

const TARGET_80CM: TargetFace = {
  size: 80,
  rings: [
    { value: 10, innerRadius: 0, outerRadius: 4.0, color: '#FFD700' },
    { value: 9, innerRadius: 4.0, outerRadius: 8.0, color: '#FFD700' },
    { value: 8, innerRadius: 8.0, outerRadius: 12.0, color: '#FF0000' },
    { value: 7, innerRadius: 12.0, outerRadius: 16.0, color: '#FF0000' },
    { value: 6, innerRadius: 16.0, outerRadius: 20.0, color: '#0000FF' },
    { value: 5, innerRadius: 20.0, outerRadius: 24.0, color: '#0000FF' },
    { value: 4, innerRadius: 24.0, outerRadius: 28.0, color: '#000000' },
    { value: 3, innerRadius: 28.0, outerRadius: 32.0, color: '#000000' },
    { value: 2, innerRadius: 32.0, outerRadius: 36.0, color: '#FFFFFF' },
    { value: 1, innerRadius: 36.0, outerRadius: 40.0, color: '#FFFFFF' },
  ]
};

const TARGET_40CM: TargetFace = {
  size: 40,
  rings: [
    { value: 10, innerRadius: 0, outerRadius: 2.0, color: '#FFD700' },
    { value: 9, innerRadius: 2.0, outerRadius: 4.0, color: '#FFD700' },
    { value: 8, innerRadius: 4.0, outerRadius: 6.0, color: '#FF0000' },
    { value: 7, innerRadius: 6.0, outerRadius: 8.0, color: '#FF0000' },
    { value: 6, innerRadius: 8.0, outerRadius: 10.0, color: '#0000FF' },
    { value: 5, innerRadius: 10.0, outerRadius: 12.0, color: '#0000FF' },
    { value: 4, innerRadius: 12.0, outerRadius: 14.0, color: '#000000' },
    { value: 3, innerRadius: 14.0, outerRadius: 16.0, color: '#000000' },
    { value: 2, innerRadius: 16.0, outerRadius: 18.0, color: '#FFFFFF' },
    { value: 1, innerRadius: 18.0, outerRadius: 20.0, color: '#FFFFFF' },
  ]
};

// Standard bow types
const BOW_TYPES: BowType[] = [
  {
    id: 'recurve',
    name: 'Recurve Bow',
    category: 'recurve',
    description: 'Traditional recurve bow without mechanical aids'
  },
  {
    id: 'compound',
    name: 'Compound Bow',
    category: 'compound',
    description: 'Modern bow with cams and mechanical advantage'
  },
  {
    id: 'barebow',
    name: 'Barebow',
    category: 'barebow',
    description: 'Recurve bow without sights or stabilizers'
  },
  {
    id: 'traditional',
    name: 'Traditional Bow',
    category: 'traditional',
    description: 'Historical longbow or traditional recurve'
  }
];

// Standard round types following World Archery rules
const ROUND_TYPES: RoundType[] = [
  {
    id: '70m-122cm',
    name: '70m Round',
    distance: 70,
    targetFace: TARGET_122CM,
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720
  },
  {
    id: '60m-122cm',
    name: '60m Round',
    distance: 60,
    targetFace: TARGET_122CM,
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720
  },
  {
    id: '50m-122cm',
    name: '50m Round',
    distance: 50,
    targetFace: TARGET_122CM,
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720
  },
  {
    id: '30m-80cm',
    name: '30m Round',
    distance: 30,
    targetFace: TARGET_80CM,
    arrowsPerEnd: 6,
    totalEnds: 12,
    maxScore: 720
  },
  {
    id: '18m-40cm',
    name: '18m Round',
    distance: 18,
    targetFace: TARGET_40CM,
    arrowsPerEnd: 3,
    totalEnds: 20,
    maxScore: 600
  },
  {
    id: 'practice-30m',
    name: 'Practice 30m',
    distance: 30,
    targetFace: TARGET_80CM,
    arrowsPerEnd: 3,
    totalEnds: 10,
    maxScore: 300,
    isConfigurable: true
  },
  {
    id: 'practice-18m',
    name: 'Practice 18m',
    distance: 18,
    targetFace: TARGET_40CM,
    arrowsPerEnd: 3,
    totalEnds: 10,
    maxScore: 300,
    isConfigurable: true
  },
  {
    id: 'custom-practice',
    name: 'Custom Practice',
    distance: 30,
    targetFace: TARGET_80CM,
    arrowsPerEnd: 3,
    totalEnds: 10,
    maxScore: 300,
    isConfigurable: true
  }
];

export class RoundTypes {
  static getAll(): RoundType[] {
    return [...ROUND_TYPES];
  }

  static getById(id: string): RoundType | undefined {
    return ROUND_TYPES.find(round => round.id === id);
  }

  static getByDistance(distance: number): RoundType[] {
    return ROUND_TYPES.filter(round => round.distance === distance);
  }

  static getTargetFace(size: number): TargetFace | undefined {
    switch (size) {
      case 122:
        return TARGET_122CM;
      case 80:
        return TARGET_80CM;
      case 40:
        return TARGET_40CM;
      default:
        return undefined;
    }
  }

  static validateRoundType(roundType: Partial<RoundType>): boolean {
    return !!(
      roundType.id &&
      roundType.name &&
      roundType.distance &&
      roundType.targetFace &&
      roundType.arrowsPerEnd &&
      roundType.totalEnds &&
      roundType.maxScore
    );
  }

  static calculateMaxScore(arrowsPerEnd: number, totalEnds: number): number {
    return arrowsPerEnd * totalEnds * 10;
  }

  static getAllBowTypes(): BowType[] {
    return [...BOW_TYPES];
  }

  static getBowTypeById(id: string): BowType | undefined {
    return BOW_TYPES.find(bow => bow.id === id);
  }

  static getBowTypesByCategory(category: string): BowType[] {
    return BOW_TYPES.filter(bow => bow.category === category);
  }

  static createCustomRound(
    distance: number,
    arrowsPerEnd: number,
    totalEnds: number,
    targetSize: number = 80
  ): RoundType {
    const targetFace = this.getTargetFace(targetSize) || TARGET_80CM;
    return {
      id: `custom-${distance}m-${arrowsPerEnd}x${totalEnds}`,
      name: `Custom ${distance}m (${arrowsPerEnd}×${totalEnds})`,
      distance,
      targetFace,
      arrowsPerEnd,
      totalEnds,
      maxScore: this.calculateMaxScore(arrowsPerEnd, totalEnds),
      isConfigurable: true
    };
  }
}
