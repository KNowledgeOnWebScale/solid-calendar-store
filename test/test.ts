import { getSlots, getAvailableSlots, subtractEvents } from '../src/calendar-utils';
import * as assert from "assert";
import * as chai from 'chai';
import chaiExclude from 'chai-exclude';
import { expect } from 'chai';

chai.use(chaiExclude);

const baseUrl = 'http://example.com/';

describe('calendar', () => {
  it('get slots', () => {
    let startDate = new Date('2021-03-22T23:59:00+01:00');
    let endDate = new Date('2021-03-27T23:59:00+01:00');

    let slots = getSlots(startDate, endDate, baseUrl);
    assert.deepStrictEqual(slots.length, 10);

    startDate = new Date('2021-03-22T00:00:00+01:00');
    endDate = new Date('2021-03-27T00:00:00+01:00');

    slots = getSlots(startDate, endDate, baseUrl);
    assert.deepStrictEqual(slots.length, 10);
  });

  describe('get available slots', () => {
    it('#1', () => {
      const events = [
        {startDate: new Date('2021-03-23T09:00:00+0100'), endDate: new Date('2021-03-23T10:00:00+0100')}
      ];
      const startDate = new Date('2021-03-23T09:00:00+0100');
      const endDate = new Date('2021-03-24T17:00:00+0100');
      const allSlots = getSlots(startDate, endDate, baseUrl);

      const slots = getAvailableSlots(baseUrl, events, allSlots);
      //console.log(slots);
      assert.deepStrictEqual(slots.length, 4);
      assert.deepStrictEqual(slots[3].startDate.getUTCHours(), 9);
      assert.deepStrictEqual(slots[3].endDate.getUTCHours(), 11);
    });

    it('#2', () => {
      const events = [
        {startDate: new Date('2021-03-23T07:00:00+0100'), endDate: new Date('2021-03-23T23:00:00+0100')}
      ];
      const startDate = new Date('2021-03-23T00:00:00+0100');
      const endDate = new Date('2021-03-23T00:00:00+0100');
      const allSlots = getSlots(startDate, endDate, baseUrl);

      const slots = getAvailableSlots(baseUrl, events, allSlots);
      //console.log(slots);
      assert.deepStrictEqual(slots.length, 0);
    });

    it('#3', () => {
      const events = [
        {startDate: new Date('2021-03-23T07:00:00+0100'), endDate: new Date('2021-03-23T23:00:00+0100')}
      ];
      const startDate = new Date('2021-03-22T00:00:00+0100');
      const endDate = new Date('2021-03-24T00:00:00+0100');
      const allSlots = getSlots(startDate, endDate, baseUrl);

      const slots = getAvailableSlots(baseUrl, events, allSlots);
      //console.log(slots);
      assert.deepStrictEqual(slots.length, 4);
    });
  });

  describe('subtract events', () => {
    it('#1', () => {
      const events = [
        {startDate: new Date('2021-03-23T07:00:00+0100'), endDate: new Date('2021-03-23T23:00:00+0100')}
      ];
      const startDate = new Date('2021-03-22T00:00:00+0100');
      const endDate = new Date('2021-03-24T00:00:00+0100');
      const allSlots = getSlots(startDate, endDate, baseUrl);

      const result = subtractEvents(allSlots, events);
      const expectedResult = [
        {
          "uid": "http://example.com/slots#f43a85579151272ad7c30f2fd91c1a78",
          "startDate": new Date("2021-03-22T08:00:00.000Z"),
          "endDate": new Date("2021-03-22T11:00:00.000Z"),
          "summary": "Available for meetings"
        },
        {
          "uid": "http://example.com/slots#32f94323b9e1be3cb3b2f1279d524554",
          "startDate": new Date("2021-03-22T12:00:00.000Z"),
          "endDate": new Date("2021-03-22T16:00:00.000Z"),
          "summary": "Available for meetings"
        },
        {
          "uid": "http://example.com/slots#e1e2394e3307ab1d9e578ee7f2202670",
          "startDate": new Date("2021-03-24T12:00:00.000Z"),
          "endDate": new Date("2021-03-24T16:00:00.000Z"),
          "summary": "Available for meetings"
        },
        {
          "uid": "http://example.com/slots#d3d9fb9cec0903b0a77b9e7dc72ffd29",
          "startDate": new Date("2021-03-24T08:00:00.000Z"),
          "endDate": new Date("2021-03-24T11:00:00.000Z"),
          "summary": "Available for meetings"
        }
      ];

      expect(result).excluding('stampDate').to.deep.equal(expectedResult);
    });
  });
});