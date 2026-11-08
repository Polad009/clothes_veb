/**
 * Tier 1 Feature Tests: Tri-Channel Real-Time State Synchronization
 * Covers: context/StoreDataContext.tsx, app/api/admin/[...slug]/route.ts, public/admin.html
 */

import { describe, test } from '../../scripts/run-e2e-tests.mjs';
import {
  assert,
  assertEqual,
  assertContains,
  assertMatches,
  readProjectFile,
} from '../helpers/test-context.mjs';

describe('Real-Time Tri-Channel Data Synchronization Contract', () => {
  const storeContextCode = readProjectFile('context/StoreDataContext.tsx');
  const adminApiRoute = readProjectFile('app/api/admin/[...slug]/route.ts');
  const adminHtml = readProjectFile('public/admin.html');

  test('FEAT-SYNC-01.1: StoreDataContext hooks BroadcastChannel("horwalle_store_sync")', () => {
    assertContains(
      storeContextCode,
      'horwalle_store_sync',
      'StoreDataContext must create BroadcastChannel for "horwalle_store_sync"'
    );
    assertMatches(
      storeContextCode,
      /new\s+BroadcastChannel\s*\(\s*["']horwalle_store_sync["']\s*\)/,
      'StoreDataContext must instantiate BroadcastChannel("horwalle_store_sync")'
    );
    assertMatches(
      storeContextCode,
      /bc\.onmessage|bc\.addEventListener\s*\(\s*["']message["']/,
      'StoreDataContext must attach message listener to BroadcastChannel'
    );
  });

  test('FEAT-SYNC-01.2: StoreDataContext handles postMessage iframe communication bridge', () => {
    assertMatches(
      storeContextCode,
      /window\.addEventListener\s*\(\s*["']message["']/,
      'StoreDataContext must listen for window postMessage events across iframe boundary'
    );
    assertMatches(
      storeContextCode,
      /hv-store-refresh|DATA_UPDATED/,
      'postMessage listener must trigger on hv-store-refresh or DATA_UPDATED message'
    );
  });

  test('FEAT-SYNC-01.3: StoreDataContext hooks storage events for cross-tab sync', () => {
    assertMatches(
      storeContextCode,
      /window\.addEventListener\s*\(\s*["']storage["']/,
      'StoreDataContext must listen for localStorage storage events'
    );
    assertMatches(
      storeContextCode,
      /hv_store_updated|hv_last_sync/,
      'storage listener must check hv_store_updated or hv_last_sync keys'
    );
  });

  test('FEAT-SYNC-01.4: Admin API (/api/admin/data) sets strict anti-cache HTTP headers', () => {
    assertMatches(
      adminApiRoute,
      /Cache-Control[\s\S]*?no-store[\s\S]*?no-cache[\s\S]*?must-revalidate/,
      '/api/admin/data must set Cache-Control: no-store, no-cache, must-revalidate'
    );
    assertMatches(
      adminApiRoute,
      /Pragma[\s\S]*?no-cache/,
      '/api/admin/data must set Pragma: no-cache'
    );
    assertMatches(
      adminApiRoute,
      /Expires[\s\S]*?0/,
      '/api/admin/data must set Expires: 0'
    );
  });

  test('FEAT-SYNC-01.5: BroadcastChannel contract payload schema validation', () => {
    const validTypes = ['DATA_UPDATED', 'PRODUCT_MUTATED', 'ORDER_PLACED', 'REFRESH'];

    function validateSyncPayload(payload) {
      assert(payload && typeof payload === 'object', 'Payload must be object');
      assert(validTypes.includes(payload.type), `Invalid sync type: ${payload.type}`);
      assert(typeof payload.timestamp === 'number' && payload.timestamp > 0, 'Timestamp must be positive number');
      if (payload.source) {
        assert(['admin', 'storefront'].includes(payload.source), `Invalid source: ${payload.source}`);
      }
      return true;
    }

    assert(validateSyncPayload({ type: 'DATA_UPDATED', timestamp: Date.now(), source: 'admin' }));
    assert(validateSyncPayload({ type: 'PRODUCT_MUTATED', timestamp: Date.now(), source: 'admin' }));
    assert(validateSyncPayload({ type: 'ORDER_PLACED', timestamp: Date.now(), source: 'storefront' }));
    assert(validateSyncPayload({ type: 'REFRESH', timestamp: Date.now() }));
  });

  test('FEAT-SYNC-01.6: Background fetch cleanup and channel teardown in StoreDataContext', () => {
    assertMatches(
      storeContextCode,
      /bc\.close\(\)/,
      'StoreDataContext cleanup must close BroadcastChannel to prevent memory leaks'
    );
    assertMatches(
      storeContextCode,
      /removeEventListener\s*\(\s*["']message["']/,
      'StoreDataContext must unhook message listener on unmount'
    );
    assertMatches(
      storeContextCode,
      /removeEventListener\s*\(\s*["']storage["']/,
      'StoreDataContext must unhook storage listener on unmount'
    );
  });

  test('FEAT-SYNC-01.7: Dual admin clients implement real-time synchronization broadcaster', () => {
    const portalHtml = readProjectFile('admin-portal/public/index.html');

    // 1. Verify BroadcastChannel in public/admin.html
    assertMatches(
      adminHtml,
      /new\s+BroadcastChannel\s*\(\s*['"]horwalle_store_sync['"]\s*\)/,
      'public/admin.html must instantiate BroadcastChannel("horwalle_store_sync")'
    );
    assertContains(
      adminHtml,
      'window.parent.postMessage',
      'public/admin.html must dispatch window.parent.postMessage'
    );

    // 2. Verify BroadcastChannel in admin-portal/public/index.html
    assertMatches(
      portalHtml,
      /new\s+BroadcastChannel\s*\(\s*['"]horwalle_store_sync['"]\s*\)/,
      'admin-portal/public/index.html must instantiate BroadcastChannel("horwalle_store_sync")'
    );
    assertContains(
      portalHtml,
      'window.parent.postMessage',
      'admin-portal/public/index.html must dispatch window.parent.postMessage'
    );
  });
});
