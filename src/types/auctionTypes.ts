export interface Auction {
  id: string;
  title: string;
  description: string;
  category: string;
  grade: string;
  start_bid: number;
  start_date: Date;
  end_date: Date;
  image: string;
}

export interface Bid {
  bidder_name: string;
  amount: number;
  bid_time: string;
}

export interface AuctionResponse {
  auction: Auction | null;
  message: string;
}
