import { TisAdminModule } from './tis-admin.module';

describe('TisAdminModule', () => {
  let tisAdminModule: TisAdminModule;

  beforeEach(() => {
    tisAdminModule = new TisAdminModule();
  });

  it('should create an instance', () => {
    expect(tisAdminModule).toBeTruthy();
  });
});
