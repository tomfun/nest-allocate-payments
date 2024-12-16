import { Test, TestingModule } from '@nestjs/testing';
import { MaximizePayoutService } from './maximize-payout.service';
import setTimeout = jest.setTimeout;

describe('MaximizePayoutService', function () {
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
