import fetch from "node-fetch";

/**
 * Performs a GET request on 1 of the endpoints and parses the response to JSON.
 * @param endpoint - The endpoint to GET
 * @returns The JSON parsed response text
 */
export const getEndpoint = async (endpoint: string): Promise<any> => {
  const response = await fetch(`http://localhost:3000/${endpoint}`);
  const text = await response.text();

  if (response.status !== 200) return response.status;

  if (response.headers.get("content-type") !== "text/calendar") {
    return JSON.parse(text);
  } else {
    return [text, "text/calendar"];
  }
};

// Configs
export const calendarStoreConfig = "./test/configs/calendar-store-config.json";
export const transformationStoreConfig = "./test/configs/transformation-store.json";
export const transformationStoreRemoveFieldsConfig =
  "./test/configs/transformation-store-remove-fields-config.json";
export const aggregateNameConfig =
  "./test/configs/aggregate-name-config.json";
export const alternateConfig = "./test/configs/alternate-config.json";
export const keepEventsStoreConfig = "./test/configs/keep-events-store-config.json";
export const keepEventsStoreOnlyUpcomingConfig = "./test/configs/keep-events-store-only-upcoming-config.json";
export const holidayStoreEmptyConfig = "./test/configs/holiday-store-empty-config.json";
export const holidayStoreIncorrectConfig = "./test/configs/holiday-store-incorrect-config.json";
export const holidayStoreConfig = "./test/configs/holiday-store-config.json";
export const aggregateStoreConfig = "./test/configs/aggregate-store-config.json"
export const transformationStoreEmptyConfig = "./test/configs/transformation-store-empty-config.json";
export const transformationStoreAlternateIcalServerConfig = "./test/configs/transformation-store-alternate-ical-server.json";
export const availabilityStoreConfig = "./test/configs/availability-store-config.json";
export const availabilityStoreAlternateConfig = "./test/configs/availability-store-alternate-config.json";
export const availabilityStoreNoStartDateConfig = "./test/configs/availability-store-no-start-date-config.json";
export const availabilityStoreWeekendConfig = "./test/configs/availability-store-weekend-config.json";
export const availabilityStoreAlternateWeekendConfig = "./test/configs/availability-store-alternate-weekend-config.json";
export const availabilityStoreHolidayConfig = "./test/configs/availability-store-holiday-config.json";
export const availabilityStorePregenerateConfig = "./test/configs/availability-store-pregenerate-config.json";
export const changeDurationStoreConfig = "./test/configs/change-duration-store-config.json";
export const vacationStoreConfig = "./test/configs/vacation-store-config.json";
export const vacationStoreAlternateConfig = "./test/configs/vacation-store-alternate-name-config.json";
