export interface WebSocketAction {
  code: number;
  content: {
    timeout?: number,
    otp?: string,
    phone?: string,
    no_connection: boolean;
  }
}
