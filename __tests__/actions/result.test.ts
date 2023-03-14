import { describe, expect, test } from '@jest/globals';

import { actionOk, actionSkip, actionErr } from '../../src/actions/result';

describe('ActionResult', () => {
  describe('actionSkip()', () => {
    const result = actionSkip();

    test('isOk() = true', () => {
      expect(result.isOk()).toBe(true);
    });

    test('isErr() = false', () => {
      expect(result.isErr()).toBe(false);
    });

    test('type = Skip', () => {
      expect(result._unsafeUnwrap().type).toBe('Skip');
    });
  });

  describe("actionOk('success')", () => {
    const result = actionOk('success');

    test('isOk() = true', () => {
      expect(result.isOk()).toBe(true);
    });

    test('isErr() = false', () => {
      expect(result.isErr()).toBe(false);
    });

    test('type = Success', () => {
      expect(result._unsafeUnwrap().type).toBe('Success');
    });

    test("message = 'success'", () => {
      const resultOk = result._unsafeUnwrap();
      if (resultOk.type === 'Success') {
        expect(resultOk.message).toBe('success');
      }
    });
  });

  describe("actionErr('failure')", () => {
    const result = actionErr('failure');

    test('isOk() = false', () => {
      expect(result.isOk()).toBe(false);
    });

    test('isErr() = true', () => {
      expect(result.isErr()).toBe(true);
    });

    test('type = Failure', () => {
      expect(result._unsafeUnwrapErr().type).toBe('Failure');
    });

    test("message = 'failure'", () => {
      expect(result._unsafeUnwrapErr().message).toBe('failure');
    });
  });
});
