import { TisAdminRoutingModule } from './tis-admin-routing.module';

describe('TisAdminRoutingModule', () => {
  let tisAdminRoutingModule: TisAdminRoutingModule;

  beforeEach(() => {
    tisAdminRoutingModule = new TisAdminRoutingModule();
  });

  it('should create an instance', () => {
    expect(tisAdminRoutingModule).toBeTruthy();
  });
});
