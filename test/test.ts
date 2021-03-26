import { getSlots, getAvailableSlots } from '../src/calendar-utils';
import { getUtcComponents } from '../src/date-utils';
import * as assert from "assert";

const baseUrl = 'http://example.com/';

describe('calendar', () => {
  it('get slots', () => {
    const startDate = new Date('2021-03-22 CET');
    const endDate = new Date('2021-03-26 CET');

    const slots = getSlots(startDate, endDate, baseUrl);
    assert.deepStrictEqual(slots.length, 10);
  });

  describe('get available slots', () => {
    it('#1', () => {
      const events = [
        {startDate: new Date('2021-03-23T09:00:00+0100'), endDate: new Date('2021-03-23T10:00:00+0100')}
      ];
      const startDate = new Date('2021-03-23T00:00:00+0100');
      const endDate = new Date('2021-03-23T00:00:00+0100');
      const allSlots = getSlots(startDate, endDate, baseUrl);

      const slots = getAvailableSlots(baseUrl, events, allSlots);
      console.log(slots);
      assert.deepStrictEqual(slots.length, 2);
      assert.deepStrictEqual(slots[1].startDate.getUTCHours(), 9);
      assert.deepStrictEqual(slots[1].endDate.getUTCHours(), 11);
    });
  });
});