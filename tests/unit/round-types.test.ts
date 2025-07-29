import { describe, it, expect } from '@jest/globals';
import { RoundTypes } from '../../src/utils/round-types';

describe('RoundTypes', () => {
  describe('getAll', () => {
    it('should return all available round types', () => {
      const rounds = RoundTypes.getAll();
      
      expect(rounds).toHaveLength(9);
      expect(rounds[0]).toHaveProperty('id');
      expect(rounds[0]).toHaveProperty('name');
      expect(rounds[0]).toHaveProperty('distance');
      expect(rounds[0]).toHaveProperty('targetFace');
      expect(rounds[0]).toHaveProperty('arrowsPerEnd');
      expect(rounds[0]).toHaveProperty('totalEnds');
      expect(rounds[0]).toHaveProperty('maxScore');
    });

    it('should include standard World Archery rounds', () => {
      const rounds = RoundTypes.getAll();
      const roundIds = rounds.map(r => r.id);
      
      expect(roundIds).toContain('70m-122cm');
      expect(roundIds).toContain('60m-122cm');
      expect(roundIds).toContain('50m-122cm');
      expect(roundIds).toContain('30m-80cm');
      expect(roundIds).toContain('18m-40cm');
    });

    it('should include practice rounds', () => {
      const rounds = RoundTypes.getAll();
      const roundIds = rounds.map(r => r.id);
      
      expect(roundIds).toContain('practice-30m');
      expect(roundIds).toContain('practice-18m');
    });
  });

  describe('getById', () => {
    it('should return the correct round type by id', () => {
      const round = RoundTypes.getById('70m-122cm');
      
      expect(round).toBeDefined();
      expect(round?.id).toBe('70m-122cm');
      expect(round?.name).toBe('70m Round');
      expect(round?.distance).toBe(70);
      expect(round?.maxScore).toBe(720);
    });

    it('should return undefined for invalid id', () => {
      const round = RoundTypes.getById('invalid-id');
      expect(round).toBeUndefined();
    });
  });

  describe('getByDistance', () => {
    it('should return rounds matching the specified distance', () => {
      const rounds = RoundTypes.getByDistance(30);
      
      expect(rounds).toHaveLength(3);
      expect(rounds.every(r => r.distance === 30)).toBe(true);
    });

    it('should return empty array for distance with no rounds', () => {
      const rounds = RoundTypes.getByDistance(999);
      expect(rounds).toHaveLength(0);
    });
  });

  describe('getTargetFace', () => {
    it('should return 122cm target face', () => {
      const target = RoundTypes.getTargetFace(122);
      
      expect(target).toBeDefined();
      expect(target?.size).toBe(122);
      expect(target?.rings).toHaveLength(10);
    });

    it('should return 80cm target face', () => {
      const target = RoundTypes.getTargetFace(80);
      
      expect(target).toBeDefined();
      expect(target?.size).toBe(80);
      expect(target?.rings).toHaveLength(10);
    });

    it('should return 40cm target face', () => {
      const target = RoundTypes.getTargetFace(40);
      
      expect(target).toBeDefined();
      expect(target?.size).toBe(40);
      expect(target?.rings).toHaveLength(10);
    });

    it('should return undefined for invalid size', () => {
      const target = RoundTypes.getTargetFace(999);
      expect(target).toBeUndefined();
    });
  });

  describe('validateRoundType', () => {
    it('should validate a complete round type', () => {
      const validRound = {
        id: 'test-round',
        name: 'Test Round',
        distance: 50,
        targetFace: RoundTypes.getTargetFace(122)!,
        arrowsPerEnd: 6,
        totalEnds: 12,
        maxScore: 720
      };
      
      expect(RoundTypes.validateRoundType(validRound)).toBe(true);
    });

    it('should reject incomplete round type', () => {
      const incompleteRound = {
        id: 'test-round',
        name: 'Test Round'
        // missing required fields
      };
      
      expect(RoundTypes.validateRoundType(incompleteRound)).toBe(false);
    });
  });

  describe('calculateMaxScore', () => {
    it('should calculate correct max score', () => {
      const maxScore = RoundTypes.calculateMaxScore(6, 12);
      expect(maxScore).toBe(720); // 6 arrows * 12 ends * 10 points
    });

    it('should handle different arrow and end counts', () => {
      const maxScore = RoundTypes.calculateMaxScore(3, 10);
      expect(maxScore).toBe(300); // 3 arrows * 10 ends * 10 points
    });
  });

  describe('target face scoring rings', () => {
    it('should have correct scoring values for 122cm target', () => {
      const target = RoundTypes.getTargetFace(122);
      const values = target?.rings.map(r => r.value).sort((a, b) => b - a);
      
      expect(values).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
    });

    it('should have gold rings with values 9 and 10', () => {
      const target = RoundTypes.getTargetFace(122);
      const goldRings = target?.rings.filter(r => r.color === '#FFD700');
      
      expect(goldRings).toHaveLength(2);
      expect(goldRings?.map(r => r.value).sort((a, b) => a - b)).toEqual([9, 10]);
    });

    it('should have proper ring radius progression', () => {
      const target = RoundTypes.getTargetFace(122);
      
      // Inner rings should have smaller radius than outer rings
      const ring10 = target?.rings.find(r => r.value === 10);
      const ring1 = target?.rings.find(r => r.value === 1);
      
      expect(ring10?.outerRadius).toBeLessThan(ring1?.outerRadius || 0);
    });
  });
});
