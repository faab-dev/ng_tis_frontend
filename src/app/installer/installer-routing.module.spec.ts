import { InstallerRoutingModule } from './installer-routing.module';

describe('InstallerRoutingModule', () => {
  let installerRoutingModule: InstallerRoutingModule;

  beforeEach(() => {
    installerRoutingModule = new InstallerRoutingModule();
  });

  it('should create an instance', () => {
    expect(installerRoutingModule).toBeTruthy();
  });
});
