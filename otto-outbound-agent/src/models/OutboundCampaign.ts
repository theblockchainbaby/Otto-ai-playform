import { v4 as uuidv4 } from 'uuid';

export class OutboundCampaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;

  constructor(name: string, description: string, startDate: Date, endDate: Date) {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.status = 'pending';
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  updateStatus(newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}