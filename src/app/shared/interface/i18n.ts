export interface I18n {
  id: string;
  key?: string;
  language: string;
  value: string;
  whenCreated: number;
  whenUpdated?: number;
  whenDeleted?: number;
}
