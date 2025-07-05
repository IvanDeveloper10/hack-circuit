export interface Player {
  id: string;
  socketId: string;
  name: string;
  color: string;
  ready: boolean;
}

export interface Invitation {
  from: string;
  to: string;
  fromName: string;
  status: 'pending' | 'accepted' | 'rejected';
}