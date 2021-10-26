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
export const correctConfig = "./test/configs/test-config.json";
export const transformationStoreRemoveFieldsConfig =
  "./test/configs/test-transformation-store-remove-fields-config.json";
export const aggregateNameConfig =
  "./test/configs/test-aggregate-name-config.json";
export const alternateConfig = "./test/configs/test-alternate-config.json";
export const keepEventsStoreConfig = "./test/configs/keep-events-store-config.json";
export const holidayStoreEmptyConfig = "./test/configs/test-holiday-store-empty-config.json";
export const holidayStoreIncorrectConfig = "./test/configs/test-holiday-store-incorrect-config.json";
export const aggregateStoreConfig = "./test/configs/test-aggregate-store-config.json"
export const transformationStoreEmptyConfig = "./test/configs/test-transformation-store-empty-config.json";
export const availabilityStoreConfig = "./test/configs/test-availability-store-config.json";
export const availabilityStoreAlternateConfig = "./test/configs/test-availability-store-alternate-config.json";
export const availabilityStoreNoStartDateConfig = "./test/configs/test-availability-store-no-start-date-config.json";
export const availabilityStoreWeekendConfig = "./test/configs/test-availability-store-weekend-config.json";
export const availabilityStoreAlternateWeekendConfig = "./test/configs/test-availability-store-alternate-weekend-config.json";
export const availabilityStoreHolidayConfig = "./test/configs/test-availability-store-holiday-config.json";
