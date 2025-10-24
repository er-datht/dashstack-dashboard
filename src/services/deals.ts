/**
 * Deals Service Layer
 * API service functions for managing deal details
 * Handles API format conversion and data transformation
 */

import { apiService } from "./api";
import type { Deal, AlbumResponse } from "../types/deals";
import type { StatusType } from "../components/StatusBadge";

// Mock data generators for transforming album data to deals
/* cspell:disable */
const LOCATIONS = [
  "6096 Marjolaine Landing",
  "2463 Hackett Forge",
  "8924 Anderson Parkway",
  "1547 Mueller Station",
  "9821 Brekke Plaza",
];
/* cspell:enable */

const STATUSES: StatusType[] = ["Delivered", "Pending", "Rejected"];

const generateRandomLocation = (): string => {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
};

const generateRandomDateTime = (): string => {
  const day = Math.floor(Math.random() * 28) + 1;
  const month = Math.floor(Math.random() * 12) + 1;
  const year = 2024;
  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = Math.floor(Math.random() * 60);
  const period = Math.random() > 0.5 ? "PM" : "AM";

  return `${day.toString().padStart(2, "0")}.${month
    .toString()
    .padStart(2, "0")}.${year} - ${hour}:${minute
    .toString()
    .padStart(2, "0")} ${period}`;
};

const generateRandomAmount = (): number => {
  return Math.floor(Math.random() * 900) + 100;
};

const generateRandomPrice = (): string => {
  const price = Math.floor(Math.random() * 90000) + 10000;
  return `$${price.toLocaleString()}`;
};

const generateRandomStatus = (): StatusType => {
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
};

/**
 * Transform API album to internal Deal format
 * Since we're using the albums API, we need to transform it to match our Deal structure
 *
 * @param album - Album object from the API
 * @returns Transformed Deal for internal use
 */
export const transformAlbumToDeal = (album: AlbumResponse): Deal => ({
  id: album.id,
  name: album.title,
  location: generateRandomLocation(),
  datetime: generateRandomDateTime(),
  amount: generateRandomAmount(),
  price: generateRandomPrice(),
  status: generateRandomStatus(),
  image: "", // Placeholder for product image
});

/**
 * Fetch all deals from the API
 * Note: Using /albums endpoint as a placeholder since there's no real deals API
 */
export const fetchDeals = () =>
  apiService
    .get<AlbumResponse[]>("/albums")
    .then((data) => data.map(transformAlbumToDeal));
