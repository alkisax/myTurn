// Payloads των queue SignalR events που καταναλώνουν οι οθόνες.
export interface NowServingChangedEvent {
  number: number;
  deskId: number;
  queueId: number | string;
}

export interface NowServingEndedEvent {
  number: number;
  deskId: number;
  queueId: number | string;
}
