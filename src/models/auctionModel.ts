import pool from '../config/database';
import { Auction } from '../types/auctionTypes';
import cron from 'node-cron';

export const createAuctionQuery = async (
  auctionData: Auction
): Promise<Auction> => {
  const {
    title,
    description,
    category,
    grade,
    start_bid,
    start_date,
    end_date,
    image,
    user_id,
  } = auctionData;

  console.log('Auction Data Received:', auctionData);

  // Ensure start_bid is a number, as it comes as a string
  const startBidNumber = Number(start_bid);
  if (isNaN(startBidNumber)) {
    throw new Error('Invalid start_bid value');
  }

  // Determine the initial status based on start and end dates
  let status: 'upcoming' | 'active' | 'ended';

  const now = new Date();
  if (end_date <= now) {
    status = 'ended';
  } else if (start_date <= now) {
    status = 'active';
  } else {
    status = 'upcoming';
  }

  const query = `
    INSERT INTO auctions (title, description, category, grade, start_bid, start_date, end_date, image, status, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const values = [
    title,
    description,
    category,
    grade,
    startBidNumber,
    start_date,
    end_date,
    image,
    status,
    user_id,
  ];
  const { rows } = await pool.query(query, values);
  console.log('Auction Created:', rows[0]);
  return rows[0];
};

// Schedule a task to handle auction lifecycle (ends auctions where the end_date has passed)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Update status to ended if the auction has passed
    const updateEndedQuery = `
      UPDATE auctions
      SET status = 'ended'
      WHERE end_date <= $1 AND status != 'ended'
      RETURNING id, title;
    `;
    const { rows: endedRows } = await pool.query(updateEndedQuery, [now]);
    if (endedRows.length > 0) {
      console.log('Auctions ended:', endedRows);
    }

    // Update status to active if the auction start date has reached
    const updateActiveQuery = `
      UPDATE auctions
      SET status = 'active'
      WHERE start_date <= $1 AND end_date > $1 AND status != 'active'
      RETURNING id, title;
    `;
    const { rows: activeRows } = await pool.query(updateActiveQuery, [now]);
    if (activeRows.length > 0) {
      console.log('Auctions activated:', activeRows);
    }

    if (activeRows.length > 0) {
      console.log(`Auctions ended:`, activeRows);
    }

    if (endedRows.length === 0 && activeRows.length === 0) {
      console.log('No auctions updated this cycle.');
    }
  } catch (error) {
    console.error('Error handling auction lifecycle:', error);
  }
});

export const fetchAllAuctionsQuery = async (): Promise<Auction[]> => {
  const query = `
    SELECT id, title, category, description, grade, start_bid, image, start_date, end_date, 
           CASE 
             WHEN end_date <= NOW() THEN 'ended'
             WHEN start_date > NOW() THEN 'upcoming'
             ELSE 'active'
           END AS status
    FROM auctions;
  `;
  const { rows } = await pool.query(query);

  return rows;
};

// getting auction details by ID
export const fetchAuctionById = async (id: number): Promise<Auction | null> => {
  try {
    const query = 'SELECT * FROM auctions WHERE id = $1';
    const values = [id]; // Using the numeric ID here
    const result = await pool.query(query, values);

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching auction by ID:', error);
    throw error;
  }
};

// getting auction details by user ID
export const fetchAuctionsByUserIdQuery = async (userId: number) => {
  try {
    const query = ` SELECT 
        a.id, 
        a.title AS auction_title, 
        a.start_bid,
        a.end_date,  
        a.image
       FROM auctions AS a
     WHERE a.user_id = $1;
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  } catch (error) {
    console.error('Error fetching auctions by user ID:', error);
    throw new Error('Database query failed');
  }
};

export const deleteAuctionByIDQuery = async (id: number): Promise<void> => {
  const query = 'DELETE FROM auctions WHERE id = $1';
  await pool.query(query, [id]);
};

export const updateAuctionQuery = async (
  auctionId: number,
  auctionData: any
): Promise<any> => {
  const { title, description, start_bid, start_date, end_date } = auctionData;

  // Determine the initial status based on start and end dates
  let status: 'upcoming' | 'active' | 'ended';

  const now = new Date();
  if (end_date <= now) {
    status = 'ended';
  } else if (start_date <= now) {
    status = 'active';
  } else {
    status = 'upcoming';
  }

  const updateQuery = `
    UPDATE auctions 
    SET title = $1, description = $2, start_bid = $3, status = $4, start_date = $5, end_date = $6 
    WHERE id = $7 RETURNING *;
  `;
  const { rows } = await pool.query(updateQuery, [
    title,
    description,
    start_bid,
    status,
    start_date,
    end_date,
    auctionId,
  ]);

  return rows[0];
};

// Schedule a task to handle auction lifecycle (ends auctions where the end_date has passed)
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();

    // Update status to ended if the auction has passed
    const updateEndedQuery = `
      UPDATE auctions
      SET status = 'ended'
      WHERE end_date <= $1 AND status != 'ended'
      RETURNING id, title;
    `;
    const { rows: endedRows } = await pool.query(updateEndedQuery, [now]);
    if (endedRows.length > 0) {
      console.log('Auctions ended:', endedRows);
    }

    // Update status to active if the auction start date has reached
    const updateActiveQuery = `
      UPDATE auctions
      SET status = 'active'
      WHERE start_date <= $1 AND end_date > $1 AND status != 'active'
      RETURNING id, title;
    `;
    const { rows: activeRows } = await pool.query(updateActiveQuery, [now]);
    if (activeRows.length > 0) {
      console.log('Auctions activated:', activeRows);
    }

    if (activeRows.length > 0) {
      console.log(`Auctions ended:`, activeRows);
    }

    if (endedRows.length === 0 && activeRows.length === 0) {
      console.log('No auctions updated this cycle.');
    }
  } catch (error) {
    console.error('Error handling auction lifecycle:', error);
  }
});
