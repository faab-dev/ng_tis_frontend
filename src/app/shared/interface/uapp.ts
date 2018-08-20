export interface Uapp {
  id: string;
  app: string;
  platform: string;
  messageToken?: string;
  locale: string;
  data: string;
  whenCreated: number;
  whenUpdated?: number;
}
