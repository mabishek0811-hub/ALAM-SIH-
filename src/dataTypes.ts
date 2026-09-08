export type Batch = { id: string; producer: string; location: string; litres: number; mg: number; k: number; br: number; status: string; available: string }
export type TransactionStatus = 'Offer sent' | 'Negotiating' | 'Accepted' | 'Sample requested' | 'Pickup scheduled' | 'In transit' | 'Delivered'
export type Transaction = { id: string; batchId: string; buyer: string; producer: string; litres: number; price: number; status: TransactionStatus; updatedAt: string; note?: string }
export type BuyerRequirement = { id: string; buyer: string; material: string; litres: number; minMg: number; district: string; deadline: string; status: 'Active' | 'Matched' }
export type Notification = { id: string; title: string; detail: string; time: string; read: boolean; tone: 'blue' | 'green' | 'orange' }
