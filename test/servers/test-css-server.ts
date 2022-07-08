import {
  absoluteFilePath,
  AppRunner,
  App,
} from "@solid/community-server";
import type { IComponentsManagerBuilderOptions } from "componentsjs";

const appRunner = new AppRunner();

/**
 * loaderProperties and configVariables are variables required for the getApp() of appRunner.
 */

const loaderProperties: IComponentsManagerBuilderOptions<App> = {
  mainModulePath: absoluteFilePath("."),
};

const configVariables = {
  'urn:solid-server:default:variable:showStackTrace': true,
  'urn:solid-server:default:variable:loggingLevel': "Info",
  'urn:solid-server:default:variable:port': 3000,
  'urn:solid-server:default:variable:baseUrl': 'http://localhost:3000',
  'urn:solid-server:default:variable:seededPodConfigJson': null
};

/**
 * Wrapper around the App object to make it easy to start and stop it.
 */
export class CssServer {
  private app: App | undefined;

  public async start(configFile: string) {
    this.app = await appRunner.create(
      loaderProperties,
      configFile,
      configVariables
    );

    await this.app.start();
  }

  public async stop() {
    if (this.app) await this.app.stop();
  }
}
