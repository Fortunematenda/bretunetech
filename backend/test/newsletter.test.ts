import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { signUnsubscribeToken, verifyUnsubscribeToken } from '../src/modules/newsletter/newsletter.tokens';

describe('newsletter tokens', () => {
  test('unsubscribe token verifies for subscriber id', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const token = signUnsubscribeToken(id);
    assert.ok(verifyUnsubscribeToken(id, token));
    assert.equal(verifyUnsubscribeToken(id, token + 'x'), false);
  });
});