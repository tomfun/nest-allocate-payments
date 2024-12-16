import { Test, TestingModule } from '@nestjs/testing';
import { MaximizePayoutService } from './maximize-payout.service';

describe('MaximizePayoutService', () => {
  let service: MaximizePayoutService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MaximizePayoutService],
    }).compile();

    service = module.get<MaximizePayoutService>(MaximizePayoutService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('simple', function () {
    it('should return empty result when no payments are available', () => {
      const result = service.maximizePayout(100, []);
      expect(result).toEqual({ totalPayout: 0, selectedPayments: [] });
    });

    it('should return empty result when capacity is zero', () => {
      const payments = [{ id: '1', availablePayOutAmount: 50 }];
      const result = service.maximizePayout(0, payments);
      expect(result).toEqual({ totalPayout: 0, selectedPayments: [] });
    });

    it('should select one payment that fits exactly into the capacity', () => {
      const payments = [{ id: '1', availablePayOutAmount: 50 }];
      const result = service.maximizePayout(50, payments);
      expect(result).toEqual({
        totalPayout: 50,
        selectedPayments: [{ id: '1', availablePayOutAmount: 50 }],
      });
    });

    it('should select all payments when total capacity covers all', () => {
      const payments = [
        { id: '1', availablePayOutAmount: 30 },
        { id: '2', availablePayOutAmount: 20 },
      ];
      const result = service.maximizePayout(100, payments);
      expect(result).toEqual({
        totalPayout: 50,
        selectedPayments: [
          { id: '1', availablePayOutAmount: 30 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });

    it('should select payments to maximize payout when capacity is limited', () => {
      const payments = [
        { id: '1', availablePayOutAmount: 30 },
        { id: '2', availablePayOutAmount: 20 },
        { id: '3', availablePayOutAmount: 50 },
      ];
      const result = service.maximizePayout(70, payments);
      expect(result).toEqual({
        totalPayout: 70,
        selectedPayments: [
          { id: '3', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });

    it('should break ties by ID when payments have the same available amount', () => {
      const payments = [
        { id: '2', availablePayOutAmount: 50 },
        { id: '1', availablePayOutAmount: 50 },
      ];
      const result = service.maximizePayout(100, payments);
      expect(result).toEqual({
        totalPayout: 100,
        selectedPayments: [
          { id: '1', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 50 },
        ],
      });
    });

    it('should be fast on big length', async () => {
      let id = 1;
      const LENGTH = 100 * 1000;
      const payments = new Array(LENGTH)
        .fill(0)
        .map(() => ({ id: (id++).toString(), availablePayOutAmount: 50 }));
      const result = service.maximizePayout(LENGTH * 50, payments);
      expect(result.totalPayout).toEqual(LENGTH * 50);
      expect(result.selectedPayments).toHaveLength(LENGTH);
      await new Promise((r) => global.setTimeout(r)); // jest bug fix
    }, 50);
  });

  describe('slow', function () {
    it('should return empty result when no payments are available', () => {
      const result = service.maximizePayoutDP(100, []);
      expect(result).toEqual({ totalPayout: 0, selectedPayments: [] });
    });

    it('should return empty result when capacity is zero', () => {
      const payments = [{ id: '1', availablePayOutAmount: 50 }];
      const result = service.maximizePayoutDP(0, payments);
      expect(result).toEqual({ totalPayout: 0, selectedPayments: [] });
    });

    it('should select one payment that fits exactly into the capacity', () => {
      const payments = [{ id: '1', availablePayOutAmount: 50 }];
      const result = service.maximizePayoutDP(50, payments);
      expect(result).toEqual({
        totalPayout: 50,
        selectedPayments: [{ id: '1', availablePayOutAmount: 50 }],
      });
    });

    it('should select all payments when total capacity covers all', () => {
      const payments = [
        { id: '1', availablePayOutAmount: 30 },
        { id: '2', availablePayOutAmount: 20 },
      ];
      const result = service.maximizePayoutDP(100, payments);
      expect(result).toEqual({
        totalPayout: 50,
        selectedPayments: [
          { id: '2', availablePayOutAmount: 20 },
          { id: '1', availablePayOutAmount: 30 },
        ],
      });
    });

    it('should select payments to maximize payout when capacity is limited', () => {
      const payments = [
        { id: '1', availablePayOutAmount: 30 },
        { id: '2', availablePayOutAmount: 20 },
        { id: '3', availablePayOutAmount: 50 },
      ];
      const result = service.maximizePayoutDP(70, payments);
      expect(result).toEqual({
        totalPayout: 70,
        selectedPayments: [
          { id: '3', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });
    it('should select payments to maximize payout when capacity is limited harder', () => {
      const payments = [
        { id: '1', availablePayOutAmount: 30 },
        { id: '2', availablePayOutAmount: 20 },
        { id: '3', availablePayOutAmount: 50 },
        { id: '4', availablePayOutAmount: 12 },
        { id: '5', availablePayOutAmount: 8 },
        { id: '6', availablePayOutAmount: 3 },
        { id: '7', availablePayOutAmount: 1 },
      ];
      const result = service.maximizePayoutDP(79, payments);
      expect(result).toEqual({
        totalPayout: 79,
        selectedPayments: [
          { id: '7', availablePayOutAmount: 1 },
          { id: '5', availablePayOutAmount: 8 },
          { id: '3', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });

    it('should select payments to maximize payout when capacity is limited another', () => {
      const payments = [
        { id: '2', availablePayOutAmount: 20 },
        { id: '3', availablePayOutAmount: 50 },
        { id: '4', availablePayOutAmount: 12 },
        { id: '5', availablePayOutAmount: 8 },
        { id: '6', availablePayOutAmount: 3 },
        { id: '7', availablePayOutAmount: 1 },
      ];
      const result = service.maximizePayoutDP(80, payments);
      expect(result).toEqual({
        totalPayout: 79,
        selectedPayments: [
          { id: '7', availablePayOutAmount: 1 },
          { id: '5', availablePayOutAmount: 8 },
          { id: '3', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });

    it('should select payments to maximize payout when capacity is limited one more', () => {
      const payments = [
        { id: '2', availablePayOutAmount: 20 },
        { id: '3', availablePayOutAmount: 50 },
        { id: '4', availablePayOutAmount: 12 },
        { id: '5', availablePayOutAmount: 8 },
        { id: '6', availablePayOutAmount: 3 },
        { id: '7', availablePayOutAmount: 1 },
      ];
      const result = service.maximizePayoutDP(90, payments);
      expect(result).toEqual({
        totalPayout: 90,
        selectedPayments: [
          { id: '5', availablePayOutAmount: 8 },
          { id: '4', availablePayOutAmount: 12 },
          { id: '3', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 20 },
        ],
      });
    });

    it('should break ties by ID when payments have the same available amount', () => {
      const payments = [
        { id: '2', availablePayOutAmount: 50 },
        { id: '1', availablePayOutAmount: 50 },
      ];
      const result = service.maximizePayoutDP(100, payments);
      expect(result).toEqual({
        totalPayout: 100,
        selectedPayments: [
          { id: '1', availablePayOutAmount: 50 },
          { id: '2', availablePayOutAmount: 50 },
        ],
      });
    });

    it('should be fast on big length', async () => {
      let id = 1;
      const LENGTH = 100;
      const payments = new Array(LENGTH)
        .fill(0)
        .map(() => ({ id: (id++).toString(), availablePayOutAmount: 50 }));
      const result = service.maximizePayoutDP(LENGTH * 50, payments);
      expect(result.totalPayout).toEqual(LENGTH * 50);
      expect(result.selectedPayments).toHaveLength(LENGTH);
      await new Promise((r) => global.setTimeout(r)); // jest bug fix
    }, 250);
  });
});
