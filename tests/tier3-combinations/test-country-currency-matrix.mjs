/**
 * Tier 3 Combination Tests: Country x Currency Pairwise Matrix
 * Covers: Interactions of destinations (AZ, US, TR, GB, DE, AE) with dual currencies (AZN, USD)
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import { assert, assertEqual } from '../helpers/test-context.mjs';

describe('Tier 3 Combinations: Country x Currency Interaction Matrix', async () => {
  const { calculateShippingOptions } = await import('../../lib/shipping.ts');

  const testMatrix = [
    {
      country: 'AZ',
      currency: 'AZN',
      expectedDomestic: true,
      stdCurrency: 'AZN',
      stdBaseCost: 5, // domestic rayon
      freeThreshold: 60,
    },
    {
      country: 'AZ',
      currency: 'USD',
      expectedDomestic: true,
      stdCurrency: 'USD',
      stdBaseCost: 3, // domestic rayon in USD
      freeThreshold: 35,
    },
    {
      country: 'US',
      currency: 'USD',
      expectedDomestic: false,
      stdCurrency: 'USD',
      stdBaseCost: 15,
      freeThreshold: 150,
      expBaseCost: 35,
      expDiscountCost: 20,
      expThreshold: 200,
    },
    {
      country: 'US',
      currency: 'AZN',
      expectedDomestic: false,
      stdCurrency: 'AZN',
      stdBaseCost: 25,
      freeThreshold: 250,
      expBaseCost: 60,
      expDiscountCost: 35,
      expThreshold: 340,
    },
    {
      country: 'TR',
      currency: 'USD',
      expectedDomestic: false,
      stdCurrency: 'USD',
      stdBaseCost: 15,
      freeThreshold: 150,
      expBaseCost: 35,
      expDiscountCost: 20,
      expThreshold: 200,
    },
    {
      country: 'TR',
      currency: 'AZN',
      expectedDomestic: false,
      stdCurrency: 'AZN',
      stdBaseCost: 25,
      freeThreshold: 250,
      expBaseCost: 60,
      expDiscountCost: 35,
      expThreshold: 340,
    },
    {
      country: 'GB',
      currency: 'USD',
      expectedDomestic: false,
      stdCurrency: 'USD',
      stdBaseCost: 15,
      freeThreshold: 150,
      expBaseCost: 35,
      expDiscountCost: 20,
      expThreshold: 200,
    },
    {
      country: 'DE',
      currency: 'USD',
      expectedDomestic: false,
      stdCurrency: 'USD',
      stdBaseCost: 15,
      freeThreshold: 150,
      expBaseCost: 35,
      expDiscountCost: 20,
      expThreshold: 200,
    },
    {
      country: 'AE',
      currency: 'USD',
      expectedDomestic: false,
      stdCurrency: 'USD',
      stdBaseCost: 15,
      freeThreshold: 150,
      expBaseCost: 35,
      expDiscountCost: 20,
      expThreshold: 200,
    },
  ];

  for (const row of testMatrix) {
    test(`PAIRWISE: ${row.country} x ${row.currency} correctly calculates options and currency consistency`, () => {
      // 1. Base order below free threshold
      const baseSubtotal = 20;
      const baseOpts = calculateShippingOptions(row.country, baseSubtotal, row.currency);
      assertEqual(baseOpts.length, 2, `${row.country} should have 2 options`);

      for (const opt of baseOpts) {
        assertEqual(opt.currency, row.currency, `Option currency must match requested currency ${row.currency}`);
      }

      if (row.expectedDomestic) {
        const baku = baseOpts.find((o) => o.id === 'domestic_baku_sumgayit');
        assertEqual(baku.price, 0);
        assertEqual(baku.isFree, true);

        const rayon = baseOpts.find((o) => o.id === 'domestic_region');
        assertEqual(rayon.price, row.stdBaseCost);

        // Threshold check
        const freeOpts = calculateShippingOptions(row.country, row.freeThreshold, row.currency);
        const freeRayon = freeOpts.find((o) => o.id === 'domestic_region');
        assertEqual(freeRayon.price, 0);
        assertEqual(freeRayon.isFree, true);
      } else {
        const standard = baseOpts.find((o) => o.id === 'intl_standard');
        assertEqual(standard.price, row.stdBaseCost);
        assertEqual(standard.isFree, false);

        const express = baseOpts.find((o) => o.id === 'intl_express');
        assertEqual(express.price, row.expBaseCost);

        // Free threshold check
        const freeOpts = calculateShippingOptions(row.country, row.freeThreshold, row.currency);
        const freeStd = freeOpts.find((o) => o.id === 'intl_standard');
        assertEqual(freeStd.price, 0);
        assertEqual(freeStd.isFree, true);

        // Express discount threshold check
        const discOpts = calculateShippingOptions(row.country, row.expThreshold, row.currency);
        const discExp = discOpts.find((o) => o.id === 'intl_express');
        assertEqual(discExp.price, row.expDiscountCost);
      }
    });
  }
});
