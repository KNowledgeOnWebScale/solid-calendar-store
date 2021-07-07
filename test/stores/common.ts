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
export const emptyConfig = "./test/configs/test-empty-config.json";
export const removeFieldsConfig =
  "./test/configs/test-remove-fields-config.json";
export const aggregateNameConfig =
  "./test/configs/test-aggregate-name-config.json";
export const incorrectConfig = "./test/configs/test-incorrect-config.json";
export const noStartDateConfig = "./test/configs/test-no-startDate-config.json";
export const weekendConfig = "./test/configs/test-weekend-config.json";
export const holidayConfig = "./test/configs/test-holiday-config.json";
