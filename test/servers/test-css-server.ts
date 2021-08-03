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
  showStackTrace: true,
  loggingLevel: "Info",
  port: 3000,
};

/**
 * Wrapper around the App object to make it easy to start and stop it.
 */
export class CssServer {
  private app: any;

  public async start(configFile: string) {
    this.app = await appRunner.createApp(
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
