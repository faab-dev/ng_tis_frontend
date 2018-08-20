import { InstallerModule } from './installer.module';

describe('InstallerModule', () => {
  let installerModule: InstallerModule;

  beforeEach(() => {
    installerModule = new InstallerModule();
  });

  it('should create an instance', () => {
    expect(installerModule).toBeTruthy();
  });
});
