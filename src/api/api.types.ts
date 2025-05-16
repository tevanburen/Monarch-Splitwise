export interface PageContextMessage {
  isTvbMessage: true;
  source: 'page-context';
  type: 'authToken';
  payload: string;
}
