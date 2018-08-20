import { DevicesRoutingModule } from './devices-routing.module';

describe('DevicesRoutingModule', () => {
  let devicesRoutingModule: DevicesRoutingModule;

  beforeEach(() => {
    devicesRoutingModule = new DevicesRoutingModule();
  });

  it('should create an instance', () => {
    expect(devicesRoutingModule).toBeTruthy();
  });
});
